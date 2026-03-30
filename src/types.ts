export type ContentCategory = 'self' | 'health' | 'fortune' | 'game' | 'pet'
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
  fortune: '占い',
  game: '娯楽・ゲーム',
  pet: 'ペット',
}

export const CATEGORY_ICONS: Record<ContentCategory, string> = {
  self: '🧠',
  health: '🏥',
  fortune: '🔮',
  game: '🎮',
  pet: '🐾',
}

export const CATEGORY_DEFAULTS: Record<ContentCategory, string> = {
  self: '/default-self.jpg',
  health: '/default-health.jpg',
  fortune: '/default-fun.jpg',
  game: '/default-fun.jpg',
  pet: '/default-pet.jpg',
}

export const COLUMN_DEFAULTS: Record<string, string> = {
  health:   '/default-health.jpg',
  self:     '/default-self.jpg',
  nature:   '/default-nature.jpg',
  science:  '/default-science.jpg',
  seasonal: '/default-seasonal.jpg',
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
