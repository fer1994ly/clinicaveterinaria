import type { KeyValueStorage } from '../domain/storage'

/** Browser sessionStorage adapter (cleared when the tab closes); never throws. */
export class SessionStorageAdapter implements KeyValueStorage {
  getItem(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  }

  removeItem(key: string): void {
    try {
      window.sessionStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }
}
