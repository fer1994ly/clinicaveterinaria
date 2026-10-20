import type { KeyValueStorage } from '../domain/storage'

/** Reads JSON, returning null when missing, corrupt or not matching the guard. */
export function readJson<T>(storage: KeyValueStorage, key: string, guard: (value: unknown) => value is T): T | null {
  const raw = storage.getItem(key)
  if (raw === null) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return guard(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeJson(storage: KeyValueStorage, key: string, value: unknown): void {
  storage.setItem(key, JSON.stringify(value))
}
