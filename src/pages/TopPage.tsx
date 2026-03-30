import { Link } from 'react-router-dom'
import { useContents } from '../hooks/useContents'
import { useColumns } from '../hooks/useColumns'
import { useWeather } from '../hooks/useWeather'
import { usePersonalized } from '../hooks/usePersonalized'
import { ContentCard } from '../components/ContentCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../types'
import type { ContentCategory } from '../types'
import type { Column } from '../types'
import { getHeroCopy, WEEKLY_FEATURES } from '../data/heroCopies'
import { hashDate, shuffleSeed, weekNumber } from '../utils/seed'

const CATEGORIES: ContentCategory[] = ['self', 'health', 'fun', 'pet']

const COLUMN_CATEGORY_LABELS: Record<string, string> = {
  health: '健康',
  self: '自己理解',
  nature: '自然',
  science: 'サイエンス',
  seasonal: '季節',
}

function WeatherIcon({ weather }: { weather: string }) {
  if (weather === 'rainy') return <span>🌧️</span>
  if (weather === 'cloudy') return <span>☁️</span>
  return <span>☀️</span>
}

function SeasonLabel({ season }: { season: string }) {
  const map: Record<string, string> = {
    spring: '春',
    summer: '夏',
    autumn: '秋',
    winter: '冬',
  }
  return <span>{map[season] ?? season}</span>
}

function ColumnCard({ column }: { column: Column }) {
  return (
    <article className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pk-primary-light text-pk-primary">
          {COLUMN_CATEGORY_LABELS[column.category] ?? column.category}
        </span>
        {column.related_app && (
          <span className="text-xs text-gray-400">→ {column.related_app}</span>
        )}
      </div>
      <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1">
        {column.title}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
        {column.desc}
      </p>
    </article>
  )
}

export function TopPage() {
  const { contents, loading } = useContents()
  const { weather, season } = useWeather()
  const today = new Date()
  const seed = hashDate(today)
  const weekNum = weekNumber(today)

  // Daily pickup: 3 items from live content, seed-shuffled
  const liveContents = contents.filter((c) => c.status === 'live')
  const dailyPickup = shuffleSeed(liveContents, seed).slice(0, 3)

  // Weekly feature
  const weeklyFeature = WEEKLY_FEATURES[weekNum % WEEKLY_FEATURES.length]

  // Weather-filtered columns (up to 6)
  const { filtered: weatherColumns } = useColumns({ season, weather, limit: 6 })

  // Personalization
  const { isPersonalized, topCategory, personalizedContents } = usePersonalized({
    contents,
    columns: [],
  })

  const heroCopy = getHeroCopy(weather, season)

  const tsumugiSeries = contents.filter(
    (c) => c.tags?.includes('つむぎ')
  )
  const voltSeries = contents.filter((c) => c.tags?.includes('VOLT'))

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-pk-primary-light via-white to-pk-lavender py-16 px-4 text-center overflow-hidden">
        <img
          src="/images/hero-bg.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3 text-sm text-gray-500">
            <WeatherIcon weather={weather} />
            <SeasonLabel season={season} />
            <span>·</span>
            <span>{weeklyFeature}</span>
          </div>
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-pk-primary mb-3">
            PORTAKEY
          </h1>
          <p className="text-base text-gray-600 mb-2 font-medium">{heroCopy}</p>
          <p className="text-sm text-gray-400">
            人生の扉を開く鍵 — 診断・占い・健康・ペットケア
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">

        {/* Daily Pickup */}
        {(loading || dailyPickup.length > 0) && (
          <section>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">✨ 今日のピックアップ</h2>
              <span className="text-xs text-gray-400">毎日自動更新</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                : dailyPickup.map((c) => <ContentCard key={c.id} content={c} />)}
            </div>
          </section>
        )}

        {/* Personalized section — shown when interest.total() >= 3 */}
        {isPersonalized && !loading && (
          <section>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {CATEGORY_ICONS[topCategory as ContentCategory] ?? '🎯'} あなたへのおすすめ
              </h2>
              <span className="text-xs text-gray-400">閲覧履歴に基づく</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalizedContents
                .filter((c) => c.status === 'live')
                .slice(0, 6)
                .map((c) => <ContentCard key={c.id} content={c} />)}
            </div>
          </section>
        )}

        {/* Today's columns — weather × season filtered */}
        {weatherColumns.length > 0 && (
          <section>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                <WeatherIcon weather={weather} /> 今日のコラム
              </h2>
              <span className="text-xs text-gray-400">
                <SeasonLabel season={season} /> · {weather === 'sunny' ? '晴れ' : weather === 'rainy' ? '雨' : '曇り'}の日に読む
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {weatherColumns.map((col) => (
                <ColumnCard key={col.id} column={col} />
              ))}
            </div>
          </section>
        )}

        {/* つむぎシリーズ */}
        {!loading && tsumugiSeries.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">🔮 つむぎシリーズ</h2>
              <p className="text-sm text-gray-500 mt-1">四柱推命・風水・姓名判断・相性・夢占い</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tsumugiSeries.map((c) => <ContentCard key={c.id} content={c} />)}
            </div>
          </section>
        )}

        {/* VOLTシリーズ */}
        {!loading && voltSeries.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">⚡ VOLTシリーズ</h2>
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
                <div className="text-2xl mb-2">{CATEGORY_ICONS[cat]}</div>
                <p className="text-sm font-bold text-gray-700">{CATEGORY_LABELS[cat]}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {contents.filter((c) => c.category === cat).length}件
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* All contents */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">すべてのコンテンツ</h2>
            <Link to="/search" className="text-sm text-pk-primary hover:underline">
              検索 →
            </Link>
          </div>
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
