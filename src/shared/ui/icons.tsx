import type { ReactNode } from 'react'

interface IconProps {
  className?: string
}

function Svg({ className = 'h-6 w-6', children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9.5h13V10" />
  </Svg>
)

export const ListIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" />
  </Svg>
)

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
)

export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Svg>
)

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const PencilIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9a2.800 2.800 0 0 0-4-4L4 16z" />
    <path d="m13.500 6.500 4 4" />
  </Svg>
)

export const TrashIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12.500A1.500 1.500 0 0 0 8.500 21h7a1.500 1.500 0 0 0 1.500-1.500L18 7M9 7V4.500h6V7" />
  </Svg>
)

export const AlertIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.500 2.500 20h19z" />
    <path d="M12 10v4.500M12 17.500h.01" />
  </Svg>
)

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.500 4.500 4.500L19 7.500" />
  </Svg>
)

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.500" />
    <path d="m16 16 4 4" />
  </Svg>
)

export const ArrowLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
)

export const PawIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6.500" cy="10" r="1.800" />
    <circle cx="10" cy="5.800" r="1.800" />
    <circle cx="14" cy="5.800" r="1.800" />
    <circle cx="17.500" cy="10" r="1.800" />
    <path d="M12 12.500c-3 0-5 2.500-5 4.500 0 1.700 1.500 2.500 3 2.200 1.200-.3 1.500-.5 2-.5s.8.200 2 .5c1.500.3 3-.5 3-2.200 0-2-2-4.500-5-4.500z" />
  </Svg>
)
