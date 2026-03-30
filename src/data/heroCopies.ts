export const HERO_COPIES: Record<string, Record<string, string>> = {
  sunny: {
    spring: '澄んだ空気が、思考を鋭くする日。',
    summer: '強い光の下で、自分の輪郭を確かめる日。',
    autumn: '乾いた風が、余分なものを払う日。',
    winter: '冷えた空気の中で、本質だけが残る日。',
  },
  rainy: {
    spring: '雨音の中で、内側と向き合う日。',
    summer: '雨粒が、思考をゆっくりと整理する。',
    autumn: '静かな雨が、感情を言語化する手伝いをする。',
    winter: '雨に打たれながら、冬の自分を見つめる。',
  },
  cloudy: {
    spring: '曇り空の下で、静かに自分を整理する日。',
    summer: '影の中で、冷静な判断力が働く日。',
    autumn: '灰色の空が、深い思考を誘う。',
    winter: '厚い雲の向こうに、光を探す日。',
  },
}

export const WEEKLY_FEATURES = [
  '自己理解を深める週',
  '健康習慣を見直す週',
  '運気を高める週',
  '新しい自分を発見する週',
  'ペットと向き合う週',
  '内省と対話の週',
  '行動と決断の週',
]

export function getHeroCopy(weather: string, season: string): string {
  return HERO_COPIES[weather]?.[season] ?? '今日も、自分らしく。'
}
