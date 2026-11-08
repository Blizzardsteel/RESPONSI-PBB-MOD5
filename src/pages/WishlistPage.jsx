import { useMemo } from 'react'
import { BookMarked, BookOpen, ArrowRight } from 'lucide-react'
import { useBooks } from '../hooks/useBooks'
import BookCard from '../components/book/BookCard'
import BookDetail from '../components/book/BookDetail'
import { useState } from 'react'

/**
 * WishlistPage — shows only books with status "want_to_read"
 */
export default function WishlistPage({ onNavigate }) {
  const { books, loading } = useBooks({ limit: 100 })
  const [selectedBook, setSelectedBook] = useState(null)

  const wishlist = useMemo(
    () => books.filter((b) => b.status === 'want_to_read'),
    [books],
  )

  const readingNow = useMemo(
    () => books.filter((b) => b.status === 'reading'),
    [books],
  )

  if (selectedBook) {
    return (
      <BookDetail
        book={selectedBook}
        onBack={() => setSelectedBook(null)}
        onEdit={(b) => onNavigate('Edit', b)}
        onDelete={() => setSelectedBook(null)}
      />
    )
  }

  return (
    <div className="wishlist-page">
      <section className="page-masthead">
        <h1>Reading Tracker</h1>
        <p className="page-lede">
          Books you want to read and those you&apos;re currently working through.
        </p>
      </section>

      {/* Currently Reading */}
      <section className="wishlist-section">
        <div className="section-head">
          <h2>
            <BookOpen size={20} stroke="var(--status-reading)" />
            Currently Reading
          </h2>
          <span className="count-badge">{readingNow.length}</span>
        </div>

        {readingNow.length === 0 ? (
          <div className="state-box">
            <p>No books in progress. Start reading something!</p>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onNavigate('Library')}
            >
              <ArrowRight size={14} /> Go to Library
            </button>
          </div>
        ) : (
          <ul className="book-grid">
            {readingNow.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={setSelectedBook}
                onEdit={(b) => onNavigate('Edit', b)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Wishlist */}
      <section className="wishlist-section">
        <div className="section-head">
          <h2>
            <BookMarked size={20} stroke="var(--status-wishlist)" />
            Want to Read
          </h2>
          <span className="count-badge">{wishlist.length}</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="state-box">
            <p>Your wishlist is empty. Add books you plan to read!</p>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => onNavigate('Create')}
            >
              + Add a Book
            </button>
          </div>
        ) : (
          <ul className="book-grid">
            {wishlist.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={setSelectedBook}
                onEdit={(b) => onNavigate('Edit', b)}
              />
            ))}
          </ul>
        )}
      </section>

      {loading && (
        <p className="loading-hint">Loading…</p>
      )}
    </div>
  )
}
