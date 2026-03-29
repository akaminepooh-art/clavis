export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type SeasonConfig = {
  season: Season
  label: string
  emoji: string
  greeting: string
  farmMessage: string
  farmFruits: string[]
  accentClass: string
}

export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

const SEASON_CONFIGS: Record<Season, SeasonConfig> = {
  spring: {
    season: 'spring',
    label: '春',
    emoji: '\u{1F338}',
    greeting: '春の訪れとともに、新しいことを始めてみませんか？',
    farmMessage: 'いちご狩りシーズン到来！',
    farmFruits: ['いちご'],
    accentClass: 'from-pink-50 to-cl-primary-light',
  },
  summer: {
    season: 'summer',
    label: '夏',
    emoji: '\u{1F33B}',
    greeting: '暑い夏を楽しく乗り越えましょう！',
    farmMessage: 'ブルーベリー＆桃が旬です！',
    farmFruits: ['ブルーベリー', '桃'],
    accentClass: 'from-sky-50 to-cl-primary-light',
  },
  autumn: {
    season: 'autumn',
    label: '秋',
    emoji: '\u{1F341}',
    greeting: '実りの秋、自分を深く知るチャンスです。',
    farmMessage: 'シャインマスカットの収穫体験！',
    farmFruits: ['シャインマスカット'],
    accentClass: 'from-orange-50 to-cl-primary-light',
  },
  winter: {
    season: 'winter',
    label: '冬',
    emoji: '\u{2744}\u{FE0F}',
    greeting: '冬のひととき、心温まる診断をどうぞ。',
    farmMessage: 'いちごの季節がやってきます！',
    farmFruits: ['いちご', 'キウイ'],
    accentClass: 'from-blue-50 to-cl-primary-light',
  },
}

export function getSeasonConfig(date?: Date): SeasonConfig {
  return SEASON_CONFIGS[getCurrentSeason(date)]
}
