import { useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import HomePage from './pages/HomePage.jsx'
import LibraryPage from './pages/LibraryPage.jsx'
import WishlistPage from './pages/WishlistPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AddBookPage from './pages/AddBookPage.jsx'
import EditBookPage from './pages/EditBookPage.jsx'
import bookService from './services/bookService.js'
import './App.css'

function App() {
  const [tab, setTab] = useState('Home')
  const [mode, setMode] = useState('list') // 'list' | 'create' | 'edit'
  const [editingBook, setEditingBook] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Edit') {
      setEditingBook(payload)
      setMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setTab(target)
      setMode('list')
      setEditingBook(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setMode('list')
    setEditingBook(null)
  }

  const handleSuccess = () => {
    setMode('list')
    setEditingBook(null)
    setTab('Library')
  }

  return (
    <div className="shell">
      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(t) => handleNavigate(t)}
      />

      <main className="main">
        {mode === 'create' && (
          <AddBookPage onBack={handleBack} onSuccess={handleSuccess} />
        )}

        {mode === 'edit' && (
          <EditBookPage
            book={editingBook}
            bookId={editingBook?.id}
            onBack={handleBack}
            onSuccess={handleSuccess}
          />
        )}

        {mode === 'list' && (
          <>
            {tab === 'Home' && <HomePage onNavigate={handleNavigate} />}
            {tab === 'Library' && <LibraryPage onNavigate={handleNavigate} />}
            {tab === 'Wishlist' && <WishlistPage onNavigate={handleNavigate} />}
            {tab === 'Profile' && <ProfilePage />}
          </>
        )}
      </main>

      {/* Global delete confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove Book"
        message={`Are you sure you want to remove "${deleteTarget?.title}"?`}
        confirmLabel="Remove"
        danger
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            setDeleting(true)
            await bookService.deleteBook(deleteTarget.id)
            setDeleteTarget(null)
            handleBack()
          } catch (err) {
            alert(err.message || 'Failed to delete book.')
          } finally {
            setDeleting(false)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <PWABadge />
      <Footer />
    </div>
  )
}

export default App
