import { useState } from 'react'
import { ArrowLeft, Loader, CheckCircle, AlertCircle, Star } from 'lucide-react'
import bookService from '../services/bookService'

const GENRES = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Technology', 'History', 'Self-Help', 'Biography', 'Romance', 'Horror', 'Other']
const STATUSES = [
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'reading', label: 'Currently Reading' },
  { value: 'read', label: 'Already Read' },
]

/**
 * AddBookPage — form to create a new book entry
 */
export default function AddBookPage({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: 'Fiction',
    status: 'want_to_read',
    rating: 0,
    year: '',
    pages: '',
    cover_url: '',
    description: '',
    tags: '',
    notes: '',
  })
  const [hoverRating, setHoverRating] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.author.trim()) { setError('Author is required.'); return }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre,
      status: form.status,
      rating: form.status === 'read' ? Number(form.rating) : 0,
      year: form.year ? Number(form.year) : null,
      pages: form.pages ? Number(form.pages) : null,
      cover_url: form.cover_url.trim() || null,
      description: form.description.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: form.notes.trim(),
    }

    try {
      setSaving(true)
      const res = await bookService.createBook(payload)
      if (res.success || res.data) {
        setSuccess('Book added to your library!')
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data)
          else if (onBack) onBack()
        }, 1200)
      } else {
        throw new Error(res.message || 'Failed to save book.')
      }
    } catch (err) {
      setError(err.message || 'Error saving book.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-head">
        <button type="button" className="detail-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Library
        </button>
      </div>

      <div className="form-title-block">
        <h1>Add a New Book</h1>
        <p className="page-lede">Catalog a new title in your personal library.</p>
      </div>

      {error && (
        <div className="toast toast--error">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="toast toast--success">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      <form className="entry-form" onSubmit={handleSubmit}>
        {/* Core details */}
        <div className="form-section">
          <h2 className="form-section-title">Book Details</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="book-title" className="form-label">
                Title <span className="req">*</span>
              </label>
              <input
                id="book-title"
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. The Great Gatsby"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-author" className="form-label">
                Author <span className="req">*</span>
              </label>
              <input
                id="book-author"
                type="text"
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="e.g. F. Scott Fitzgerald"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-grid form-grid--3">
            <div className="form-group">
              <label htmlFor="book-genre" className="form-label">Genre</label>
              <select
                id="book-genre"
                value={form.genre}
                onChange={(e) => set('genre', e.target.value)}
                className="form-select"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="book-year" className="form-label">Year Published</label>
              <input
                id="book-year"
                type="number"
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
                placeholder="e.g. 1925"
                min="1000"
                max={new Date().getFullYear()}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-pages" className="form-label">Page Count</label>
              <input
                id="book-pages"
                type="number"
                value={form.pages}
                onChange={(e) => set('pages', e.target.value)}
                placeholder="e.g. 320"
                min="1"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="book-desc" className="form-label">Description</label>
            <textarea
              id="book-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="A short summary of the book..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="book-cover" className="form-label">Cover Image URL</label>
            <input
              id="book-cover"
              type="url"
              value={form.cover_url}
              onChange={(e) => set('cover_url', e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="book-tags" className="form-label">Tags (comma-separated)</label>
            <input
              id="book-tags"
              type="text"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="e.g. classic, fiction, american"
              className="form-input"
            />
          </div>
        </div>

        {/* Reading status */}
        <div className="form-section">
          <h2 className="form-section-title">Reading Status</h2>

          <div className="status-selector">
            {STATUSES.map((s) => (
              <label key={s.value} className={`status-option${form.status === s.value ? ' status-option--active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={form.status === s.value}
                  onChange={(e) => set('status', e.target.value)}
                  className="sr-only"
                />
                {s.label}
              </label>
            ))}
          </div>

          {/* Rating — only shown when status is "read" */}
          {form.status === 'read' && (
            <div className="form-group">
              <label className="form-label">My Rating</label>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="star-pick-btn"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => set('rating', n)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={28}
                      fill={n <= (hoverRating || form.rating) ? 'var(--accent)' : 'none'}
                      stroke={n <= (hoverRating || form.rating) ? 'var(--accent)' : '#ccc'}
                    />
                  </button>
                ))}
                <span className="star-label">
                  {form.rating > 0 ? `${form.rating}/5` : 'No rating'}
                </span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="book-notes" className="form-label">Personal Notes</label>
            <textarea
              id="book-notes"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Your thoughts, quotes, page numbers to revisit..."
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="button" className="btn btn--outline" onClick={onBack} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? (
              <><Loader size={16} className="spin" /> Saving…</>
            ) : (
              'Add to Library'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
