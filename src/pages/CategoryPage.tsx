import { useParams, Link } from 'react-router-dom'
import { useContents } from '../hooks/useContents'
import { ContentCard } from '../components/ContentCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { DisclaimerBanner } from '../components/DisclaimerBanner'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../types'
import type { ContentCategory } from '../types'
import { interest } from '../utils/interest'
import { useEffect } from 'react'

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { contents, loading } = useContents()

  const category = categoryId as ContentCategory
  const label = CATEGORY_LABELS[category]
  const icon = CATEGORY_ICONS[category]
  const filtered = contents.filter((c) => c.category === category)
  const showDisclaimer = category === 'fun'

  const TRACKED_CATS = ['self', 'health', 'fun'] as const
  useEffect(() => {
    if (category && (TRACKED_CATS as readonly string[]).includes(category)) {
      interest.add(category as 'self' | 'health' | 'fun', 1)
    }
  }, [category])

  if (!label) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">カテゴリが見つかりません</p>
        <Link to="/" className="text-pk-primary hover:underline mt-4 inline-block">
          トップへ戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-pk-primary no-underline mb-4 inline-block">
        &larr; トップへ戻る
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {icon} {label}
      </h1>

      {showDisclaimer && (
        <div className="mb-4">
          <DisclaimerBanner />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          コンテンツを準備中です
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ContentCard key={c.id} content={c} />
          ))}
        </div>
      )}
    </div>
  )
}
