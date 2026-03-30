import type { WeatherState } from '../hooks/useWeather'

type Props = {
  weather: WeatherState
  weatherText: string | null
  precipPct: number | null
  loading: boolean
}

const WEATHER_ICON: Record<WeatherState, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
}

export function WeatherWidget({ weather, weatherText, precipPct, loading }: Props) {
  if (loading) return null

  return (
    <div className="inline-flex items-center gap-3 mt-4 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm text-sm text-gray-600">
      <span className="text-lg">{WEATHER_ICON[weather]}</span>
      {weatherText && (
        <span className="font-medium">{weatherText}</span>
      )}
      {precipPct !== null && (
        <span className="text-gray-400">
          降水確率 <span className="font-semibold text-gray-600">{precipPct}%</span>
        </span>
      )}
      <span className="text-xs text-gray-300">|</span>
      <a
        href="https://www.jma.go.jp/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-400 hover:text-gray-600 no-underline"
      >
        気象庁
      </a>
    </div>
  )
}
