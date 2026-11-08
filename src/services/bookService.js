import { apiClient, IS_SUPABASE } from '../config/api'
import BOOKS_LOCAL from '../data/books'

// ---------------------------------------------------------------------------
// Helpers for local storage persistence
// ---------------------------------------------------------------------------
const LOCAL_BOOKS_KEY = 'bookvault_local_books'

export const getLocalBooks = () => {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  return BOOKS_LOCAL
}

export const saveLocalBooks = (books) => {
  try {
    localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(books))
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Normalizer — standardizes book shape from:
// 1. Supabase public.books (dedicated table)
// 2. Supabase public.products (shared praktikum table with specs metadata)
// 3. Local fallback objects
// ---------------------------------------------------------------------------
export const normalizeBook = (item) => {
  if (!item) return null

  let status = item.status || 'want_to_read'
  let year = item.year || null
  let pages = item.pages || null
  let tagsList = []
  let notes = item.notes || ''

  // Parse specs if received from public.products table
  if (Array.isArray(item.specs)) {
    item.specs.forEach((spec) => {
      if (typeof spec === 'string') {
        if (spec.startsWith('status:')) {
          status = spec.replace('status:', '').trim()
        } else if (spec.startsWith('year:')) {
          const val = Number(spec.replace('year:', '').trim())
          if (val) year = val
        } else if (spec.startsWith('pages:')) {
          const val = Number(spec.replace('pages:', '').trim())
          if (val) pages = val
        } else if (spec.startsWith('tags:')) {
          tagsList = spec
            .replace('tags:', '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        } else if (spec.startsWith('notes:')) {
          notes = spec.replace('notes:', '').trim()
        }
      }
    })
  } else if (Array.isArray(item.tags)) {
    tagsList = item.tags
  } else if (typeof item.tags === 'string') {
    tagsList = item.tags.split(',').map((t) => t.trim()).filter(Boolean)
  }

  const title = item.title || item.name || 'Untitled Book'
  const author = item.author || item.caliber || 'Unknown Author'
  const genre = item.genre || item.type || item.category || 'General'
  const rating = Number(item.rating ?? item.price ?? 0)

  return {
    id: item.id,
    title,
    author,
    genre,
    status: ['reading', 'read', 'want_to_read'].includes(status) ? status : 'want_to_read',
    rating: isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating)),
    cover_url: item.cover_url || item.image_url || null,
    description: item.description || '',
    year: year || item.published_year || null,
    pages: pages || item.page_count || null,
    tags: tagsList,
    notes,
    created_at: item.created_at || new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// BookService — resilient CRUD implementation
// Supports both custom 'books' table and shared 'products' table on Supabase,
// with automatic fallback to localStorage.
// ---------------------------------------------------------------------------
class BookService {
  constructor() {
    this.table = 'products' // Default to products table available on praktikum Supabase
    this.checkedTable = false
  }

  async resolveTable() {
    if (this.checkedTable) return this.table
    try {
      // Check if custom 'books' table exists
      await apiClient.get('/rest/v1/books?select=id&limit=1')
      this.table = 'books'
    } catch {
      // Fallback to 'products' table which exists on praktikum Supabase
      this.table = 'products'
    }
    this.checkedTable = true
    return this.table
  }

  async getBooks(params = {}) {
    if (IS_SUPABASE) {
      try {
        const table = await this.resolveTable()
        const queryParts = ['select=*']

        if (table === 'books') {
          if (params.search) {
            queryParts.push(
              `or=(title.ilike.*${encodeURIComponent(params.search)}*,author.ilike.*${encodeURIComponent(params.search)}*)`,
            )
          }
          if (params.genre && params.genre !== 'All') {
            queryParts.push(`genre=eq.${encodeURIComponent(params.genre)}`)
          }
          if (params.status && params.status !== 'All') {
            queryParts.push(`status=eq.${encodeURIComponent(params.status)}`)
          }
        }

        queryParts.push('order=created_at.desc')
        if (params.limit) queryParts.push(`limit=${params.limit}`)

        const data = await apiClient.get(`/rest/v1/${table}?${queryParts.join('&')}`)

        if (Array.isArray(data)) {
          let list = data.map(normalizeBook)

          // If querying shared 'products' table, filter only book entries
          if (table === 'products') {
            list = list.filter((b) => {
              const raw = data.find((d) => d.id === b.id)
              const hasAppTag =
                Array.isArray(raw?.specs) &&
                raw.specs.some((s) => typeof s === 'string' && s.includes('bookvault'))
              // Also keep any non-gun looking items or user items
              return hasAppTag || (b.author && b.author !== '9mm')
            })
          }

          // If database is empty, merge with initial seed books
          if (list.length === 0) {
            list = getLocalBooks()
          } else {
            saveLocalBooks(list)
          }

          return { success: true, data: list }
        }
      } catch (err) {
        console.warn('[BookService] Supabase fetch failed, using local storage:', err.message)
      }
    }

    // Offline / Local Storage fallback
    const local = getLocalBooks()
    return { success: true, data: local }
  }

  async getBookById(id) {
    if (IS_SUPABASE && !String(id).startsWith('local-')) {
      try {
        const table = await this.resolveTable()
        const data = await apiClient.get(`/rest/v1/${table}?id=eq.${id}&select=*`)
        if (Array.isArray(data) && data.length > 0) {
          return { success: true, data: normalizeBook(data[0]) }
        }
      } catch {
        /* fallback to local below */
      }
    }

    const local = getLocalBooks().find((b) => String(b.id) === String(id))
    if (local) return { success: true, data: local }
    throw new Error('Book not found.')
  }

  async createBook(data) {
    // Construct book object
    const newBook = {
      id: `local-${Date.now()}`,
      title: data.title,
      author: data.author || 'Unknown',
      genre: data.genre || 'General',
      status: data.status || 'want_to_read',
      rating: Number(data.rating ?? 0),
      cover_url: data.cover_url || null,
      description: data.description || '',
      year: data.year ? Number(data.year) : null,
      pages: data.pages ? Number(data.pages) : null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    }

    if (IS_SUPABASE) {
      try {
        const table = await this.resolveTable()

        if (table === 'books') {
          const payload = {
            title: newBook.title,
            author: newBook.author,
            genre: newBook.genre,
            status: newBook.status,
            rating: newBook.rating,
            cover_url: newBook.cover_url,
            description: newBook.description,
            year: newBook.year,
            pages: newBook.pages,
            tags: newBook.tags,
            notes: newBook.notes,
          }
          const res = await apiClient.post('/rest/v1/books', payload, {
            headers: { Prefer: 'return=representation' },
          })
          const created = Array.isArray(res) ? res[0] : res
          const normalized = normalizeBook(created)
          this._syncLocalAdd(normalized)
          return { success: true, data: normalized }
        } else {
          // Map to 'products' table
          const specs = [
            'app:bookvault',
            `status:${newBook.status}`,
            `year:${newBook.year || ''}`,
            `pages:${newBook.pages || ''}`,
            `tags:${newBook.tags.join(',')}`,
            `notes:${newBook.notes}`,
          ]
          const payload = {
            name: newBook.title,
            type: newBook.genre,
            caliber: newBook.author,
            price: newBook.rating,
            description: newBook.description,
            image_url: newBook.cover_url,
            specs,
          }
          const res = await apiClient.post('/rest/v1/products', payload, {
            headers: { Prefer: 'return=representation' },
          })
          const created = Array.isArray(res) ? res[0] : res
          const normalized = normalizeBook(created)
          this._syncLocalAdd(normalized)
          return { success: true, data: normalized }
        }
      } catch (err) {
        console.warn('[BookService] Online save failed, saving to local storage:', err.message)
      }
    }

    // Save locally
    this._syncLocalAdd(newBook)
    return { success: true, data: newBook }
  }

  async updateBook(id, data) {
    if (IS_SUPABASE && !String(id).startsWith('local-')) {
      try {
        const table = await this.resolveTable()

        if (table === 'books') {
          const payload = {
            updated_at: new Date().toISOString(),
          }
          if (data.title !== undefined) payload.title = data.title
          if (data.author !== undefined) payload.author = data.author
          if (data.genre !== undefined) payload.genre = data.genre
          if (data.status !== undefined) payload.status = data.status
          if (data.rating !== undefined) payload.rating = Number(data.rating)
          if (data.cover_url !== undefined) payload.cover_url = data.cover_url
          if (data.description !== undefined) payload.description = data.description
          if (data.year !== undefined) payload.year = data.year ? Number(data.year) : null
          if (data.pages !== undefined) payload.pages = data.pages ? Number(data.pages) : null
          if (data.tags !== undefined) payload.tags = Array.isArray(data.tags) ? data.tags : []
          if (data.notes !== undefined) payload.notes = data.notes

          const res = await apiClient.patch(`/rest/v1/books?id=eq.${id}`, payload, {
            headers: { Prefer: 'return=representation' },
          })
          const updated = Array.isArray(res) ? res[0] : res
          const normalized = normalizeBook(updated)
          this._syncLocalUpdate(id, normalized)
          return { success: true, data: normalized }
        } else {
          // Map to 'products' table
          const specs = [
            'app:bookvault',
            `status:${data.status || 'want_to_read'}`,
            `year:${data.year || ''}`,
            `pages:${data.pages || ''}`,
            `tags:${Array.isArray(data.tags) ? data.tags.join(',') : ''}`,
            `notes:${data.notes || ''}`,
          ]
          const payload = {
            name: data.title,
            type: data.genre,
            caliber: data.author,
            price: Number(data.rating || 0),
            description: data.description,
            image_url: data.cover_url,
            specs,
            updated_at: new Date().toISOString(),
          }
          const res = await apiClient.patch(`/rest/v1/products?id=eq.${id}`, payload, {
            headers: { Prefer: 'return=representation' },
          })
          const updated = Array.isArray(res) ? res[0] : res
          const normalized = normalizeBook(updated)
          this._syncLocalUpdate(id, normalized)
          return { success: true, data: normalized }
        }
      } catch (err) {
        console.warn('[BookService] Online update failed, saving locally:', err.message)
      }
    }

    // Local update
    this._syncLocalUpdate(id, data)
    return { success: true, data: { id, ...data } }
  }

  async deleteBook(id) {
    if (IS_SUPABASE && !String(id).startsWith('local-')) {
      try {
        const table = await this.resolveTable()
        await apiClient.delete(`/rest/v1/${table}?id=eq.${id}`)
      } catch (err) {
        console.warn('[BookService] Online delete failed:', err.message)
      }
    }

    this._syncLocalDelete(id)
    return { success: true }
  }

  _syncLocalAdd(book) {
    const list = getLocalBooks()
    const updated = [book, ...list.filter((b) => b.id !== book.id)]
    saveLocalBooks(updated)
  }

  _syncLocalUpdate(id, data) {
    const list = getLocalBooks()
    const updated = list.map((b) => (String(b.id) === String(id) ? { ...b, ...data } : b))
    saveLocalBooks(updated)
  }

  _syncLocalDelete(id) {
    const list = getLocalBooks()
    const updated = list.filter((b) => String(b.id) !== String(id))
    saveLocalBooks(updated)
  }
}

export default new BookService()
