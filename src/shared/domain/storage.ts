/**
 * Port: minimal synchronous key/value storage.
 * To move to a backend, implement this (or replace the repositories built on it).
 */
export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
