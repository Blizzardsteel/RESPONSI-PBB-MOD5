// ---------------------------------------------------------------------------
// helpers.js — shared utility functions
// ---------------------------------------------------------------------------

/** Filter by search query against title/author/description */
export const matchesSearch = (item, query) => {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    (item.title || '').toLowerCase().includes(q) ||
    (item.author || '').toLowerCase().includes(q) ||
    (item.description || '').toLowerCase().includes(q)
  )
}

/** Filter by genre */
export const matchesGenre = (item, genre) => {
  if (!genre || genre === 'All') return true
  return (item.genre || '').toLowerCase() === genre.toLowerCase()
}

/** Filter by reading status */
export const matchesStatus = (item, status) => {
  if (!status || status === 'All') return true
  return (item.status || '') === status
}

/** Sort books by key */
export const sortBooks = (books, key = 'title', order = 'asc') => {
  const sorted = [...books].sort((a, b) => {
    if (key === 'rating') return (Number(a.rating) || 0) - (Number(b.rating) || 0)
    if (key === 'year') return (Number(a.year) || 0) - (Number(b.year) || 0)
    if (key === 'pages') return (Number(a.pages) || 0) - (Number(b.pages) || 0)
    return String(a[key] || '').localeCompare(String(b[key] || ''))
  })
  return order === 'desc' ? sorted.reverse() : sorted
}

/** Extract unique genres */
export const extractGenres = (books) => {
  const set = new Set()
  books.forEach((b) => { if (b.genre) set.add(b.genre) })
  return ['All', ...Array.from(set).sort()]
}

/** Truncate text */
export const truncate = (str, max = 100) => {
  if (!str || str.length <= max) return str || ''
  return str.slice(0, max).trimEnd() + '…'
}

/** Format star rating display */
export const formatRating = (rating) => {
  const n = Number(rating) || 0
  return '★'.repeat(Math.floor(n)) + '☆'.repeat(5 - Math.floor(n))
}

/** Human-readable status label */
export const statusLabel = (status) => {
  const labels = {
    reading: 'Currently Reading',
    read: 'Read',
    want_to_read: 'Want to Read',
  }
  return labels[status] || status
}

/** Status color class */
export const statusColor = (status) => {
  const colors = {
    reading: '#2ecc71',
    read: '#3498db',
    want_to_read: '#e67e22',
  }
  return colors[status] || '#95a5a6'
}
