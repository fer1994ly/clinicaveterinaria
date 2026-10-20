export interface AdminSession {
  isUnlocked(): boolean
  unlock(): void
  lock(): void
  subscribe(listener: () => void): () => void
}
