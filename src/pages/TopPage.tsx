import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useContents } from '../hooks/useContents'
import { useColumns } from '../hooks/useColumns'
import { useWeather } from '../hooks/useWeather'
import { ContentCard } from '../components/ContentCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { StatusBadge } from '../components/StatusBadge'
import { WeatherWidget } from '../components/WeatherWidget'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../types'
import type { ContentCategory, Content, Column } from '../types'
import { getHeroCopy, WEEKLY_FEATURES } from '../data/heroCopies'
import { hashDate, shuffleSeed, weekNumber } from '../utils/seed'
import { interest } from '../utils/interest'

// URLパラメータ ?result=xxx&from=xxx → category map
const APP_CATEGORY_MAP: Record<string, 'self' | 'health' | 'fun'> = {
  inniq: 'self',
  iq: 'self',
  beauty: 'self',
  work: 'self',
  hoshi: 'fun',
  kaze: 'fun',
  mei: 'fun',
  en: 'fun',
  yume: 'fun',
}

// ────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────
const ALL_CATEGORIES: ContentCategory[] = ['self', 'health', 'fun', 'pet']

const SEASON_BADGE: Record<string, string> = {
  spring: '🌸 春',
  summer: '☀️ 夏',
  autumn: '🍂 秋',
  winter: '❄️ 冬',
}

const WEATHER_LABEL: Record<string, string> = {
  sunny: '晴れ',
  cloudy: '曇り',
  rainy: '雨',
}

const COMING_SOON = [
  '夢占い詳細版', 'カラータイプ診断', '決断力診断', '睡眠タイプ診断',
  '強み発見テスト', 'ロト統計', '防災チェックリスト', 'BERRYBODY姿勢分析',
  '美容タイプ診断', '農園体験予約',
]

// ────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────

function StatsBar({ total, liveCount }: { total: number; liveCount: number }) {
  return (
    <div className="flex justify-center gap-6 sm:gap-10 mt-5 text-sm text-gray-600">
      <div className="text-center">
        <span className="block text-xl font-bold text-pk-primary">{total}+</span>
        <span className="text-xs text-gray-400">コンテンツ</span>
      </div>
      <div className="text-center">
        <span className="block text-xl font-bold text-pk-primary">4</span>
        <span className="text-xs text-gray-400">カテゴリ</span>
      </div>
      <div className="text-center">
        <span className="block text-xl font-bold text-pk-primary">{liveCount}</span>
        <span className="text-xs text-gray-400">公開中</span>
      </div>
      <div className="text-center">
        <span className="block text-xl font-bold text-pk-primary">無料</span>
        <span className="text-xs text-gray-400">すべて</span>
      </div>
      <div className="text-center">
        <span className="block text-xl font-bold text-pk-primary">随時</span>
        <span className="text-xs text-gray-400">追加中</span>
      </div>
    </div>
  )
}

