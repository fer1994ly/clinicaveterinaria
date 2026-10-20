import type { Clock } from '../domain/clock'

/** Clock frozen at a given ISO date (noon local time). Handy for tests and demos. */
export class FixedClock implements Clock {
  private current: Date

  constructor(isoDate: string) {
    this.current = FixedClock.parse(isoDate)
  }

  set(isoDate: string): void {
    this.current = FixedClock.parse(isoDate)
  }

  now(): Date {
    return new Date(this.current.getTime())
  }

  private static parse(isoDate: string): Date {
    const [y, m, d] = isoDate.split('-').map(Number)
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12, 0, 0)
  }
}
