import { useState, useEffect } from 'react'

export type WeatherState = 'sunny' | 'cloudy' | 'rainy'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

function getWeatherFromCode(code: number): WeatherState {
  const s = String(code)
  const first = parseInt(s[0])
  if (first === 1) return 'sunny'
  if (first === 3 || first === 2) return 'rainy'
  return 'cloudy'
}

function getSeason(date: Date): Season {
  const m = date.getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

type WeatherResult = {
  weather: WeatherState
  season: Season
  loading: boolean
}

export function useWeather(): WeatherResult {
  const today = new Date()
  const season = getSeason(today)

  const [weather, setWeather] = useState<WeatherState>('sunny')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 気象庁JSON API — 大分県 area code: 440000
    const url =
      'https://www.jma.go.jp/bosai/forecast/data/forecast/440000.json'

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('JMA fetch failed')
        return res.json()
      })
      .then((data: unknown[]) => {
        try {
          // data[0].timeSeries[0].areas[0].weatherCodes[0] = today's code for Oita
          const series = (data[0] as Record<string, unknown>).timeSeries as unknown[]
          const areas = (series[0] as Record<string, unknown>).areas as unknown[]
          const codes = (areas[0] as Record<string, unknown>).weatherCodes as string[]
          const code = parseInt(codes[0])
          setWeather(getWeatherFromCode(code))
        } catch {
          setWeather('sunny')
        }
        setLoading(false)
      })
      .catch(() => {
        // Fail silently — default to sunny
        setWeather('sunny')
        setLoading(false)
      })
  }, [])

  return { weather, season, loading }
}