function CategoryTabs({
  active,
  onChange,
  contents,
}: {
  active: ContentCategory | 'all'
  onChange: (c: ContentCategory | 'all') => void
  contents: Content[]
}) {
  const tabs: (ContentCategory | 'all')[] = ['all', ...ALL_CATEGORIES]
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((cat) => {
        const count = cat === 'all'
          ? contents.length
          : contents.filter((c) => c.category === cat).length
        const isActive = active === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              isActive
                ? 'bg-pk-primary text-white border-pk-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-pk-primary-border'
            }`}
          >
            {cat !== 'all' && <span>{CATEGORY_ICONS[cat]}</span>}
            <span>{cat === 'all' ? 'すべて' : CATEGORY_LABELS[cat]}</span>
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function FortuneWidget() {
  const stored = typeof window !== 'undefined'
    ? localStorage.getItem('pk_fortune_birthdate')
    : null

  if (stored) {
    return (
      <div className="bg-gradient-to-r from-pk-lavender to-pk-primary-light rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">🔮 今日の運勢</p>
            <p className="text-xs text-gray-400">生年月日 {stored} 登録済み</p>
          </div>
          <Link
            to="/apps/fortune"
            className="bg-pk-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-pk-primary-mid transition-colors no-underline"
          >
            運勢を見る →
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          ※占いは娯楽目的です。実際の判断は科学的根拠に基づいてください。
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-pk-lavender to-pk-primary-light rounded-2xl p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-gray-900 mb-1">🔮 今日の運勢を占う</p>
        <p className="text-xs text-gray-500">生年月日を入力するだけ。毎日自動更新。</p>
        <p className="text-xs text-gray-400 mt-1">※占いは娯楽目的です</p>
      </div>
      <Link
        to="/apps/fortune"
        className="shrink-0 bg-pk-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-pk-primary-mid transition-colors no-underline"
      >
        無料で占う
      </Link>
    </div>
  )
}

function LargeContentCard({ content }: { content: Content }) {
  const isClickable = content.status === 'live' && content.url
  const grayscale = content.status !== 'live'

  const card = (
    <div
      className={`group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-all ${
        isClickable ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : 'opacity-75'
      }`}
    >
      <div className={`aspect-video bg-gray-100 ${grayscale ? 'grayscale opacity-60' : ''}`}>
        <div className="w-full h-full flex items-center justify-center text-4xl bg-pk-primary-light">
          {CATEGORY_ICONS[content.category]}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={content.status} />
          {content.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-pk-primary-light text-pk-primary">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-base text-gray-900 mb-1">{content.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{content.description}</p>
      </div>
    </div>
  )

  if (isClickable && content.url) {
    if (content.type === 'external') {
      return <a href={content.url} target="_blank" rel="noopener noreferrer" className="no-underline">{card}</a>
    }
    return <Link to={content.url} className="no-underline">{card}</Link>
  }
  return card
}

function SmallContentCard({ content }: { content: Content }) {
  const isClickable = content.status === 'live' && content.url
  const card = (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white transition-all ${
        isClickable ? 'hover:shadow-md hover:border-pk-primary-border cursor-pointer' : 'opacity-70'
      }`}
    >
      <div className="text-2xl shrink-0">{CATEGORY_ICONS[content.category]}</div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-bold text-sm text-gray-900 truncate">{content.title}</span>
        </div>
        <StatusBadge status={content.status} />
      </div>
    </div>
  )

  if (isClickable && content.url) {
    if (content.type === 'external') {
      return <a href={content.url} target="_blank" rel="noopener noreferrer" className="no-underline">{card}</a>
    }
    return <Link to={content.url} className="no-underline">{card}</Link>
  }
  return card
}

