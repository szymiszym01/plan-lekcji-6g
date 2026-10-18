import type { ReactNode } from 'react'

const Ikona = ({ children, rozmiar = 24 }: { children: ReactNode; rozmiar?: number }) => (
  <svg
    width={rozmiar}
    height={rozmiar}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

export const IkonaDzis = () => (
  <Ikona>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M4 10h16" />
    <circle cx="12" cy="15" r="1.6" fill="currentColor" />
  </Ikona>
)

export const IkonaTydzien = () => (
  <Ikona>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M9 4v16M15 4v16" />
  </Ikona>
)

export const IkonaMiesiac = () => (
  <Ikona>
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <path d="M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" strokeWidth={2.6} />
  </Ikona>
)

export const IkonaNadchodzace = () => (
  <Ikona>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </Ikona>
)

export const IkonaUstawienia = () => (
  <Ikona>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Ikona>
)

export const IkonaPlus = () => (
  <Ikona rozmiar={28}>
    <path d="M12 5v14M5 12h14" strokeWidth={2.6} />
  </Ikona>
)

export const IkonaWstecz = () => (
  <Ikona>
    <path d="m15 5-7 7 7 7" strokeWidth={2.6} />
  </Ikona>
)

export const IkonaDalej = () => (
  <Ikona>
    <path d="m9 5 7 7-7 7" strokeWidth={2.6} />
  </Ikona>
)

export const IkonaZamknij = () => (
  <Ikona>
    <path d="M6 6l12 12M18 6 6 18" strokeWidth={2.4} />
  </Ikona>
)
