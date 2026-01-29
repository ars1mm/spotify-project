/**
 * Interfejsi për elementet e cache-it
 * @template T - Tipi i të dhënave që ruhen në cache
 */
interface CacheItem<T = unknown> {
  /** Të dhënat që ruhen */
  data: T
  /** Koha kur janë ruajtur të dhënat (timestamp) */
  timestamp: number
}

/** Kohëzgjatja e cache-it në milisekonda (30 minuta) */
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

/**
 * Klasa Cache për ruajtjen e përkohshme të të dhënave
 * Përdoret për të shmangur thirrjet e panevojshme të API-ve
 */
class Cache {
  /** Map-i privat që ruan të dhënat e cache-it */
  private cache = new Map<string, CacheItem<unknown>>()

  /**
   * Ruan të dhëna në cache
   * @template T - Tipi i të dhënave
   * @param key - Çelësi unik për të dhënat
   * @param data - Të dhënat që do të ruhen
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Merr të dhëna nga cache-i
   * @template T - Tipi i të dhënave që priten
   * @param key - Çelësi për të dhënat
   * @returns Të dhënat nëse gjenden dhe janë të vlefshme, përndryshe null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Kontrollon nëse të dhënat kanë skaduar
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * Pastron të gjithë cache-in
   */
  clear(): void {
    this.cache.clear()
  }
}

/** Instanca globale e cache-it për përdorim në aplikacion */export const cache = new Cache()