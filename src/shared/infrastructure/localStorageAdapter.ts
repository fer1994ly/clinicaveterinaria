import { StorageWriteError, type KeyValueStorage } from '../domain/storage'

/** Browser localStorage adapter. Reads/removes never throw; a refused write (quota, private mode) raises StorageWriteError. */
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
      throw new StorageWriteError(key)
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
