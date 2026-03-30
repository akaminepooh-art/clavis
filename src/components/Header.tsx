import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Header() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 no-underline shrink-0">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'var(--color-pk-primary)' }}
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <circle cx="7" cy="5.5" r="3" stroke="white" strokeWidth="1.2"/>
              <path d="M7 8.5V13" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M5 11h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="text-sm font-bold text-pk-primary tracking-wide">PORTAKEY</span>
        </Link>

        {/* Inline search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs hidden sm:flex">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 w-full">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-3 h-3 text-gray-400 shrink-0">
              <circle cx="5" cy="5" r="3.5"/><path d="M8 8l2.5 2.5" strokeLinecap="round"/>
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="診断・健康・占い..."
              className="text-xs bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full"
            />
          </div>
        </form>

        {/* Right: mobile search icon */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/search" className="sm:hidden text-gray-500 hover:text-pk-primary no-underline text-xs">
            🔍
          </Link>
        </div>
      </div>
    </header>
  )
}
