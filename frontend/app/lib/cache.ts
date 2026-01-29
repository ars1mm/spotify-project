interface CacheItem<T = unknown> {
  data: T
  timestamp: number
}

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

class Cache {
  private cache = new Map<string, CacheItem<unknown>>()

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  clear(): void {
    this.cache.clear()
  }
}

export const cache = new Cache()