import { Link } from 'react-router-dom'
import { useContents } from '../hooks/useContents'
import { ContentCard } from '../components/ContentCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { FarmBanner } from '../components/FarmBanner'
import { SeasonBanner } from '../components/SeasonBanner'
import { CATEGORY_LABELS } from '../types'
import type { ContentCategory } from '../types'

const CATEGORIES: ContentCategory[] = ['self', 'health', 'fun', 'farm']

export function TopPage() {
  const { contents, loading } = useContents()
  const featured = contents.filter((c) => c.is_featured)

  const tsumugiSeries = contents.filter((c) => c.id.endsWith('-tsumugi') || c.id === 'hoshitsumugi')
  const voltSeries = contents.filter((c) => c.id.endsWith('volt'))

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-cl-primary-light via-white to-cl-lavender py-16 px-4 text-center overflow-hidden">
        <img
          src="/images/hero-bg.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-5xl mb-4">&#128273;</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-cl-primary mb-3">
            CLAVIS
          </h1>
          <p className="text-lg text-gray-600 mb-2">人生の扉を開く鍵</p>
          <p className="text-sm text-gray-500">
            診断・占い・生活改善・農園体験を束ねるライフナビゲーション
          </p>
        </div>
      </section>


      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Season Banner */}
        <SeasonBanner />

        {/* Featured */}
        {(loading || featured.length > 0) && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">&#11088; おすすめ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                : featured.map((c) => <ContentCard key={c.id} content={c} />)}
            </div>
          </section>
        )}

        {/* つむぎシリーズ */}
        {tsumugiSeries.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">&#128302; つむぎシリーズ</h2>
              <p className="text-sm text-gray-500 mt-1">四柱推命・風水・姓名判断・相性・夢占い</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tsumugiSeries.map((c) => <ContentCard key={c.id} content={c} />)}
            </div>
          </section>
        )}

        {/* VOLTシリーズ */}
        {voltSeries.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">&#9889; VOLTシリーズ</h2>
              <p className="text-sm text-gray-500 mt-1">認知能力・職業適性・色彩認知・意思決定・起業家タイプ</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {voltSeries.map((c) => <ContentCard key={c.id} content={c} />)}
            </div>
          </section>
        )}

        {/* Categories */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">カテゴリ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all no-underline"
              >
                <div className="text-2xl mb-2">
                  {cat === 'self' && '\u{1F9E0}'}
                  {cat === 'health' && '\u{1F3E5}'}
                  {cat === 'fun' && '\u{1F52E}'}
                  {cat === 'farm' && '\u{1F353}'}
                </div>
                <p className="text-sm font-bold text-gray-700">{CATEGORY_LABELS[cat]}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {contents.filter((c) => c.category === cat).length}件
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Farm Banner */}
        <FarmBanner />

        {/* All contents */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">すべてのコンテンツ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : contents.map((c) => <ContentCard key={c.id} content={c} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
