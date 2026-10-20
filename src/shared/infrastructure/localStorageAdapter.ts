import type { KeyValueStorage } from '../domain/storage'

/** Browser localStorage adapter that never throws (private mode, quota, disabled storage). */
export class LocalStorageAdapter implements KeyValueStorage {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* storage unavailable: keep the app usable for the session */
    }
  }

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }
}
