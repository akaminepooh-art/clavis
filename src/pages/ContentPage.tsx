import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useContents } from '../hooks/useContents'
import { StatusBadge } from '../components/StatusBadge'
import { DisclaimerBanner } from '../components/DisclaimerBanner'
import { CATEGORY_ICONS } from '../types'
import { interest } from '../utils/interest'
import type { ContentCategory } from '../types'

// Categories tracked by interest system
const TRACKED: ContentCategory[] = ['self', 'health', 'fun']

export function ContentPage() {
  const { contentId } = useParams<{ contentId: string }>()
  const { contents, loading } = useContents()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const content = contents.find((c) => c.id === contentId)

  // Interest tracking: +2 after 10 seconds on page
  useEffect(() => {
    if (!content) return
    if (!TRACKED.includes(content.category as ContentCategory)) return

    timerRef.current = setTimeout(() => {
      interest.add(content.category as 'self' | 'health' | 'fun', 2)
    }, 10_000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [content])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        読み込み中...
      </div>
    )
  }

  if (!content) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">コンテンツが見つかりません</p>
        <Link to="/" className="text-pk-primary hover:underline mt-4 inline-block">
          トップへ戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-pk-primary no-underline mb-4 inline-block">
        &larr; トップへ戻る
      </Link>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl">{CATEGORY_ICONS[content.category]}</span>
          <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
          <StatusBadge status={content.status} />
        </div>
        <p className="text-gray-600">{content.description}</p>

        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-pk-primary-light text-pk-primary">
                {tag}
              </span>
            ))}
          </div>
        )}

        {content.disclaimer_required && <DisclaimerBanner />}

        {content.url && content.status === 'live' ? (
          content.type === 'external' ? (
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (TRACKED.includes(content.category as ContentCategory)) {
                  interest.add(content.category as 'self' | 'health' | 'fun', 1)
                }
              }}
              className="inline-block px-6 py-3 bg-pk-primary text-white rounded-xl font-bold hover:bg-pk-primary-mid transition-colors no-underline"
            >
              開く &rarr;
            </a>
          ) : (
            <Link
              to={content.url}
              className="inline-block px-6 py-3 bg-pk-primary text-white rounded-xl font-bold hover:bg-pk-primary-mid transition-colors no-underline"
            >
              はじめる &rarr;
            </Link>
          )
        ) : (
          <p className="text-sm text-gray-400">このコンテンツは現在準備中です</p>
        )}
      </div>
    </div>
  )
}
