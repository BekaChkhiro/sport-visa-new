import type { ReactNode } from "react";

// Inline 24×24 stroke icons — matches the Planflow design's Ic set.
// Usage: Ic.pin("h-4 w-4")
type IconFn = (c?: string) => ReactNode;

const svg = (className: string, children: ReactNode): ReactNode => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const Ic: Record<string, IconFn> = {
  pin: (c = "") =>
    svg(c, (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="2.6" />
      </>
    )),
  calendar: (c = "") =>
    svg(c, (
      <>
        <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
        <path d="M3 9h18M8 2.5v4M16 2.5v4" />
      </>
    )),
  users: (c = "") =>
    svg(c, (
      <>
        <path d="M16 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19" />
        <circle cx="9" cy="7" r="3.2" />
        <path d="M22 19v-1.5a4 4 0 0 0-3-3.87M16 3.5a4 4 0 0 1 0 7" />
      </>
    )),
  check: (c = "") =>
    svg("stroke-[2.2] " + c, <path d="M20 6 9 17l-5-5" />),
  arrow: (c = "") => svg(c, <path d="M5 12h14M13 6l6 6-6 6" />),
  arrowLeft: (c = "") => svg(c, <path d="M19 12H5M11 18l-6-6 6-6" />),
  bolt: (c = "") => svg(c, <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />),
  close: (c = "") => svg("stroke-2 " + c, <path d="M18 6 6 18M6 6l12 12" />),
  search: (c = "") =>
    svg(c, (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
      </>
    )),
  chevron: (c = "") => svg(c, <path d="m9 6 6 6-6 6" />),
  chevronDown: (c = "") => svg(c, <path d="m6 9 6 6 6-6" />),
  sun: (c = "") =>
    svg(c, (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    )),
  moon: (c = "") =>
    svg(c, <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />),
  video: (c = "") =>
    svg(c, (
      <>
        <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
        <path d="m15.5 10 6-3v10l-6-3z" />
      </>
    )),
  bell: (c = "") =>
    svg(c, (
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
    )),
  user: (c = "") =>
    svg(c, (
      <>
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" />
      </>
    )),
  gear: (c = "") =>
    svg(c, (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2.06 2.06 0 1 1-2.92 2.92l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V20a2.06 2.06 0 1 1-4.12 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2.06 2.06 0 1 1-2.92-2.92l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4a2.06 2.06 0 1 1 0-4.12h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.06 2.06 0 1 1 2.92-2.92l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V4a2.06 2.06 0 1 1 4.12 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2.06 2.06 0 1 1 2.92 2.92l-.06.06a1.7 1.7 0 0 0-.34 1.87V10c.16.43.5.8 1 1H20a2.06 2.06 0 1 1 0 4.12h-.09c-.5 0-.9.28-1.1.9Z" />
      </>
    )),
  logout: (c = "") =>
    svg(c, (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5M21 12H9" />
      </>
    )),
  plus: (c = "") => svg("stroke-2 " + c, <path d="M12 5v14M5 12h14" />),
  minus: (c = "") => svg("stroke-2 " + c, <path d="M5 12h14" />),
  play: (c = "") => svg(c, <path d="M6 4.5v15l13-7.5-13-7.5Z" />),
  target: (c = "") =>
    svg(c, (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.4" />
      </>
    )),
  edit: (c = "") =>
    svg(c, (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </>
    )),
  trash: (c = "") =>
    svg(c, (
      <>
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M10 11v6M14 11v6" />
      </>
    )),
  upload: (c = "") =>
    svg(c, (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M17 8l-5-5-5 5M12 3v12" />
      </>
    )),
  mail: (c = "") =>
    svg(c, (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m3 7 9 6 9-6" />
      </>
    )),
  phone: (c = "") =>
    svg(c, (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
    )),
  shield: (c = "") =>
    svg(c, (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    )),
  chart: (c = "") =>
    svg(c, (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l3-4 3 2 4-6" />
      </>
    )),
  filter: (c = "") =>
    svg(c, <path d="M4 5h16M7 12h10M10 19h4" />),
  clock: (c = "") =>
    svg(c, (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    )),
  eye: (c = "") =>
    svg(c, (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )),
  image: (c = "") =>
    svg(c, (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="m21 16-5-5L5 21" />
      </>
    )),
  trophy: (c = "") =>
    svg(c, (
      <>
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
        <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" />
      </>
    )),
  flag: (c = "") =>
    svg(c, (
      <>
        <path d="M4 22V4M4 4h13l-2 4 2 4H4" />
      </>
    )),
  building: (c = "") =>
    svg(c, (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
      </>
    )),
  ball: (c = "") =>
    svg(c, (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m12 7 3 2.2-1.1 3.6h-3.8L9 9.2 12 7Z" />
      </>
    )),
  x: (c = "") => svg("stroke-2 " + c, <path d="M18 6 6 18M6 6l12 12" />),
  menu: (c = "") => svg(c, <path d="M4 6h16M4 12h16M4 18h16" />),
  dots: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  ),
};
