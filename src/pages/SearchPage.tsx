import { useEffect } from 'react'
import { useContents } from '../hooks/useContents'
import { useColumns } from '../hooks/useColumns'
import { useSearch } from '../hooks/useSearch'
import { ContentCard } from '../components/ContentCard'
import type { Column } from '../types'

const COLUMN_CATEGORY_LABELS: Record<string, string> = {
  health: '健康',
  self: '自己理解',
  nature: '自然',
  science: 'サイエンス',
  seasonal: '季節',
}

function ColumnResult({ column }: { column: Column }) {
  return (
    <article className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pk-primary-light text-pk-primary">
          コラム
        </span>
        <span className="text-xs text-gray-400">
          {COLUMN_CATEGORY_LABELS[column.category] ?? column.category}
        </span>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1">{column.title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{column.desc}</p>
      {column.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {column.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export function SearchPage() {
  const { contents } = useContents()
  const { columns } = useColumns()
  const { query, setQuery, results, hasQuery } = useSearch({ contents, columns })

  // ?q= パラメータからの検索（ヘッダー検索ボックス）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) setQuery(decodeURIComponent(q))
  }, [])

  const contentResults = results.filter((r) => r.kind === 'content')
  const columnResults = results.filter((r) => r.kind === 'column')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🔍 検索</h1>
        <p className="text-sm text-gray-500 mb-4">
          コンテンツとコラムをまとめて検索できます
        </p>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードを入力（例：占い、健康、姿勢）"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-pk-primary-border focus:border-transparent"
            autoFocus
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
        </div>
      </div>

      {/* Results */}
      {hasQuery && (
        <div className="space-y-8">
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🔑</div>
              <p className="text-sm">「{query}」に一致するコンテンツが見つかりませんでした</p>
            </div>
          ) : (
            <>
              {/* Content results */}
              {contentResults.length > 0 && (
                <section>
                  <h2 className="text-base font-bold text-gray-700 mb-3">
                    コンテンツ ({contentResults.length}件)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contentResults.map((r) =>
                      r.kind === 'content' ? (
                        <ContentCard key={r.item.id} content={r.item} />
                      ) : null
                    )}
                  </div>
                </section>
              )}

              {/* Column results */}
              {columnResults.length > 0 && (
                <section>
                  <h2 className="text-base font-bold text-gray-700 mb-3">
                    コラム ({columnResults.length}件)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {columnResults.map((r) =>
                      r.kind === 'column' ? (
                        <ColumnResult key={r.item.id} column={r.item} />
                      ) : null
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasQuery && (
        <div className="text-center py-16 text-gray-300">
          <div className="text-6xl mb-4">🔑</div>
          <p className="text-sm">キーワードを入力して検索</p>
        </div>
      )}
    </div>
  )
}
