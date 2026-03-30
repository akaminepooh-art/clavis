import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { useContents } from '../hooks/useContents'
import { useColumns } from '../hooks/useColumns'
import { useWeather } from '../hooks/useWeather'
import { SkeletonCard } from '../components/SkeletonCard'
import { StatusBadge } from '../components/StatusBadge'
import { ContentCard } from '../components/ContentCard'
import { WeatherWidget } from '../components/WeatherWidget'
import { CATEGORY_LABELS } from '../types'
import type { ContentCategory, Content, Column } from '../types'
import { getHeroCopy, WEEKLY_FEATURES } from '../data/heroCopies'
import { hashDate, shuffleSeed, weekNumber } from '../utils/seed'
import { interest } from '../utils/interest'

// URLパラメータ ?result=xxx&from=xxx
const APP_CATEGORY_MAP: Record<string, 'self' | 'health' | 'fun'> = {
  inniq: 'self', iq: 'self', beauty: 'self', work: 'self', decidevolt: 'self',
  hoshi: 'fun', kaze: 'fun', mei: 'fun', en: 'fun', yume: 'fun',
}

// Category color scheme
const CAT_STYLE: Record<string, { dot: string; activeBg: string; bar: string }> = {
  all:    { dot: '#1D9E75', activeBg: '#0F6E56', bar: '#0F6E56' },
  self:   { dot: '#0F6E56', activeBg: '#0F6E56', bar: '#0F6E56' },
  health: { dot: '#185FA5', activeBg: '#185FA5', bar: '#185FA5' },
  fun:    { dot: '#7F77DD', activeBg: '#7F77DD', bar: '#7F77DD' },
  pet:    { dot: '#BA7517', activeBg: '#BA7517', bar: '#BA7517' },
}

const SEASON_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  spring: { bg: '#FBEAF0', color: '#993556', border: '#99355630' },
  summer: { bg: '#FAEEDA', color: '#854F0B', border: '#854F0B30' },
  autumn: { bg: '#FAEEDA', color: '#633806', border: '#63380630' },
  winter: { bg: '#E6F1FB', color: '#185FA5', border: '#185FA530' },
}
const SEASON_EMOJI: Record<string, string> = {
  spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️',
}

const COMING_SOON = [
  { emoji: '🌙', label: '夢診断' },
  { emoji: '🎨', label: 'カラータイプ診断' },
  { emoji: '⚡', label: '決断力診断' },
  { emoji: '💤', label: '睡眠タイプ診断' },
  { emoji: '🏆', label: '強み発見テスト' },
  { emoji: '🚨', label: '防災チェック' },
  { emoji: '🧍', label: 'BERRYBODY姿勢分析' },
]

// ──────────────────────────────────────
// Section header component (left color bar style)
// ──────────────────────────────────────
function SecHeader({
  title, color, count, linkTo,
}: {
  title: string; color: string; count?: number; linkTo?: string
}) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-1.5">
        <span className="w-0.5 h-3.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-xs font-bold text-gray-800">{title}</span>
      </div>
      {linkTo && count !== undefined && (
        <Link to={linkTo} className="text-xs text-gray-400 hover:text-gray-600 no-underline">
          {count}件すべて →
        </Link>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// Category filter tabs
// ──────────────────────────────────────
function FilterTabs({
  active, onChange, counts,
}: {
  active: ContentCategory | 'all'
  onChange: (c: ContentCategory | 'all') => void
  counts: Record<string, number>
}) {
  const tabs: { key: ContentCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'self', label: '自己理解' },
    { key: 'health', label: '健康・体' },
    { key: 'fun', label: '娯楽・占い' },
    { key: 'pet', label: 'ペット' },
  ]
  return (
    <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none border-b border-gray-100">
      {tabs.map(({ key, label }) => {
        const isActive = active === key
        const style = CAT_STYLE[key]
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs whitespace-nowrap transition-all"
            style={isActive
              ? { background: style.activeBg, color: '#fff', borderColor: 'transparent' }
              : { background: '#fff', color: '#555', borderColor: '#e8e6e0' }
            }
          >
            <span
              className="w-1 h-1 rounded-full shrink-0"
              style={{ background: isActive ? 'rgba(255,255,255,0.7)' : style.dot }}
            />
            {label}{counts[key] !== undefined ? `（${counts[key]}）` : ''}
          </button>
        )
      })}
    </div>
  )
}

