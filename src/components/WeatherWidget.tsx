import type { WeatherState } from '../hooks/useWeather'

type Props = {
  weather: WeatherState
  weatherText: string | null
  precipPct: number | null
  tempHi: number | null
  tempLo: number | null
  loading: boolean
}

const WEATHER_ICON: Record<WeatherState, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
}

export function WeatherWidget({ weather, weatherText, precipPct, tempHi, tempLo, loading }: Props) {
  if (loading) return null

  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
      <span className="text-2xl shrink-0">{WEATHER_ICON[weather]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">大分県</p>
        <p className="text-sm font-semibold text-gray-800 leading-none">
          {weatherText ?? (weather === 'sunny' ? '晴れ' : weather === 'rainy' ? '雨' : '曇り')}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {precipPct !== null ? `降水確率 ${precipPct}% ／ ` : ''}出典：
          <a href="https://www.jma.go.jp/" target="_blank" rel="noopener noreferrer"
            className="underline hover:text-gray-600">気象庁</a>
        </p>
      </div>
      {(tempHi !== null || tempLo !== null) && (
        <div className="text-right shrink-0">
          {tempHi !== null && (
            <p className="text-sm font-bold" style={{ color: '#D85A30' }}>{tempHi}°</p>
          )}
          {tempLo !== null && (
            <p className="text-xs font-semibold text-blue-600">{tempLo}°</p>
          )}
        </div>
      )}
    </div>
  )
}
