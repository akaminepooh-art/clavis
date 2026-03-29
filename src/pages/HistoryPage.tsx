import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHistory, type HistoryEntry } from '../utils/storage'
import type { FortuneResult } from '../apps/fortune/logic'

export function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory('fortune').then((data) => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-cl-primary no-underline mb-4 inline-block">
        &larr; トップへ戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">診断履歴</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">読み込み中...</div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">&#128203;</div>
          <p className="text-gray-500 mb-4">まだ履歴がありません</p>
          <Link
            to="/apps/fortune"
            className="inline-block px-6 py-3 bg-cl-primary text-white rounded-xl font-bold hover:bg-cl-primary-mid transition-colors no-underline"
          >
            今日の運勢を占う
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const fortune = entry.result as FortuneResult
            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4"
              >
                <div className="shrink-0 w-16 h-16 bg-cl-primary-light rounded-xl flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-cl-primary">{fortune.overall}</span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900">今日の運勢</p>
                    <span className="text-xs text-gray-400">{entry.date}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>恋愛 {fortune.scores.love}</span>
                    <span>仕事 {fortune.scores.work}</span>
                    <span>金運 {fortune.scores.money}</span>
                    <span>健康 {fortune.scores.health}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">{fortune.message}</p>
                </div>
                <div className="shrink-0 text-sm">
                  <span className="px-2 py-1 rounded-full bg-cl-primary-light text-cl-primary text-xs">
                    {fortune.lucky.color}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
