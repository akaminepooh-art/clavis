import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageMeta } from '../../components/PageMeta'
import { generateFortune, type FortuneResult } from './logic'
import { DisclaimerBanner } from '../../components/DisclaimerBanner'
import { generateShareImage } from '../../utils/shareImage'
import { ShareButtons } from '../../components/ShareButtons'
import { saveHistory } from '../../utils/storage'
import { interest } from '../../utils/interest'

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pk-primary to-pk-primary-mid rounded-full transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-bold text-pk-primary w-10 text-right">{value}</span>
    </div>
  )
}

export function FortunePage() {
  const savedBirthdate = localStorage.getItem('pk_fortune_birthdate') ?? ''
  const [bdYear,  setBdYear]  = useState(() => savedBirthdate ? savedBirthdate.split('-')[0] : '')
  const [bdMonth, setBdMonth] = useState(() => savedBirthdate ? savedBirthdate.split('-')[1] : '')
  const [bdDay,   setBdDay]   = useState(() => savedBirthdate ? savedBirthdate.split('-')[2] : '')

  const birthdate = bdYear && bdMonth && bdDay ? `${bdYear}-${bdMonth}-${bdDay}` : ''

  // 選択中の年月の日数を動的に計算
  const daysInMonth = bdYear && bdMonth
    ? new Date(Number(bdYear), Number(bdMonth), 0).getDate()
    : 31

  const [result, setResult] = useState<FortuneResult | null>(() => {
    const saved = localStorage.getItem('pk_fortune_last')
    if (!saved) return null
    try {
      const parsed = JSON.parse(saved)
      const today = new Date().toISOString().split('T')[0]
      if (parsed.date === today) return parsed.result
    } catch { /* ignore */ }
    return null
  })

  const today = new Date().toISOString().split('T')[0]
  const currentYear = new Date().getFullYear()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!birthdate) return
    localStorage.setItem('pk_fortune_birthdate', birthdate)
    const fortune = generateFortune(birthdate, today)
    setResult(fortune)
    localStorage.setItem('pk_fortune_last', JSON.stringify({ date: today, result: fortune }))
    saveHistory({
      id: `fortune-${today}-${birthdate}`,
      appId: 'fortune',
      date: today,
      result: fortune,
    })
    interest.add('fun', 5)
  }

  async function handleImageDownload() {
    if (!result) return
    const blob = await generateShareImage({
      title: `今日の運勢 — 総合 ${result.overall}点`,
      scores: [
        { label: '恋愛', value: result.scores.love },
        { label: '仕事', value: result.scores.work },
        { label: '金運', value: result.scores.money },
        { label: '健康', value: result.scores.health },
      ],
      message: result.message,
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portakey-fortune-${today}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <PageMeta
        title="今日の運勢"
        description="生年月日から今日の運勢を占う。恋愛・仕事・金運・健康の4軸で毎日更新。"
        path="/apps/fortune"
      />
      <Link to="/" className="text-sm text-gray-500 hover:text-pk-primary no-underline mb-4 inline-block">
        &larr; トップへ戻る
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">&#128302;</div>
          <h1 className="text-2xl font-bold text-gray-900">今日の運勢</h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
        </div>

        <DisclaimerBanner />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              生年月日
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* 年 */}
              <div className="relative">
                <select
                  value={bdYear}
                  onChange={(e) => { setBdYear(e.target.value); setBdDay('') }}
                  className="w-full appearance-none border border-gray-300 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pk-primary-border focus:border-pk-primary bg-white pr-8"
                  required
                >
                  <option value="">年</option>
                  {Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i).map((y) => (
                    <option key={y} value={String(y)}>{y}年</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>
              {/* 月 */}
              <div className="relative">
                <select
                  value={bdMonth}
                  onChange={(e) => { setBdMonth(e.target.value); setBdDay('') }}
                  className="w-full appearance-none border border-gray-300 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pk-primary-border focus:border-pk-primary bg-white pr-8"
                  required
                >
                  <option value="">月</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={String(m).padStart(2, '0')}>{m}月</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>
              {/* 日 */}
              <div className="relative">
                <select
                  value={bdDay}
                  onChange={(e) => setBdDay(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pk-primary-border focus:border-pk-primary bg-white pr-8"
                  required
                >
                  <option value="">日</option>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={String(d).padStart(2, '0')}>{d}日</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!birthdate}
            className="w-full bg-pk-primary text-white rounded-xl py-3 font-bold text-base hover:bg-pk-primary-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            占う
          </button>
        </form>

        {result && (
          <div className="space-y-6 pt-4 border-t border-gray-100">
            {/* Overall */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">総合運勢</p>
              <div className="text-5xl font-bold text-pk-primary">{result.overall}</div>
              <p className="text-sm text-gray-400 mt-1">/ 100</p>
            </div>

            {/* Score bars */}
            <div className="space-y-3">
              <ScoreBar label="恋愛" value={result.scores.love} />
              <ScoreBar label="仕事" value={result.scores.work} />
              <ScoreBar label="金運" value={result.scores.money} />
              <ScoreBar label="健康" value={result.scores.health} />
            </div>

            {/* Lucky items */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-pk-primary-light rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">ラッキーカラー</p>
                <p className="font-bold text-pk-primary">{result.lucky.color}</p>
              </div>
              <div className="bg-pk-primary-light rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">ラッキーフード</p>
                <p className="font-bold text-pk-primary">{result.lucky.food}</p>
              </div>
              <div className="bg-pk-primary-light rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">ラッキーナンバー</p>
                <p className="font-bold text-pk-primary">{result.lucky.number}</p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-gray-700">{result.message}</p>
            </div>


            {/* Share buttons */}
            <ShareButtons
              text={`今日の運勢は${result.overall}点！ #PORTAKEY`}
              url="https://portakey.netlify.app/apps/fortune"
              onImageDownload={handleImageDownload}
            />
          </div>
        )}
      </div>
    </div>
  )
}
