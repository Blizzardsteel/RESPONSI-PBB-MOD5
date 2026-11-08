import { ArrowLeft, Star, BookOpen, Calendar, Hash } from 'lucide-react'
import { statusLabel, statusColor, formatRating } from '../../utils/helpers'

/**
 * BookDetail — full detail view for a single book
 */
export default function BookDetail({ book, onBack, onEdit, onDelete }) {
  const badgeColor = statusColor(book.status)

  return (
    <div className="detail">
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Library
      </button>

      <div className="detail-hero">
        {/* Cover */}
        <div className="detail-cover-wrap">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="detail-cover-img" />
          ) : (
            <div className="detail-cover-placeholder">
              <BookOpen size={64} stroke="rgba(255,255,255,0.4)" />
              <span className="detail-genre-label">{book.genre}</span>
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="detail-info">
          <span
            className="detail-status-badge"
            style={{ background: badgeColor }}
          >
            {statusLabel(book.status)}
          </span>
          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">by {book.author}</p>

          {book.rating > 0 && (
            <div className="detail-rating">
              <Star size={16} fill="var(--accent)" stroke="var(--accent)" />
              <span>{book.rating}/5 &mdash; {formatRating(book.rating)}</span>
            </div>
          )}

          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <BookOpen size={14} />
              <span>{book.genre}</span>
            </div>
            {book.year && (
              <div className="detail-meta-item">
                <Calendar size={14} />
                <span>{book.year}</span>
              </div>
            )}
            {book.pages && (
              <div className="detail-meta-item">
                <Hash size={14} />
                <span>{book.pages} pages</span>
              </div>
            )}
          </div>

          {book.tags && book.tags.length > 0 && (
            <div className="detail-tags">
              {book.tags.map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          )}

          <div className="detail-actions">
            {onEdit && (
              <button type="button" className="btn btn--outline" onClick={() => onEdit(book)}>
                Edit Book
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn--danger" onClick={() => onDelete(book)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <section className="detail-section">
          <h2>Description</h2>
          <p>{book.description}</p>
        </section>
      )}

      {/* Reading Notes */}
      {book.notes && (
        <section className="detail-section">
          <h2>My Notes</h2>
          <p className="detail-notes">{book.notes}</p>
        </section>
      )}
    </div>
  )
}
