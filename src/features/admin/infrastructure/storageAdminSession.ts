import type { KeyValueStorage } from '../../../shared/domain/storage'
import type { AdminSession } from '../domain/ports'

export const ADMIN_SESSION_KEY = 'sienra.v1.admin-unlocked'

/** Keeps the unlocked flag in the given storage (sessionStorage in the browser: lasts until the tab closes). */
export class StorageAdminSession implements AdminSession {
  private readonly listeners = new Set<() => void>()

  constructor(private readonly storage: KeyValueStorage) {}

  isUnlocked(): boolean {
    return this.storage.getItem(ADMIN_SESSION_KEY) === '1'
  }

  unlock(): void {
    this.storage.setItem(ADMIN_SESSION_KEY, '1')
    this.emit()
  }

  lock(): void {
    this.storage.removeItem(ADMIN_SESSION_KEY)
    this.emit()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(): void {
    this.listeners.forEach((l) => l())
  }
}
