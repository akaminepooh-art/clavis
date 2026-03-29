export type ContentCategory = 'self' | 'health' | 'fun' | 'farm'
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
  farm: 'あっきらきら農園',
}

export const CATEGORY_DEFAULTS: Record<ContentCategory, string> = {
  self: '/images/default-self.svg',
  health: '/images/default-health.svg',
  fun: '/images/default-fun.svg',
  farm: '/images/default-farm.svg',
}
