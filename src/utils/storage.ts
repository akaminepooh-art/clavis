const DB_NAME = 'portakey'
const DB_VERSION = 1
const STORE_NAME = 'history'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export type HistoryEntry = {
  id: string
  appId: string
  date: string
  result: unknown
}

export async function saveHistory(entry: HistoryEntry): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(entry)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.error('IndexedDB save failed, falling back to localStorage:', err)
    const key = `pk_history_${entry.appId}_${entry.date}`
    localStorage.setItem(key, JSON.stringify(entry))
  }
}

export async function getHistory(appId: string): Promise<HistoryEntry[]> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const all: HistoryEntry[] = await new Promise((resolve, reject) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    return all.filter((e) => e.appId === appId).sort((a, b) => b.date.localeCompare(a.date))
  } catch (err) {
    console.error('IndexedDB read failed:', err)
    return []
  }
}

export function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function setLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('localStorage write failed:', err)
  }
}
