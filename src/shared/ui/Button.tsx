import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const BASE =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-base font-semibold transition focus-visible:outline disabled:opacity-50'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-health text-ink shadow-card hover:bg-health-dark hover:text-white',
  secondary: 'border border-ink/20 bg-white text-ink hover:bg-clinic-soft',
  danger: 'bg-danger-dark text-white hover:bg-danger',
  ghost: 'text-ink-soft hover:bg-ink/5',
}

/** Class names so links (react-router) can look like buttons. */
export function buttonClasses(variant: ButtonVariant = 'primary', extra = ''): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`.trim()
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />
}

/** Square 44px icon-only button. `label` is required for accessibility. */
export function IconButton({
  label,
  className = '',
  children,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-soft transition hover:bg-ink/5 hover:text-ink ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
