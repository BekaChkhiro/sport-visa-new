"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useDark, useT, useThemeCtx } from "./theme";
import { Ic } from "./icons";

/* ---- Brand mark ---------------------------------------------------------- */
export function Logo({ size = 28 }: { size?: number }) {
  const T = useT();
  return (
    <span className="inline-flex items-center gap-2 font-display">
      <span
        className="grid place-items-center rounded-btn bg-brand-400 font-extrabold text-ink-950"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        SV
      </span>
      <span className={`text-[17px] font-bold tracking-tight ${T.h}`}>
        Sport<span className={T.brand}>Visa</span>
      </span>
    </span>
  );
}

/* ---- Theme toggle -------------------------------------------------------- */
export function ThemeToggle({ bordered = true }: { bordered?: boolean }) {
  const { dark, toggle } = useThemeCtx();
  const T = useT();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="თემის გადართვა"
      className={`grid h-9 w-9 place-items-center rounded-btn transition-colors ${
        bordered ? `border ${T.iconBtn}` : T.iconBtnFlat
      }`}
    >
      {dark ? Ic.moon("h-[18px] w-[18px]") : Ic.sun("h-[18px] w-[18px]")}
    </button>
  );
}

/* ---- Button -------------------------------------------------------------- */
export function Btn({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const dark = useDark();
  const T = useT();
  const sizes: Record<string, string> = {
    sm: "h-9 px-3.5 text-[13px] gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-12 px-6 text-[15px] gap-2",
  };
  const variants: Record<string, string> = {
    primary:
      "bg-brand-400 text-ink-950 font-semibold hover:bg-brand-300 active:bg-brand-500 shadow-xs",
    secondary: dark
      ? "bg-ink-800 text-ink-50 font-medium border border-ink-700 hover:bg-ink-700 hover:border-ink-600"
      : "bg-ink-100 text-ink-900 font-medium border border-ink-200 hover:bg-ink-200",
    ghost: dark
      ? "text-ink-200 font-medium hover:bg-ink-800 hover:text-ink-50"
      : "text-ink-700 font-medium hover:bg-ink-100 hover:text-ink-900",
    outline: `border border-brand-500/60 font-medium hover:bg-brand-500/10 hover:border-brand-400 ${
      dark ? "text-brand-300" : "text-brand-700"
    }`,
    danger: dark
      ? "bg-danger-500/15 text-danger-300 font-medium border border-danger-500/30 hover:bg-danger-500/25"
      : "bg-danger-500/12 text-danger-600 font-medium border border-danger-500/30 hover:bg-danger-500/20",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-btn transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 ${T.ringOffset} disabled:opacity-40 disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---- Form field ---------------------------------------------------------- */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const T = useT();
  return (
    <label className="block">
      <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-danger-500">{error}</span>
      ) : hint ? (
        <span className={`mt-1 block text-xs ${T.muted}`}>{hint}</span>
      ) : null}
    </label>
  );
}

/* ---- Text input class (for use inside Field) ----------------------------- */
export function useInputCls(error = false) {
  const dark = useDark();
  const T = useT();
  if (error) {
    return `w-full h-11 rounded-field border border-danger-500/60 px-3.5 text-sm outline-none transition-colors ${
      dark ? "bg-ink-900 text-ink-50" : "bg-white text-ink-900"
    }`;
  }
  return `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;
}

/* ---- Badge / Chip -------------------------------------------------------- */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "accent" | "warning" | "danger" | "iris" | "info";
}) {
  const dark = useDark();
  const tones: Record<string, string> = {
    neutral: dark
      ? "bg-ink-800 text-ink-200 border-ink-700"
      : "bg-ink-100 text-ink-700 border-ink-200",
    brand: `bg-brand-500/12 border-brand-500/25 ${dark ? "text-brand-300" : "text-brand-700"}`,
    accent: `bg-accent-500/12 border-accent-500/25 ${dark ? "text-accent-300" : "text-accent-700"}`,
    warning: `bg-warning-500/12 border-warning-500/25 ${dark ? "text-warning-300" : "text-warning-700"}`,
    danger: `bg-danger-500/12 border-danger-500/25 ${dark ? "text-danger-300" : "text-danger-600"}`,
    iris: `bg-iris-500/12 border-iris-500/25 ${dark ? "text-iris-300" : "text-iris-700"}`,
    info: `bg-info-500/12 border-info-500/25 ${dark ? "text-info-300" : "text-info-700"}`,
  };
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Chip({
  children,
  active = false,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  const T = useT();
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active ? `border-brand-400 bg-brand-500/15 ${T.brand2}` : T.chipIdle
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---- Initials avatar ----------------------------------------------------- */
const AVATAR_TONES = [
  { d: "bg-brand-500/15 text-brand-300", l: "bg-brand-500/15 text-brand-700" },
  { d: "bg-accent-500/15 text-accent-300", l: "bg-accent-500/15 text-accent-700" },
  { d: "bg-iris-500/15 text-iris-300", l: "bg-iris-500/15 text-iris-700" },
  { d: "bg-flame-500/15 text-flame-300", l: "bg-flame-500/15 text-flame-700" },
  { d: "bg-info-500/15 text-info-300", l: "bg-info-500/15 text-info-700" },
  { d: "bg-warning-500/15 text-warning-300", l: "bg-warning-500/15 text-warning-700" },
];

function toneFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function InitialsAvatar({
  name,
  size = 40,
  rounded = "full",
  ring = false,
  className = "",
}: {
  name: string;
  size?: number;
  rounded?: "full" | "card" | "btn";
  ring?: boolean;
  className?: string;
}) {
  const dark = useDark();
  const T = useT();
  const tone = toneFor(name);
  const radius = rounded === "full" ? "rounded-full" : rounded === "card" ? "rounded-card" : "rounded-btn";
  return (
    <span
      aria-label={name}
      className={`inline-grid shrink-0 place-items-center font-display font-bold ${radius} ${dark ? tone.d : tone.l} ${ring ? `ring-2 ring-brand-400 ring-offset-2 ${T.ringOffset}` : ""} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initialsOf(name)}
    </span>
  );
}