function HealthListItem({ content }: { content: Content }) {
  const isClickable = content.status === 'live' && content.url
  const item = (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white transition-all ${
        isClickable ? 'hover:shadow-md hover:border-pk-primary-border cursor-pointer' : 'opacity-70'
      }`}
    >
      <div className="text-3xl shrink-0">🏥</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-sm text-gray-900">{content.title}</span>
          <StatusBadge status={content.status} />
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{content.description}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {content.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-pk-primary-light text-pk-primary">{tag}</span>
          ))}
        </div>
      </div>
      {isClickable && (
        <span className="text-pk-primary shrink-0">→</span>
      )}
    </div>
  )

  if (isClickable && content.url) {
    if (content.type === 'external') {
      return <a href={content.url} target="_blank" rel="noopener noreferrer" className="no-underline">{item}</a>
    }
    return <Link to={content.url} className="no-underline">{item}</Link>
  }
  return item
}

function ColumnCard({ column }: { column: Column }) {
  const CAT_LABELS: Record<string, string> = {
    health: '健康', self: '自己理解', nature: '自然', science: 'サイエンス', seasonal: '季節',
  }
  return (
    <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-20 bg-gradient-to-br from-pk-primary-light to-pk-lavender flex items-center justify-center text-3xl">
        {column.category === 'health' ? '🌿' :
         column.category === 'self' ? '🧠' :
         column.category === 'nature' ? '🌱' :
         column.category === 'science' ? '🔬' : '🍂'}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pk-primary-light text-pk-primary mb-2 inline-block">
          {CAT_LABELS[column.category] ?? column.category}
        </span>
        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1">{column.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{column.desc}</p>
      </div>
    </article>
  )
}

// ────────────────────────────────────────────────
// Main TopPage
// ────────────────────────────────────────────────

export function TopPage() {
  const { contents, loading } = useContents()
  const { weather, season, loading: weatherLoading, precipPct, weatherText } = useWeather()
  const today = new Date()
  const seed = hashDate(today)
  const weekNum = weekNumber(today)

  const [activeCategory, setActiveCategory] = useState<ContentCategory | 'all'>('all')
  const [returnMsg, setReturnMsg] = useState<{ result: string; from: string } | null>(null)

  // URLパラメータ受信: ?result=xxx&from=xxx (外部アプリからの帰還)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const result = params.get('result')
    const from = params.get('from')
    if (result && from) {
      const category = APP_CATEGORY_MAP[from]
      if (category) interest.add(category, 5)
      setReturnMsg({ result, from })
      // URLをクリーンに（履歴に残さない）
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Category filter
  const visibleContents = activeCategory === 'all'
    ? contents
    : contents.filter((c) => c.category === activeCategory)

  // Daily pickup: 3 live items, seed-shuffled
  const liveContents = contents.filter((c) => c.status === 'live')
  const dailyPickup = shuffleSeed(liveContents, seed).slice(0, 3)

  // Weekly feature
  const weeklyFeature = WEEKLY_FEATURES[weekNum % WEEKLY_FEATURES.length]

  // Hero copy
  const heroCopy = getHeroCopy(weather, season)

  // Self section: first 2 = large cards, next 3 = small cards
  const selfContents = contents.filter((c) => c.category === 'self')
  const selfLarge = selfContents.slice(0, 2)
  const selfSmall = selfContents.slice(2, 5)

  // Health section: up to 3 items list
  const healthContents = contents.filter((c) => c.category === 'health').slice(0, 3)

  // Fun section: up to 3 small cards
  const funContents = contents.filter((c) => c.category === 'fun').filter((c) => c.status === 'live')

  // Pet section
  const petContents = contents.filter((c) => c.category === 'pet')

  // Columns: weather × season filtered, 2 items
  const { filtered: columnItems } = useColumns({ season, weather, limit: 2 })

  // Personalization
  const isPersonalized = interest.total() >= 3
  const topCat = interest.top() as ContentCategory

  // Planned/dev items
  const plannedContents = contents.filter((c) => c.status !== 'live')

  return (
    <div>
      {/* ── 2. Hero ─────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-pk-primary-light via-white to-pk-lavender py-14 px-4 text-center overflow-hidden">
        <img
          src="/images/hero-bg.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="relative max-w-2xl mx-auto">
          {/* Season badge */}
          <div className="flex items-center justify-center gap-3 mb-3 text-sm">
            <span className="inline-block px-3 py-1 bg-white/80 rounded-full text-gray-600 font-medium shadow-sm">
              {SEASON_BADGE[season]}
            </span>
            <span className="inline-block px-3 py-1 bg-white/80 rounded-full text-gray-500 text-xs shadow-sm">
              {WEATHER_LABEL[weather] ?? '晴れ'} · {weeklyFeature}
            </span>
          </div>

          {/* Logo */}
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-pk-primary mb-3">PORTAKEY</h1>

          {/* Hero copy — weather × season */}
          <p className="text-base sm:text-lg text-gray-700 font-medium mb-1">{heroCopy}</p>
          <p className="text-sm text-gray-400">
            診断・占い・健康・ペットケアを束ねるライフナビゲーション
          </p>

          {/* Weather widget */}
          <div className="flex justify-center mt-2">
            <WeatherWidget
              weather={weather}
              weatherText={weatherText}
              precipPct={precipPct}
              loading={weatherLoading}
            />
          </div>

          {/* Stats bar */}
          <StatsBar total={contents.length} liveCount={liveContents.length} />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* Return message from external app */}
        {returnMsg && (
          <div className="bg-pk-primary-light border border-pk-primary-border rounded-xl px-4 py-3 text-sm text-pk-primary flex items-center gap-2">
            <span>🔑</span>
            <span>診断結果を受け取りました。あなたに合うコンテンツを表示しています。</span>
          </div>
        )}

        {/* ── 3. Category filter tabs ──────────────── */}
        <section>
          <CategoryTabs
            active={activeCategory}
            onChange={setActiveCategory}
            contents={contents}
          />
        </section>

        {/* ── Filtered all view (when tab is not 'all') ── */}
        {activeCategory !== 'all' && (
          <section>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {CATEGORY_ICONS[activeCategory]} {CATEGORY_LABELS[activeCategory]}
              </h2>
              <span className="text-xs text-gray-400">{visibleContents.length}件</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                : visibleContents.map((c) => <ContentCard key={c.id} content={c} />)}
            </div>
          </section>
        )}

        {/* ── Sections only when 'all' tab is active ── */}
        {activeCategory === 'all' && (
          <>
            {/* ── 4. Daily pickup ──────────────────────── */}
            {(loading || dailyPickup.length > 0) && (
              <section>
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">✦ 本日のピックアップ</h2>
                  <span className="text-xs text-gray-400">毎日自動更新</span>
                </div>
                <div className="bg-gradient-to-br from-pk-primary-light/40 to-pk-lavender/40 rounded-2xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading
                      ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                      : dailyPickup.map((c) => <ContentCard key={c.id} content={c} />)}
                  </div>
                </div>
              </section>
            )}

            {/* ── Personalized section ─────────────────── */}
            {isPersonalized && !loading && (
              <section>
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {CATEGORY_ICONS[topCat] ?? '🎯'} あなたへのおすすめ
                  </h2>
                  <span className="text-xs text-gray-400">閲覧履歴に基づく</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contents
                    .filter((c) => c.category === topCat && c.status === 'live')
                    .slice(0, 3)
                    .map((c) => <ContentCard key={c.id} content={c} />)}
                </div>
              </section>
            )}

            {/* ── 5. Fortune widget ────────────────────── */}
            <section>
              <FortuneWidget />
            </section>

            {/* ── 6. Self-understanding section ────────── */}
            {!loading && selfContents.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">🧠 自己理解・診断</h2>
                    <p className="text-sm text-gray-400 mt-0.5">性格・認知能力・職業適性</p>
                  </div>
                  <Link to="/category/self" className="text-sm text-pk-primary hover:underline">
                    すべて見る →
                  </Link>
                </div>
                {/* Large cards (top 2) */}
                {selfLarge.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {selfLarge.map((c) => <LargeContentCard key={c.id} content={c} />)}
                  </div>
                )}
                {/* Small cards (next 3) */}
                {selfSmall.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selfSmall.map((c) => <SmallContentCard key={c.id} content={c} />)}
                  </div>
                )}
              </section>
            )}

            {/* ── 7. Health section ─────────────────────── */}
            {!loading && healthContents.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">🏥 健康・ヘルスケア</h2>
                    <p className="text-sm text-gray-400 mt-0.5">姿勢・体幹・生活習慣</p>
                  </div>
                  <Link to="/category/health" className="text-sm text-pk-primary hover:underline">
                    すべて見る →
                  </Link>
                </div>
                <div className="space-y-3">
                  {healthContents.map((c) => <HealthListItem key={c.id} content={c} />)}
                </div>
              </section>
            )}

            {/* ── 8. Today's columns ───────────────────── */}
            {columnItems.length > 0 && (
              <section>
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {weather === 'rainy' ? '🌧️' : weather === 'cloudy' ? '☁️' : '☀️'} 今季のコラム
                  </h2>
                  <span className="text-xs text-gray-400">
                    {SEASON_BADGE[season]} · {WEATHER_LABEL[weather]}の日に読む
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {columnItems.map((col) => <ColumnCard key={col.id} column={col} />)}
                </div>
              </section>
            )}

            {/* ── 9. Fun / Entertainment section ──────── */}
            {!loading && funContents.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">🔮 娯楽・占い</h2>
                    <p className="text-sm text-gray-400 mt-0.5">つむぎシリーズ・今日の運勢</p>
                  </div>
                  <Link to="/category/fun" className="text-sm text-pk-primary hover:underline">
                    すべて見る →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  {funContents.slice(0, 3).map((c) => <SmallContentCard key={c.id} content={c} />)}
                </div>
                {/* Disclaimer */}
                <p className="text-xs text-gray-400 text-center mt-2">
                  ※ 占い・運勢コンテンツは娯楽目的です。実際の判断は科学的根拠に基づいてください。
                </p>
              </section>
            )}

            {/* ── Pet section ──────────────────────────── */}
            {!loading && petContents.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">🐾 ペットケア</h2>
                    <p className="text-sm text-gray-400 mt-0.5">AI分析・行動記録</p>
                  </div>
                  <Link to="/category/pet" className="text-sm text-pk-primary hover:underline">
                    すべて見る →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {petContents.map((c) => <ContentCard key={c.id} content={c} />)}
                </div>
              </section>
            )}

            {/* ── 10. Coming soon pills ────────────────── */}
            <section className="bg-gray-50 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                追加予定のコンテンツ
              </h2>
              <div className="flex flex-wrap gap-2">
                {COMING_SOON.map((name) => (
                  <span
                    key={name}
                    className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-500"
                  >
                    {name}
                  </span>
                ))}
                {plannedContents.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-400"
                  >
                    <StatusBadge status={c.status} />
                    <span className="ml-1">{c.title}</span>
                  </span>
                ))}
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  )
}
