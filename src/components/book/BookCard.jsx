import { truncate, statusLabel, statusColor, formatRating } from '../../utils/helpers'
import { BookOpen } from 'lucide-react'

/**
 * BookCard — card for the library grid
 */
export default function BookCard({ book, onSelect, onEdit, onDelete }) {
  const statusBadge = statusLabel(book.status)
  const badgeColor = statusColor(book.status)
  const stars = book.rating ? formatRating(book.rating) : null

  return (
    <li className="book-card">
      <button
        type="button"
        className="book-card-btn"
        onClick={() => onSelect && onSelect(book)}
        aria-label={`View ${book.title}`}
      >
        {/* Cover */}
        <div className="book-cover">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="book-cover-img" loading="lazy" />
          ) : (
            <div className="book-cover-placeholder">
              <BookOpen size={36} stroke="rgba(255,255,255,0.4)" />
              <span className="book-cover-genre">{book.genre}</span>
            </div>
          )}
          <span
            className="book-status-badge"
            style={{ background: badgeColor }}
          >
            {statusBadge}
          </span>
        </div>

        {/* Info */}
        <div className="book-info">
          <span className="book-title">{book.title}</span>
          <span className="book-author">{book.author}</span>
          {stars && <span className="book-stars">{stars}</span>}
          {book.description && (
            <span className="book-desc">{truncate(book.description, 80)}</span>
          )}
          <span className="book-meta">
            {book.genre}
            {book.year ? ` · ${book.year}` : ''}
            {book.pages ? ` · ${book.pages} pp` : ''}
          </span>
        </div>
      </button>

      {/* Action buttons */}
      {(onEdit || onDelete) && (
        <div className="book-card-actions">
          {onEdit && (
            <button
              type="button"
              className="card-act-btn"
              onClick={(e) => { e.stopPropagation(); onEdit(book) }}
              title="Edit"
              aria-label={`Edit ${book.title}`}
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="card-act-btn card-act-btn--danger"
              onClick={(e) => { e.stopPropagation(); onDelete(book) }}
              title="Delete"
              aria-label={`Delete ${book.title}`}
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </li>
  )
}
