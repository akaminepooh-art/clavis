import { useState, useEffect, useMemo } from 'react'
import type { Column } from '../types'
import type { WeatherState, Season } from './useWeather'

type UseColumnsOptions = {
  season?: Season
  weather?: WeatherState
  category?: Column['category']
  limit?: number
}

type UseColumnsResult = {
  columns: Column[]
  filtered: Column[]
  loading: boolean
  error: string | null
}

export function useColumns(options: UseColumnsOptions = {}): UseColumnsResult {
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/columns.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch columns')
        return res.json()
      })
      .then((data: Column[]) => {
        setColumns(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('columns.json fetch error:', err)
        setError(err.message)
        setColumns([])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let result = columns

    if (options.season) {
      const s = options.season
      result = result.filter(
        (c) => c.season.includes('any') || c.season.includes(s)
      )
    }

    if (options.weather) {
      const w = options.weather
      result = result.filter(
        (c) => c.weather.includes('any') || c.weather.includes(w)
      )
    }

    if (options.category) {
      result = result.filter((c) => c.category === options.category)
    }

    if (options.limit) {
      result = result.slice(0, options.limit)
    }

    return result
  }, [columns, options.season, options.weather, options.category, options.limit])

  return { columns, filtered, loading, error }
}
