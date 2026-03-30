type InterestMap = {
  self:    number
  health:  number
  fortune: number
  game:    number
}

const KEY = 'pk_interest'

export const interest = {
  get: (): InterestMap => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{"self":0,"health":0,"fortune":0,"game":0}')
    } catch {
      return { self: 0, health: 0, fortune: 0, game: 0 }
    }
  },

  add: (category: keyof InterestMap, weight = 1) => {
    const m = interest.get()
    m[category] = (m[category] || 0) + weight
    localStorage.setItem(KEY, JSON.stringify(m))
  },

  reset: () => {
    localStorage.removeItem(KEY)
  },

  top: (): keyof InterestMap => {
    const m = interest.get()
    return Object.entries(m).sort(([, a], [, b]) => b - a)[0][0] as keyof InterestMap
  },

  total: (): number => {
    return Object.values(interest.get()).reduce((a, b) => a + b, 0)
  },
}
