import { useState, useEffect, useCallback } from 'react'
import bookService from '../services/bookService'
import BOOKS_LOCAL from '../data/books'

// ---------------------------------------------------------------------------
// useBooks — fetch the full book list from API, with localStorage fallback
// ---------------------------------------------------------------------------
export function useBooks(params = {}) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const paramKey = JSON.stringify(params)

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getBooks(params)
      if (response.success) {
        setBooks(response.data || [])
      } else {
        throw new Error(response.message || 'Failed to fetch books.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching books.')
      setBooks(BOOKS_LOCAL.map((b, i) => ({ ...b, id: b.id || `local-${i}` })))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey])

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const response = await bookService.getBooks(params)
        if (!ignore) {
          if (response.success) {
            setBooks(response.data || [])
          } else {
            throw new Error(response.message || 'Failed to fetch books.')
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'An error occurred while fetching books.')
          setBooks(BOOKS_LOCAL.map((b, i) => ({ ...b, id: b.id || `local-${i}` })))
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey])

  return { books, loading, error, refetch: fetchBooks }
}

// ---------------------------------------------------------------------------
// useBookById — fetch a single book by ID
// ---------------------------------------------------------------------------
export function useBookById(id) {
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBook = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getBookById(id)
      if (response.success) {
        setBook(response.data)
      } else {
        setError(response.message || 'Book not found.')
      }
    } catch (err) {
      setError(err.message || 'Failed to load book details.')
      setBook(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) {
      return
    }
    let ignore = false

    async function load() {
      try {
        const response = await bookService.getBookById(id)
        if (!ignore) {
          if (response.success) {
            setBook(response.data)
          } else {
            setError(response.message || 'Book not found.')
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load book details.')
          setBook(null)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [id])

  return { book, loading, error, refetch: fetchBook }
}