// ──────────────────────────────────────
// Pickup mini card
// ──────────────────────────────────────
function PickCard({ content }: { content: Content }) {
  const ICONS: Record<ContentCategory, string> = { self: '🧠', health: '🏃', fun: '🔮', pet: '🐾' }
  const isClickable = content.status === 'live' && content.url
  const card = (
    <div className="bg-white/80 rounded-lg overflow-hidden cursor-pointer hover:bg-white transition-colors">
      {/* Thumbnail or fallback emoji */}
      {content.thumbnail_url ? (
        <div className="h-14 overflow-hidden">
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget
              img.style.display = 'none'
              const fallback = img.nextElementSibling as HTMLElement | null
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div className="h-14 items-center justify-center text-2xl bg-white/60 hidden">{ICONS[content.category]}</div>
        </div>
      ) : (
        <div className="h-14 flex items-center justify-center text-2xl bg-white/60">{ICONS[content.category]}</div>
      )}
      <div className="p-1.5">
        <p className="text-xs font-semibold text-gray-800 leading-tight mb-0.5 line-clamp-2">{content.title}</p>
        <p className="text-xs text-gray-400">{CATEGORY_LABELS[content.category]}</p>
      </div>
    </div>
  )
  if (!isClickable || !content.url) return card
  if (content.type === 'external') return <a href={content.url} target="_blank" rel="noopener noreferrer" className="no-underline">{card}</a>
  return <Link to={content.url} className="no-underline">{card}</Link>
}

// ──────────────────────────────────────
// Inline fortune widget (seed-based, no birthdate required)
// ──────────────────────────────────────
const LUCKY_COLORS = ['赤', '青', '緑', '白', '金', '紫', '橙', '黄']
const LUCKY_FOODS = ['いちご', 'ナッツ', '豆腐', '柑橘類', '玄米', 'ハーブティー', '桃', 'ブルーベリー']
const LUCKY_NUMS = [1, 3, 5, 7, 8, 11, 13, 22]

function deriveScore(seed: number, key: string): number {
  let h = seed
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0
  }
  return Math.round(55 + Math.abs(h) % 46)
}

