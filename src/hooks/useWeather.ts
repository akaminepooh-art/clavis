import { useState, useEffect } from 'react'

export type WeatherState = 'sunny' | 'cloudy' | 'rainy'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

function getWeatherFromCode(code: number): WeatherState {
  const first = parseInt(String(code)[0])
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

export type WeatherResult = {
  weather: WeatherState
  season: Season
  loading: boolean
  /** 今日の降水確率（0〜100, nullなら取得不可） */
  precipPct: number | null
  /** 気象庁の天気テキスト e.g. "晴れ" */
  weatherText: string | null
  /** 最高気温 */
  tempHi: number | null
  /** 最低気温 */
  tempLo: number | null
}

export function useWeather(): WeatherResult {
  const today = new Date()
  const season = getSeason(today)

  const [weather, setWeather] = useState<WeatherState>('sunny')
  const [loading, setLoading] = useState(true)
  const [precipPct, setPrecipPct] = useState<number | null>(null)
  const [weatherText, setWeatherText] = useState<string | null>(null)
  const [tempHi, setTempHi] = useState<number | null>(null)
  const [tempLo, setTempLo] = useState<number | null>(null)

  useEffect(() => {
    // 気象庁JSON API — 大分県 area code: 440000
    fetch('https://www.jma.go.jp/bosai/forecast/data/forecast/440000.json')
      .then((res) => {
        if (!res.ok) throw new Error('JMA fetch failed')
        return res.json()
      })
      .then((data: unknown[]) => {
        try {
          const d0 = data[0] as Record<string, unknown>
          const ts = d0.timeSeries as unknown[]

          // timeSeries[0]: weatherCodes & weathers
          const ts0 = ts[0] as Record<string, unknown>
          const areas0 = (ts0.areas as unknown[])[0] as Record<string, unknown>
          const codes = areas0.weatherCodes as string[]
          const weathers = areas0.weathers as string[] | undefined
          const code = parseInt(codes[0])
          setWeather(getWeatherFromCode(code))
          if (weathers?.[0]) {
            // clean up whitespace/fullwidth spaces in JMA text
            setWeatherText(weathers[0].replace(/\s+/g, ''))
          }

          // timeSeries[1]: pops (precipitation probability, 6-hour blocks)
          const ts1 = ts[1] as Record<string, unknown> | undefined
          if (ts1) {
            const areas1 = (ts1.areas as unknown[])[0] as Record<string, unknown>
            const pops = areas1.pops as string[]
            const firstPop = pops.find((p) => p !== '')
            if (firstPop !== undefined) setPrecipPct(parseInt(firstPop))
          }

          // timeSeries[2]: temperatures (not always present)
          const ts2 = ts[2] as Record<string, unknown> | undefined
          if (ts2) {
            try {
              const areas2 = (ts2.areas as unknown[])[0] as Record<string, unknown>
              const temps = areas2.temps as string[]
              // temps[0] = morning low, temps[1] = daytime high (area-dependent)
              if (temps.length >= 2) {
                const lo = parseInt(temps[0])
                const hi = parseInt(temps[1])
                if (!isNaN(hi)) setTempHi(hi)
                if (!isNaN(lo)) setTempLo(lo)
              }
            } catch { /* no temps for this area */ }
          }
        } catch {
          // fail silently
        }
        setLoading(false)
      })
      .catch(() => {
        setWeather('sunny')
        setLoading(false)
      })
  }, [])

  return { weather, season, loading, precipPct, weatherText, tempHi, tempLo }
}
