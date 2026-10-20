import type { WriteObserver } from '../domain/storage'

/** Observable "is the last save failing?" flag, fed by the repositories and read by the UI banner. */
export class StorageStatus implements WriteObserver {
  private readonly listeners = new Set<() => void>()
  private failing = false

  hasFailed(): boolean {
    return this.failing
  }

  writeFailed(): void {
    this.set(true)
  }

  writeSucceeded(): void {
    this.set(false)
  }

  dismiss(): void {
    this.set(false)
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private set(value: boolean): void {
    if (this.failing === value) return
    this.failing = value
    this.listeners.forEach((l) => l())
  }
}
