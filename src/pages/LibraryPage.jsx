import { useState, useMemo, useCallback } from 'react'
import { Plus, RefreshCw, Loader, AlertCircle, BookOpen } from 'lucide-react'
import { useBooks } from '../hooks/useBooks'
import BookCard from '../components/book/BookCard'
import BookDetail from '../components/book/BookDetail'
import BookFilter from '../components/common/BookFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import bookService from '../services/bookService'
import { matchesSearch, matchesGenre, matchesStatus, sortBooks, extractGenres } from '../utils/helpers'

/**
 * LibraryPage — main book catalog with CRUD: list, search, filter, sort, delete, navigate to add/edit
 */
export default function LibraryPage({ onNavigate }) {
  const { books, loading, error, refetch } = useBooks({ limit: 100 })

  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')
  const [activeStatus, setActiveStatus] = useState('All')
  const [sortKey, setSortKey] = useState('title')
  const [sortOrder, setSortOrder] = useState('asc')

  const [selectedBook, setSelectedBook] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const genres = useMemo(() => extractGenres(books), [books])

  const filtered = useMemo(() => {
    const result = books.filter(
      (b) =>
        matchesSearch(b, search) &&
        matchesGenre(b, activeGenre) &&
        matchesStatus(b, activeStatus),
    )
    return sortBooks(result, sortKey, sortOrder)
  }, [books, search, activeGenre, activeStatus, sortKey, sortOrder])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setDeleteError('')
      await bookService.deleteBook(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete book.')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, refetch])

  if (selectedBook) {
    return (
      <BookDetail
        book={selectedBook}
        onBack={() => setSelectedBook(null)}
        onEdit={(b) => onNavigate('Edit', b)}
        onDelete={(b) => { setSelectedBook(null); setDeleteTarget(b) }}
      />
    )
  }

  return (
    <>
      <section className="page-masthead">
        <h1>My Library</h1>
        <p className="page-lede">
          Your complete book collection — browse, filter, and manage every title.
        </p>
      </section>

      <div className="list-toolbar">
        <div className="list-toolbar-left">
          <span className="count-badge">{filtered.length} books</span>
        </div>
        <div className="list-toolbar-right">
          <button type="button" className="btn btn--outline btn--sm" onClick={refetch}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => onNavigate('Create')}
          >
            <Plus size={14} /> Add Book
          </button>
        </div>
      </div>

      <BookFilter
        search={search}
        onSearch={setSearch}
        genres={genres}
        activeGenre={activeGenre}
        onGenre={setActiveGenre}
        activeStatus={activeStatus}
        onStatus={setActiveStatus}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={({ key, order }) => { setSortKey(key); setSortOrder(order) }}
      />

      {loading && (
        <div className="state-box">
          <Loader size={28} className="spin" />
          <p>Loading your library…</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-box state-box--warn">
          <AlertCircle size={24} />
          <p>Could not reach server. Showing cached data.</p>
          <button type="button" className="btn btn--outline btn--sm" onClick={refetch}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="state-box">
          <BookOpen size={36} />
          <p>No books match your filters.</p>
          {books.length === 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onNavigate('Create')}
            >
              <Plus size={16} /> Add Your First Book
            </button>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <ul className="book-grid">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={setSelectedBook}
              onEdit={(b) => onNavigate('Edit', b)}
              onDelete={setDeleteTarget}
            />
          ))}
        </ul>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Remove Book"
        message={`Are you sure you want to remove "${deleteTarget?.title}" from your library? This cannot be undone.`}
        confirmLabel="Remove"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError('') }}
      />
      {deleteError && <div className="toast toast--error">{deleteError}</div>}
    </>
  )
}
