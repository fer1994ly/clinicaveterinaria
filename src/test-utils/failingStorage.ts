import { StorageWriteError } from '../shared/domain/storage'
import { MemoryStorage } from '../shared/infrastructure/memoryStorage'

/** In-memory storage whose writes can be switched to fail, like a full or blocked browser storage. */
export class FailingStorage extends MemoryStorage {
  failWrites = true

  override setItem(key: string, value: string): void {
    if (this.failWrites) throw new StorageWriteError(key)
    super.setItem(key, value)
  }
}
