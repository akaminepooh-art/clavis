import { useState, useMemo } from 'react'
import type { Content } from '../types'
import type { Column } from '../types'

export type SearchResultItem =
  | { kind: 'content'; item: Content }
  | { kind: 'column'; item: Column }

type UseSearchResult = {
  query: string
  setQuery: (q: string) => void
  results: SearchResultItem[]
  hasQuery: boolean
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '')
}

function matchesContent(content: Content, q: string): boolean {
  const n = normalize(q)
  return (
    normalize(content.title).includes(n) ||
    normalize(content.description).includes(n) ||
    content.tags.some((t) => normalize(t).includes(n))
  )
}

function matchesColumn(column: Column, q: string): boolean {
  const n = normalize(q)
  return (
    normalize(column.title).includes(n) ||
    normalize(column.desc).includes(n) ||
    column.tags.some((t) => normalize(t).includes(n))
  )
}

type UseSearchOptions = {
  contents: Content[]
  columns: Column[]
}

export function useSearch({ contents, columns }: UseSearchOptions): UseSearchResult {
  const [query, setQuery] = useState('')

  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim()
    if (!q) return []

    const contentResults: SearchResultItem[] = contents
      .filter((c) => matchesContent(c, q))
      .map((item) => ({ kind: 'content', item }))

    const columnResults: SearchResultItem[] = columns
      .filter((c) => matchesColumn(c, q))
      .map((item) => ({ kind: 'column', item }))

    return [...contentResults, ...columnResults]
  }, [query, contents, columns])

  return {
    query,
    setQuery,
    results,
    hasQuery: query.trim().length > 0,
  }
}
