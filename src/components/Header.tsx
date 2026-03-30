import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-pk-primary font-bold text-xl no-underline">
          <span className="text-2xl">&#128273;</span>
          PORTAKEY
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/category/self" className="text-gray-600 hover:text-pk-primary no-underline hidden sm:block">
            診断
          </Link>
          <Link to="/category/fun" className="text-gray-600 hover:text-pk-primary no-underline hidden sm:block">
            占い
          </Link>
          <Link to="/search" className="text-gray-600 hover:text-pk-primary no-underline hidden sm:block">
            検索
          </Link>
          <a
            href="https://aperis.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-full border border-pk-primary-border text-pk-primary hover:bg-pk-primary-light no-underline transition-colors"
          >
            APERIS &rarr;
          </a>
        </nav>
      </div>
    </header>
  )
}
