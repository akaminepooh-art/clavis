import { Link } from 'react-router-dom'
import { getSeasonConfig } from '../utils/season'

export function FarmBanner({ highlight = false }: { highlight?: boolean }) {
  const season = getSeasonConfig()

  return (
    <Link
      to="/category/farm"
      className={`block rounded-2xl p-5 transition-all duration-200 ${
        highlight
          ? 'bg-cl-green border-2 border-cl-green-mid shadow-md'
          : 'bg-cl-green/60 border border-cl-green-mid/30'
      } hover:shadow-md no-underline`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">&#127827;</span>
        <div>
          <p className="font-bold text-cl-green-dark">あっきらきら農園</p>
          <p className="text-sm text-cl-green-mid">{season.farmMessage}</p>
        </div>
        <span className="ml-auto text-cl-green-mid">&rarr;</span>
      </div>
    </Link>
  )
}
