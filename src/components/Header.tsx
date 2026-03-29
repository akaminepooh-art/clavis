import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-cl-primary font-bold text-xl no-underline">
          <span className="text-2xl">&#128273;</span>
          CLAVIS
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/category/self" className="text-gray-600 hover:text-cl-primary no-underline hidden sm:block">
            診断
          </Link>
          <Link to="/category/fun" className="text-gray-600 hover:text-cl-primary no-underline hidden sm:block">
            占い
          </Link>
          <Link to="/history" className="text-gray-600 hover:text-cl-primary no-underline hidden sm:block">
            履歴
          </Link>
          <a
            href="https://factum.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-full border border-cl-primary-border text-cl-primary hover:bg-cl-primary-light no-underline transition-colors"
          >
            FACTUM &rarr;
          </a>
        </nav>
      </div>
    </header>
  )
}