function FortuneInlineWidget({ seed }: { seed: number }) {
  const scores = [
    { label: '恋愛運', val: deriveScore(seed, 'love') },
    { label: '仕事運', val: deriveScore(seed, 'work') },
    { label: '金運', val: deriveScore(seed, 'money') },
    { label: '健康運', val: deriveScore(seed, 'health') },
  ]
  const color = LUCKY_COLORS[seed % LUCKY_COLORS.length]
  const food = LUCKY_FOODS[seed % LUCKY_FOODS.length]
  const num = LUCKY_NUMS[seed % LUCKY_NUMS.length]
  const today = new Date()

  return (
    <div className="rounded-xl p-3 border mb-0" style={{ background: '#EEEDFE', borderColor: '#CECBF6' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: '#3C3489' }}>✨ 今日の運勢</span>
        <span className="text-xs" style={{ color: '#7F77DD' }}>{today.getMonth() + 1}/{today.getDate()}</span>
      </div>
      {/* Scores grid */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {scores.map((s) => (
          <div key={s.label} className="rounded-lg p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <p className="text-xs mb-1" style={{ color: '#7F77DD' }}>{s.label}</p>
            <div className="h-0.5 rounded-full mb-1 overflow-hidden" style={{ background: 'rgba(127,119,221,0.2)' }}>
              <div className="h-full rounded-full" style={{ width: `${s.val}%`, background: '#7F77DD' }} />
            </div>
            <p className="text-xs font-bold" style={{ color: '#3C3489' }}>{s.val}</p>
          </div>
        ))}
      </div>
      {/* Lucky items */}
      <div className="flex gap-1.5 mb-2">
        {[{ label: 'カラー', val: color }, { label: 'フード', val: food }, { label: '数字', val: String(num) }].map((item) => (
          <div key={item.label} className="flex-1 rounded-lg py-1 text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <p className="text-xs mb-0.5" style={{ color: '#7F77DD' }}>{item.label}</p>
            <p className="text-xs font-bold" style={{ color: '#3C3489' }}>{item.val}</p>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: '#7F77DD' }}>
        ※娯楽目的です。科学的根拠はありません。
        <Link to="/apps/fortune" className="ml-1 underline no-underline" style={{ color: '#7F77DD' }}>
          生年月日で詳細を見る →
        </Link>
      </p>
    </div>
  )
}

// ──────────────────────────────────────
// Large content card


// ──────────────────────────────────────
// Health list item
// ──────────────────────────────────────
function HealthListItem({ content }: { content: Content }) {
  const isClickable = content.status === 'live' && content.url
  const ICONS: Record<string, string> = {
    'berrybody': '🏃', 'akira-body-check': '💪', 'disaster-checklist': '😮‍💨',
    'farm-experience': '🌿',
  }
  const icon = ICONS[content.id] ?? '🏥'
  const item = (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100 last:border-none ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 bg-blue-50">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{content.title}</p>
        <p className="text-xs text-gray-500">{content.description}</p>
      </div>
      <StatusBadge status={content.status} />
    </div>
  )
  if (!isClickable || !content.url) return item
  if (content.type === 'external') return <a href={content.url} target="_blank" rel="noopener noreferrer" className="no-underline">{item}</a>
  return <Link to={content.url} className="no-underline">{item}</Link>
}

// ──────────────────────────────────────
// Column article card
// ──────────────────────────────────────
function ArticleCard({ column }: { column: Column }) {
  const CAT_INFO: Record<string, { bg: string; tagColor: string; emoji: string; label: string }> = {
    health:   { bg: '#EAF3DE', tagColor: '#639922', emoji: '🌿', label: '健康 × 自然' },
    self:     { bg: '#EEEDFE', tagColor: '#7F77DD', emoji: '🧠', label: '自己理解' },
    nature:   { bg: '#EAF3DE', tagColor: '#639922', emoji: '🌱', label: '自然 × 体' },
    science:  { bg: '#E6F1FB', tagColor: '#185FA5', emoji: '🔬', label: 'サイエンス' },
    seasonal: { bg: '#FAEEDA', tagColor: '#BA7517', emoji: '🍂', label: '季節の知識' },
  }
  const info = CAT_INFO[column.category] ?? CAT_INFO.health

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-gray-300 transition-colors">
      <div className="h-20 flex items-center justify-center text-3xl relative" style={{ background: info.bg }}>
        {info.emoji}
        <span
          className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.9)', color: info.tagColor }}
        >
          {info.label}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
          {column.category === 'seasonal' ? '季節の健康知識' : column.category === 'science' ? 'サイエンス' : 'ボディメンテナンス'}
        </p>
        <p className="text-xs font-bold text-gray-800 mb-1 leading-snug">{column.title}</p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{column.desc}</p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────
// Main page
// ──────────────────────────────────────
export function TopPage() {
  const { contents, loading } = useContents()
  const { weather, season, loading: weatherLoading, precipPct, weatherText, tempHi, tempLo } = useWeather()
  const today = new Date()
  const seed = hashDate(today)
  const weekNum = weekNumber(today)

  const [activeCategory, setActiveCategory] = useState<ContentCategory | 'all'>('all')
  const [returnMsg, setReturnMsg] = useState<string | null>(null)

  // URLパラメータ受信
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const result = params.get('result')
    const from = params.get('from')
    if (result && from) {
      const category = APP_CATEGORY_MAP[from]
      if (category) interest.add(category, 5)
      setReturnMsg('診断結果を受け取りました。あなたに合うコンテンツを表示しています。')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const heroCopy = getHeroCopy(weather, season)
  const seasonStyle = SEASON_STYLE[season]
  const seasonEmoji = SEASON_EMOJI[season]
  const weeklyFeature = WEEKLY_FEATURES[weekNum % WEEKLY_FEATURES.length]

  const liveContents = contents.filter((c) => c.status === 'live')
  const dailyPickup = shuffleSeed(liveContents, seed).slice(0, 3)

  // Category counts
  const counts: Record<string, number> = {
    all: contents.length,
    self: contents.filter((c) => c.category === 'self').length,
    health: contents.filter((c) => c.category === 'health').length,
    fun: contents.filter((c) => c.category === 'fun').length,
    pet: contents.filter((c) => c.category === 'pet').length,
  }

  const selfContents = contents.filter((c) => c.category === 'self')
  const healthContents = contents.filter((c) => c.category === 'health').slice(0, 3)
  const petContents = contents.filter((c) => c.category === 'pet')

  const { filtered: columnPool } = useColumns({ season, weather })
  const columnItems = shuffleSeed(columnPool, seed).slice(0, 2)

  const isPersonalized = interest.total() >= 3
  const topCat = interest.top() as ContentCategory

  const visibleContents = activeCategory === 'all'
    ? contents
    : contents.filter((c) => c.category === activeCategory)

  return (
    <div>
      <PageMeta />
      {/* ── HERO ─────────────────────────────── */}
      <section className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Left: text content */}
          <div className="flex-1 min-w-0">
            {/* Season badge */}
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-2.5"
              style={{ background: seasonStyle.bg, color: seasonStyle.color, border: `1px solid ${seasonStyle.border}` }}
            >
              {seasonEmoji} {['spring','summer','autumn','winter'].indexOf(season) >= 0 ? { spring: '春', summer: '夏', autumn: '秋', winter: '冬' }[season] : season}の自己理解
            </span>

            {/* Hero copy */}
            <h1 className="text-lg font-bold text-gray-900 leading-snug mb-1.5">{heroCopy}</h1>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              {weeklyFeature} — 診断・健康・占いを一箇所で
            </p>
          </div>
          {/* Right: hero illustration */}
          <div className="shrink-0 w-28 h-20 rounded-xl overflow-hidden">
            <img
              src="/hero-bg.jpg"
              alt="PORTAKEY"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>

        {/* Weather widget */}
        <div className="mb-3">
          <WeatherWidget
            weather={weather}
            weatherText={weatherText}
            precipPct={precipPct}
            tempHi={tempHi}
            tempLo={tempLo}
            loading={weatherLoading}
          />
        </div>

        {/* Stats bar */}
        <div className="flex gap-4">
          {[
            { num: `${contents.length}+`, lbl: 'コンテンツ' },
            { num: '4', lbl: 'カテゴリ' },
            { num: '無料', lbl: 'すべて無料' },
            { num: '随時', lbl: '追加中' },
          ].map((s) => (
            <div key={s.lbl} className="text-center">
              <p className="text-base font-bold text-pk-primary leading-none">{s.num}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.lbl}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FILTER TABS ──────────────────────── */}
      <FilterTabs active={activeCategory} onChange={setActiveCategory} counts={counts} />

      {/* ── BODY ─────────────────────────────── */}
      <div className="px-4 py-3 space-y-4">

        {/* Return message */}
        {returnMsg && (
          <div className="bg-pk-primary-light border border-pk-primary-border rounded-lg px-3 py-2 text-xs text-pk-primary">
            🔑 {returnMsg}
          </div>
        )}

        {/* ── Filtered view (non-all tab) ─────── */}
        {activeCategory !== 'all' && (
          <section>
            <SecHeader
              title={CATEGORY_LABELS[activeCategory]}
              color={CAT_STYLE[activeCategory].bar}
              count={visibleContents.length}
            />
            {loading ? (
              <div className="grid grid-cols-1 gap-2">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : visibleContents.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">コンテンツを準備中です</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {visibleContents.map((c) => <ContentCard key={c.id} content={c} />)}
              </div>
            )}
          </section>
        )}

        {/* ── All tab sections ────────────────── */}
        {activeCategory === 'all' && (
          <>
            {/* TODAY'S PICKUP */}
            {(loading || dailyPickup.length > 0) && (
              <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #EEEDFE 100%)', border: '1px solid #5DCAA5' }}>
                <p className="text-xs font-bold tracking-widest mb-2" style={{ color: '#0F6E56' }}>✦ 本日のピックアップ</p>
                {loading ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/60 rounded-lg h-16 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {dailyPickup.map((c) => <PickCard key={c.id} content={c} />)}
                  </div>
                )}
              </div>
            )}

            {/* FORTUNE INLINE WIDGET */}
            <FortuneInlineWidget seed={seed} />

            {/* PERSONALIZED */}
            {isPersonalized && !loading && (
              <section>
                <SecHeader title="あなたへのおすすめ" color={CAT_STYLE[topCat]?.bar ?? '#0F6E56'} />
                <div className="grid grid-cols-2 gap-3">
                  {contents
                    .filter((c) => c.category === topCat && c.status === 'live')
                    .slice(0, 4)
                    .map((c) => <ContentCard key={c.id} content={c} />)}
                </div>
              </section>
            )}

            {/* SELF SECTION */}
            {!loading && selfContents.length > 0 && (
              <section>
                <SecHeader title="自己理解・診断" color="#0F6E56" count={selfContents.length} linkTo="/category/self" />
                <div className="grid grid-cols-2 gap-3">
                  {selfContents.slice(0, 4).map((c) => <ContentCard key={c.id} content={c} />)}
                </div>
              </section>
            )}

            {/* HEALTH SECTION */}
            {!loading && healthContents.length > 0 && (
              <section>
                <SecHeader title="健康・ヘルスケア" color="#185FA5" count={counts.health} linkTo="/category/health" />
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {healthContents.map((c) => <HealthListItem key={c.id} content={c} />)}
                </div>
              </section>
            )}

            {/* TODAY'S COLUMNS */}
            {columnItems.length > 0 && (
              <section>
                <SecHeader title="今季のコラム" color="#639922" />
                <div className="space-y-2">
                  {columnItems.map((col) => <ArticleCard key={col.id} column={col} />)}
                </div>
              </section>
            )}

            {/* PET SECTION */}
            {!loading && petContents.length > 0 && (
              <section>
                <SecHeader title="ペットケア" color="#BA7517" count={counts.pet} linkTo="/category/pet" />
                <div className="grid grid-cols-2 gap-3">
                  {petContents.map((c) => <ContentCard key={c.id} content={c} />)}
                </div>
              </section>
            )}

            {/* FUN SECTION */}
            {!loading && (
              <section>
                <SecHeader title="娯楽・占い" color="#7F77DD" count={counts.fun} linkTo="/category/fun" />
                <div className="grid grid-cols-2 gap-3">
                  {contents.filter((c) => c.category === 'fun' && c.status === 'live').slice(0, 4).map((c) => (
                    <ContentCard key={c.id} content={c} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  ※占い・運勢コンテンツは娯楽目的です。科学的根拠を持つものではありません。
                </p>
              </section>
            )}

            {/* COMING SOON PILLS */}
            <div className="rounded-xl px-3 py-2.5" style={{ background: '#F1EFE8', border: '1px solid #e8e6e0' }}>
              <p className="text-xs font-bold text-gray-400 mb-2 tracking-wide">追加予定のコンテンツ</p>
              <div className="flex flex-wrap gap-1.5">
                {COMING_SOON.map(({ emoji, label }) => (
                  <span key={label} className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-500 flex items-center gap-1">
                    <span>{emoji}</span>{label}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
