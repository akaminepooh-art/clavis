import { useState, useEffect } from 'react'
import type { Content } from '../types'

export function useContents() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/contents.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch contents')
        return res.json()
      })
      .then((data: Content[]) => {
        setContents(data.sort((a, b) => a.sort_order - b.sort_order))
        setLoading(false)
      })
      .catch((err) => {
        console.error('contents.json fetch error:', err)
        setError(err.message)
        setContents([])
        setLoading(false)
      })
  }, [])

  return { contents, loading, error }
}
