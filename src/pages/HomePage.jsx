import { BookOpen, BookMarked, Star, TrendingUp } from 'lucide-react'
import { useBooks } from '../hooks/useBooks'
import { statusColor } from '../utils/helpers'

/**
 * HomePage — landing dashboard with library statistics
 */
export default function HomePage({ onNavigate }) {
  const { books } = useBooks({ limit: 100 })

  const stats = {
    total: books.length,
    read: books.filter((b) => b.status === 'read').length,
    reading: books.filter((b) => b.status === 'reading').length,
    wishlist: books.filter((b) => b.status === 'want_to_read').length,
    avgRating: books.filter((b) => b.rating > 0).length > 0
      ? (books.filter((b) => b.rating > 0).reduce((a, b) => a + b.rating, 0) /
         books.filter((b) => b.rating > 0).length).toFixed(1)
      : '—',
  }

  const recentBooks = [...books]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4)

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-title">Your Personal Library</h1>
          <p className="home-subtitle">
            Track every book you&apos;ve read, are reading, or plan to read.
            Build your literary legacy, one page at a time.
          </p>
          <div className="home-cta-row">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onNavigate('Library')}
            >
              <BookOpen size={18} /> Browse Library
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => onNavigate('Create')}
            >
              + Add a Book
            </button>
          </div>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <div className="bookstack">
            <div className="bookstack-book" style={{ background: '#3498db', height: 60 }} />
            <div className="bookstack-book" style={{ background: '#e74c3c', height: 50 }} />
            <div className="bookstack-book" style={{ background: '#2ecc71', height: 70 }} />
            <div className="bookstack-book" style={{ background: '#9b59b6', height: 45 }} />
            <div className="bookstack-book" style={{ background: '#f39c12', height: 55 }} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="home-stats">
        <div className="stat-card">
          <BookOpen size={24} stroke="var(--accent)" />
          <div className="stat-num">{stats.total}</div>
          <div className="stat-name">Total Books</div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} stroke={statusColor('reading')} />
          <div className="stat-num">{stats.reading}</div>
          <div className="stat-name">Reading Now</div>
        </div>
        <div className="stat-card">
          <BookMarked size={24} stroke={statusColor('read')} />
          <div className="stat-num">{stats.read}</div>
          <div className="stat-name">Books Read</div>
        </div>
        <div className="stat-card">
          <Star size={24} stroke="var(--accent)" />
          <div className="stat-num">{stats.avgRating}</div>
          <div className="stat-name">Avg Rating</div>
        </div>
      </section>

      {/* Recent additions */}
      {recentBooks.length > 0 && (
        <section className="home-recent">
          <div className="section-head">
            <h2>Recently Added</h2>
            <button
              type="button"
              className="link-btn"
              onClick={() => onNavigate('Library')}
            >
              View all →
            </button>
          </div>
          <ul className="recent-list">
            {recentBooks.map((book) => (
              <li key={book.id} className="recent-item">
                <div
                  className="recent-cover"
                  style={{ background: `hsl(${hashColor(book.title)}, 55%, 45%)` }}
                >
                  <BookOpen size={22} stroke="rgba(255,255,255,0.7)" />
                </div>
                <div className="recent-info">
                  <span className="recent-title">{book.title}</span>
                  <span className="recent-author">{book.author}</span>
                  <span
                    className="recent-status"
                    style={{ color: statusColor(book.status) }}
                  >
                    {book.status === 'reading' ? '📖 Reading' :
                     book.status === 'read' ? '✅ Read' : '📋 Wishlist'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reading tips */}
      <section className="home-tips">
        <h2>How BookVault Works</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">📚</span>
            <h3>Build Your Library</h3>
            <p>Add books with full details — title, author, genre, year, and page count.</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">📊</span>
            <h3>Track Progress</h3>
            <p>Mark books as &ldquo;Want to Read&rdquo;, &ldquo;Reading&rdquo;, or &ldquo;Read&rdquo; to track your journey.</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">⭐</span>
            <h3>Rate & Review</h3>
            <p>Give star ratings and add personal notes for each book you&apos;ve read.</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">📱</span>
            <h3>Works Offline</h3>
            <p>Install as a PWA and access your library even without an internet connection.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Deterministic hue from string */
function hashColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}
