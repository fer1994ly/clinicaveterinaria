const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const pad = (n: number) => String(n).padStart(2, '0')

/** Calendar month value object. `month` is 1..12. */
export class YearMonth {
  private constructor(
    readonly year: number,
    readonly month: number,
  ) {}

  static of(year: number, month: number): YearMonth {
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      throw new RangeError(`Invalid year-month: ${year}-${month}`)
    }
    return new YearMonth(year, month)
  }

  static fromIsoDate(iso: string): YearMonth {
    const [y, m] = iso.split('-').map(Number)
    return YearMonth.of(y ?? Number.NaN, m ?? Number.NaN)
  }

  /** Uses the local calendar (what a person in Uruguay would call "today"). */
  static fromDate(date: Date): YearMonth {
    return YearMonth.of(date.getFullYear(), date.getMonth() + 1)
  }

  get key(): string {
    return `${this.year}-${pad(this.month)}`
  }

  contains(iso: string): boolean {
    return iso.slice(0, 7) === this.key
  }

  previous(): YearMonth {
    return this.month === 1 ? YearMonth.of(this.year - 1, 12) : YearMonth.of(this.year, this.month - 1)
  }

  daysInMonth(): number {
    return new Date(this.year, this.month, 0).getDate()
  }

  /** ISO date for a day of this month, clamped to 1..daysInMonth. */
  dayIso(day: number): string {
    const clamped = Math.min(Math.max(day, 1), this.daysInMonth())
    return `${this.key}-${pad(clamped)}`
  }

  label(): string {
    return `${MONTH_NAMES[this.month - 1]} de ${this.year}`
  }

  equals(other: YearMonth): boolean {
    return this.key === other.key
  }
}
