import { Link } from 'react-router-dom'
import type { Content } from '../types'
import { CATEGORY_DEFAULTS } from '../types'
import { StatusBadge } from './StatusBadge'
import { interest } from '../utils/interest'

const TRACKED = ['self', 'health', 'fortune', 'game'] as const
type TrackedCat = typeof TRACKED[number]

function trackClick(category: string) {
  if ((TRACKED as readonly string[]).includes(category)) {
    interest.add(category as TrackedCat, 1)
  }
}

export function ContentCard({ content }: { content: Content }) {
  const thumbnail = content.thumbnail_url ?? CATEGORY_DEFAULTS[content.category]
  const isClickable = content.status === 'live' && content.url
  const grayscale = content.status !== 'live'

  const card = (
    <div
      className={`group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-all duration-200 ${
        isClickable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'opacity-80'
      }`}
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={thumbnail}
          alt={content.title}
          className={`w-full h-full object-cover ${grayscale ? 'grayscale opacity-60' : ''}`}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = CATEGORY_DEFAULTS[content.category]
          }}
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={content.status} />
        </div>
        {content.type === 'external' && content.status === 'live' && (
          <div className="absolute top-2 left-2">
            <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-white/90 text-gray-500 border border-gray-200">
              &#8599; 外部アプリ
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-base text-gray-900 mb-1">{content.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{content.description}</p>
        {content.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-pk-primary-light text-pk-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (isClickable && content.url) {
    if (content.type === 'external') {
      return (
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
          onClick={() => trackClick(content.category)}
        >
          {card}
        </a>
      )
    }
    return (
      <Link
        to={content.url}
        className="no-underline"
        onClick={() => trackClick(content.category)}
      >
        {card}
      </Link>
    )
  }

  return card
}
