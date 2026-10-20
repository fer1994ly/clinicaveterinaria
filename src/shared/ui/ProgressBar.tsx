interface ProgressBarProps {
  /** 0..100; values above 100 are drawn at full width */
  value: number
  label: string
  /** tailwind background class for the fill */
  fillClassName?: string
}

export function ProgressBar({ value, label, fillClassName = 'bg-health' }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      className="h-3 w-full overflow-hidden rounded-full bg-ink/10"
    >
      <div className={`h-full rounded-full transition-[width] duration-300 ${fillClassName}`} style={{ width: `${width}%` }} />
    </div>
  )
}
