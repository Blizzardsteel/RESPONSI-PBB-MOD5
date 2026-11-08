import { BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'Home', label: 'Home' },
  { id: 'Library', label: 'Library' },
  { id: 'Wishlist', label: 'Wishlist' },
  { id: 'Profile', label: 'Profile' },
]

function Header({ tab, onTab }) {
  return (
    <header className="header">
      <div
        className="header-brand"
        onClick={() => onTab('Home')}
        style={{ cursor: 'pointer' }}
      >
        <div className="header-logo">
          <BookOpen size={20} stroke="#f5f0e8" />
        </div>
        <span className="brand-name">BookVault</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-link${tab === item.id ? ' active' : ''}`}
            onClick={() => onTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

export default Header
