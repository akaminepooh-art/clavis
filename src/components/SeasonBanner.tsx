import { getSeasonConfig } from '../utils/season'

export function SeasonBanner() {
  const season = getSeasonConfig()

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${season.accentClass} border border-gray-200 p-5`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{season.emoji}</span>
        <div>
          <p className="font-bold text-gray-800">{season.label}のおすすめ</p>
          <p className="text-sm text-gray-600">{season.greeting}</p>
        </div>
      </div>
    </div>
  )
}
