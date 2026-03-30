export function hashDate(date: Date): number {
  const str = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function shuffleSeed<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.abs(seed ^ (seed >> (i % 16))) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function weekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}
