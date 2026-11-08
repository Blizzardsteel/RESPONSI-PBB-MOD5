import { useState } from 'react'
import { Save, Camera, Shield, BookOpen, Star, BookMarked } from 'lucide-react'
import userService from '../services/userService'
import { useBooks } from '../hooks/useBooks'

/**
 * ProfilePage — displays student identity and library statistics
 * 
 * Student: Kevin Novantino Hindiarto
 * NIM: 21120124140109
 * Kelompok: 27
 */
export default function ProfilePage() {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [username, setUsername] = useState(profile.username || 'Kevin')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [feedback, setFeedback] = useState('')

  const { books } = useBooks({ limit: 100 })

  const stats = {
    total: books.length,
    read: books.filter((b) => b.status === 'read').length,
    reading: books.filter((b) => b.status === 'reading').length,
    wishlist: books.filter((b) => b.status === 'want_to_read').length,
    pagesRead: books
      .filter((b) => b.status === 'read' && b.pages)
      .reduce((sum, b) => sum + (Number(b.pages) || 0), 0),
    topGenres: (() => {
      const counts = {}
      books.forEach((b) => {
        if (b.genre) counts[b.genre] = (counts[b.genre] || 0) + 1
      })
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre)
    })(),
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setFeedback('Avatar must be under 2MB.')
      setTimeout(() => setFeedback(''), 3000)
      return
    }
    const reader = new FileReader()
    reader.onload = (evt) => {
      const b64 = evt.target.result
      setAvatar(b64)
      userService.updateAvatar(b64)
      setFeedback('Avatar updated.')
      setTimeout(() => setFeedback(''), 3000)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = (e) => {
    e.preventDefault()
    const result = userService.saveUserProfile({
      ...profile,
      username: username.trim() || 'Kevin',
      bio: bio.trim(),
      avatar,
    })
    if (result.success) {
      setProfile(result.data)
      setFeedback('Profile saved successfully.')
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  return (
    <div className="profile-page">
      <section className="page-masthead">
        <h1>My Profile</h1>
        <p className="page-lede">Your reader identity and library statistics.</p>
      </section>

      {feedback && (
        <div className="toast toast--success">{feedback}</div>
      )}

      {/* Identity Card — fixed student info */}
      <div className="identity-card">
        <div className="identity-card-header">
          <Shield size={18} stroke="var(--accent)" />
          <span>Student Identity</span>
        </div>
        <div className="identity-fields">
          <div className="identity-field">
            <span className="identity-label">Full Name</span>
            <span className="identity-value">{profile.name}</span>
          </div>
          <div className="identity-field">
            <span className="identity-label">NIM</span>
            <span className="identity-value mono">{profile.nim}</span>
          </div>
          <div className="identity-field">
            <span className="identity-label">Kelompok</span>
            <span className="identity-value">{profile.kelompok}</span>
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {avatar ? (
              <img src={avatar} alt={username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <span className="avatar-initials">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <label htmlFor="avatar-input" className="avatar-upload-btn" title="Change avatar">
              <Camera size={14} />
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden-file-input"
              />
            </label>
          </div>

          <div className="profile-identity">
            <h2>{username}</h2>
            <p className="profile-nim">NIM: {profile.nim}</p>
            <p className="profile-kelompok">Kelompok {profile.kelompok}</p>
          </div>
        </div>

        {/* Reading Stats */}
        <div className="profile-stats">
          <div className="pstat">
            <BookOpen size={20} stroke="var(--accent)" />
            <span className="pstat-num">{stats.total}</span>
            <span className="pstat-label">Total Books</span>
          </div>
          <div className="pstat">
            <span className="pstat-emoji">📖</span>
            <span className="pstat-num">{stats.reading}</span>
            <span className="pstat-label">Reading</span>
          </div>
          <div className="pstat">
            <BookMarked size={20} stroke="#3498db" />
            <span className="pstat-num">{stats.read}</span>
            <span className="pstat-label">Books Read</span>
          </div>
          <div className="pstat">
            <Star size={20} stroke="var(--accent)" />
            <span className="pstat-num">{stats.pagesRead.toLocaleString()}</span>
            <span className="pstat-label">Pages Read</span>
          </div>
        </div>

        {stats.topGenres.length > 0 && (
          <div className="profile-genres">
            <span className="profile-genres-label">Favorite Genres:</span>
            <div className="profile-genres-pills">
              {stats.topGenres.map((g) => (
                <span key={g} className="tag-pill">{g}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit form */}
      <form className="profile-form" onSubmit={handleSave}>
        <h3 className="form-section-title">Reader Details</h3>

        <div className="form-group">
          <label htmlFor="prof-username" className="form-label">Display Name</label>
          <input
            id="prof-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            placeholder="Your display name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="prof-bio" className="form-label">About Me</label>
          <textarea
            id="prof-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="form-textarea"
            placeholder="Share your reading interests, favorite authors..."
          />
        </div>

        <button type="submit" className="btn btn--primary">
          <Save size={16} /> Save Profile
        </button>
      </form>
    </div>
  )
}
