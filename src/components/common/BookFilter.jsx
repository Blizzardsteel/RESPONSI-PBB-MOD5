import { Search, SlidersHorizontal } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Status' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
  { value: 'want_to_read', label: 'Want to Read' },
]

export default function BookFilter({
  search,
  onSearch,
  genres,
  activeGenre,
  onGenre,
  activeStatus,
  onStatus,
  sortKey,
  sortOrder,
  onSort,
}) {
  return (
    <div className="book-filter">
      {/* Search */}
      <div className="filter-search">
        <Search size={16} className="filter-search-icon" />
        <input
          type="search"
          placeholder="Search title, author…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="filter-input"
          aria-label="Search books"
        />
      </div>

      {/* Genre pills */}
      <div className="filter-pills">
        {genres.map((g) => (
          <button
            key={g}
            type="button"
            className={`pill${activeGenre === g ? ' pill--active' : ''}`}
            onClick={() => onGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Status & Sort row */}
      <div className="filter-row">
        <div className="filter-status">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`status-pill${activeStatus === s.value ? ' status-pill--active' : ''}`}
              onClick={() => onStatus(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="filter-sort">
          <SlidersHorizontal size={14} />
          <select
            value={`${sortKey}_${sortOrder}`}
            onChange={(e) => {
              const [key, order] = e.target.value.split('_')
              onSort({ key, order })
            }}
            className="filter-select"
            aria-label="Sort books"
          >
            <option value="title_asc">Title A→Z</option>
            <option value="title_desc">Title Z→A</option>
            <option value="author_asc">Author A→Z</option>
            <option value="rating_desc">Rating High→Low</option>
            <option value="year_desc">Year New→Old</option>
            <option value="year_asc">Year Old→New</option>
          </select>
        </div>
      </div>
    </div>
  )
}
