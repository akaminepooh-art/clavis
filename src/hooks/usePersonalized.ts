import { useMemo } from 'react'
import type { Content } from '../types'
import type { Column } from '../types'
import { interest } from '../utils/interest'

type UsePersonalizedOptions = {
  contents: Content[]
  columns: Column[]
}

type UsePersonalizedResult = {
  topCategory: string
  isPersonalized: boolean
  personalizedContents: Content[]
  personalizedColumns: Column[]
}

// Map interest category to content/column categories
const CATEGORY_MAP: Record<string, string[]> = {
  self: ['self'],
  health: ['health', 'nature'],
  fortune: ['fortune', 'seasonal', 'science'],
  game: ['game'],
}

export function usePersonalized({
  contents,
  columns,
}: UsePersonalizedOptions): UsePersonalizedResult {
  const total = interest.total()
  const isPersonalized = total >= 3

  const topCategory = useMemo(() => {
    return interest.top()
  }, [total])

  const personalizedContents = useMemo(() => {
    if (!isPersonalized) return contents

    const preferred = CATEGORY_MAP[topCategory] ?? []

    return [...contents].sort((a, b) => {
      const aMatch = preferred.includes(a.category) ? 0 : 1
      const bMatch = preferred.includes(b.category) ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
      return a.sort_order - b.sort_order
    })
  }, [contents, topCategory, isPersonalized])

  const personalizedColumns = useMemo(() => {
    if (!isPersonalized) return columns

    const preferred = CATEGORY_MAP[topCategory] ?? []

    return [...columns].sort((a, b) => {
      const aMatch = preferred.includes(a.category) ? 0 : 1
      const bMatch = preferred.includes(b.category) ? 0 : 1
      return aMatch - bMatch
    })
  }, [columns, topCategory, isPersonalized])

  return {
    topCategory,
    isPersonalized,
    personalizedContents,
    personalizedColumns,
  }
}
