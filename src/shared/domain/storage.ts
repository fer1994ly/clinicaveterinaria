/**
 * Port: minimal synchronous key/value storage.
 * To move to a backend, implement this (or replace the repositories built on it).
 * `setItem` throws StorageWriteError when the write is refused; reads never throw.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/** Raised by a storage adapter when a write is refused (quota exceeded, private mode, blocked storage). */
export class StorageWriteError extends Error {
  constructor(readonly key: string) {
    super(`Could not write "${key}" to storage`)
    this.name = 'StorageWriteError'
  }
}

/** Told by repositories whether their latest write reached the storage; the UI turns it into a message. */
export interface WriteObserver {
  writeFailed(): void
  writeSucceeded(): void
}