/* ---- Avatar (image with initials fallback) ------------------------------- */
export function Avatar({
  src,
  name = "",
  size = 40,
  ring = false,
}: {
  n?: number;
  src?: string;
  name?: string;
  size?: number;
  ring?: boolean;
}) {
  const T = useT();
  if (!src) return <InitialsAvatar name={name} size={size} ring={ring} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`rounded-full object-cover ${
        ring ? `ring-2 ring-brand-400 ring-offset-2 ${T.ringOffset}` : ""
      }`}
      style={{ width: size, height: size }}
    />
  );
}

/* ---- Match score ring (signature component) ------------------------------ */
export function MatchRing({ score, size = 68 }: { score: number; size?: number }) {
  const dark = useDark();
  const T = useT();
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const tone =
    score >= 80
      ? dark
        ? "text-brand-400"
        : "text-brand-600"
      : score >= 60
        ? dark
          ? "text-accent-400"
          : "text-accent-600"
        : dark
          ? "text-warning-400"
          : "text-warning-600";
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth="5"
          className={T.ringTrack}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          className={tone}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <div className="absolute text-center">
        <div
          className={`font-mono text-[17px] font-bold leading-none tabular-nums ${tone}`}
        >
          {score}
        </div>
        <div
          className={`text-[9px] font-medium uppercase tracking-wider ${T.muted}`}
        >
          match
        </div>
      </div>
    </div>
  );
}

/* ---- Stat tile ----------------------------------------------------------- */
export function StatTile({
  label,
  value,
  accent = false,
  icon,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  icon?: ReactNode;
}) {
  const T = useT();
  return (
    <div className={`rounded-card border p-5 ${T.card}`}>
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`text-[12px] font-medium uppercase tracking-wide ${T.muted}`}
        >
          {label}
        </span>
        <span className={accent ? T.brand : T.faint}>{icon}</span>
      </div>
      <div
        className={`font-mono text-[30px] font-bold leading-none tabular-nums ${accent ? T.brand : T.h}`}
      >
        {value}
      </div>
    </div>
  );
}

/* ---- Alert --------------------------------------------------------------- */
export function Alert({
  tone = "brand",
  title,
  children,
}: {
  tone?: "brand" | "warning" | "danger" | "info";
  title: string;
  children?: ReactNode;
}) {
  const dark = useDark();
  const T = useT();
  const map: Record<string, string> = {
    brand: `border-brand-500/25 bg-brand-500/8 ${dark ? "text-brand-200" : "text-brand-700"}`,
    warning: `border-warning-500/25 bg-warning-500/8 ${dark ? "text-warning-200" : "text-warning-700"}`,
    danger: `border-danger-500/25 bg-danger-500/8 ${dark ? "text-danger-200" : "text-danger-600"}`,
    info: `border-info-500/25 bg-info-500/8 ${dark ? "text-info-200" : "text-info-700"}`,
  };
  return (
    <div className={`flex gap-3 rounded-card border p-4 ${map[tone]}`}>
      <span className="mt-0.5 shrink-0">{Ic.bolt("h-[18px] w-[18px]")}</span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {children && <div className={`mt-0.5 text-[13px] ${T.t3}`}>{children}</div>}
      </div>
    </div>
  );
}
