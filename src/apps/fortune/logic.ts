const LUCKY_COLORS = [
  '赤', '青', '緑', '黄', '紫', 'オレンジ', 'ピンク', '白', '金', 'ターコイズ',
]

const LUCKY_FOODS = [
  'いちご', 'シャインマスカット', '桃', 'ブルーベリー', 'キウイ',
  'カレー', 'パスタ', 'おにぎり', 'チョコレート', 'サラダ',
  'うどん', 'ラーメン', '寿司', 'ステーキ', 'プリン',
]

const FARM_FRUITS = ['いちご', 'シャインマスカット', '桃', 'ブルーベリー', 'キウイ']

const MESSAGES = [
  '今日は新しいことを始めるのに最適な日です。',
  '周囲への感謝を忘れずに過ごしましょう。',
  '直感を信じて行動すると良い結果が生まれます。',
  '穏やかな気持ちで過ごすと運気がアップします。',
  '小さな幸せに気づける一日になりそうです。',
  '思いやりの気持ちが幸運を呼び込みます。',
  '自分を大切にする時間を作りましょう。',
  '行動力が運気を切り開く鍵になります。',
  '笑顔が幸運のスイッチを押してくれます。',
  '丁寧な暮らしを心がけると良い流れが来ます。',
]

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function deriveScore(hash: number, category: string): number {
  const seed = simpleHash(`${hash}-${category}`)
  return Math.round(50 + (seed % 51))
}

export type FortuneResult = {
  overall: number
  scores: {
    love: number
    work: number
    money: number
    health: number
  }
  lucky: {
    color: string
    food: string
    number: number
  }
  message: string
  showFarmBanner: boolean
}

export function generateFortune(birthdate: string, today: string): FortuneResult {
  const hash = simpleHash(`${birthdate}-${today}`) % 100
  const luckyFood = LUCKY_FOODS[hash % LUCKY_FOODS.length]

  return {
    overall: Math.round(60 + hash * 0.4),
    scores: {
      love: deriveScore(hash, 'love'),
      work: deriveScore(hash, 'work'),
      money: deriveScore(hash, 'money'),
      health: deriveScore(hash, 'health'),
    },
    lucky: {
      color: LUCKY_COLORS[hash % LUCKY_COLORS.length],
      food: luckyFood,
      number: (hash % 9) + 1,
    },
    message: MESSAGES[hash % MESSAGES.length],
    showFarmBanner: FARM_FRUITS.includes(luckyFood),
  }
}
