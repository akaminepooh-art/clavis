import { useParams, Link } from 'react-router-dom'
import { useContents } from '../hooks/useContents'
import { StatusBadge } from '../components/StatusBadge'
import { DisclaimerBanner } from '../components/DisclaimerBanner'

export function ContentPage() {
  const { contentId } = useParams<{ contentId: string }>()
  const { contents, loading } = useContents()

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        読み込み中...
      </div>
    )
  }

  const content = contents.find((c) => c.id === contentId)
  if (!content) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">コンテンツが見つかりません</p>
        <Link to="/" className="text-cl-primary hover:underline mt-4 inline-block">
          トップへ戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-cl-primary no-underline mb-4 inline-block">
        &larr; トップへ戻る
      </Link>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
          <StatusBadge status={content.status} />
        </div>
        <p className="text-gray-600">{content.description}</p>

        {content.disclaimer_required && <DisclaimerBanner />}

        {content.url && content.status === 'live' ? (
          content.type === 'external' ? (
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-cl-primary text-white rounded-xl font-bold hover:bg-cl-primary-mid transition-colors no-underline"
            >
              開く &rarr;
            </a>
          ) : (
            <Link
              to={content.url}
              className="inline-block px-6 py-3 bg-cl-primary text-white rounded-xl font-bold hover:bg-cl-primary-mid transition-colors no-underline"
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
