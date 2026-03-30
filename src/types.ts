export type ContentCategory = 'self' | 'health' | 'fun' | 'pet'
export type ContentType = 'webapp' | 'instant' | 'video' | 'external'
export type ContentStatus = 'live' | 'dev' | 'planned'

export type Content = {
  id: string
  title: string
  category: ContentCategory
  type: ContentType
  status: ContentStatus
  url: string | null
  thumbnail_url: string | null
  description: string
  disclaimer_required: boolean
  sort_order: number
  is_featured: boolean
  tags: string[]
}

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  self: '自己理解・診断',
  health: '健康・ヘルスケア',
  fun: '娯楽・占い',
  pet: 'ペット',
}

export const CATEGORY_ICONS: Record<ContentCategory, string> = {
  self: '🧠',
  health: '🏥',
  fun: '🔮',
  pet: '🐾',
}

export const CATEGORY_DEFAULTS: Record<ContentCategory, string> = {
  self: '/images/default-self.svg',
  health: '/images/default-health.svg',
  fun: '/images/default-fun.svg',
  pet: '/images/default-pet.svg',
}

export type Column = {
  id: string
  category: 'health' | 'self' | 'nature' | 'science' | 'seasonal'
  title: string
  desc: string
  season: ('spring' | 'summer' | 'autumn' | 'winter' | 'any')[]
  weather: ('sunny' | 'rainy' | 'cloudy' | 'any')[]
  tags: string[]
  related_app?: string
}
