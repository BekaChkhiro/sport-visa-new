"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/* Theme class map — mirrors the Planflow design's theme(d) helper exactly.
   Dark is the default. The active mode is held in context and persisted. */
export function theme(d: boolean) {
  return {
    page: d ? "bg-ink-950 text-ink-50" : "bg-ink-50 text-ink-900",
    header: d ? "border-ink-800 bg-ink-950/85" : "border-ink-200 bg-ink-50/85",
    card: d ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white",
    soft: d ? "border-ink-800 bg-ink-900/40" : "border-ink-200 bg-white",
    softBg: d ? "bg-ink-900/40" : "bg-ink-50",
    softCard: d ? "border-ink-800 bg-ink-900/40" : "border-ink-200 bg-ink-100/60",
    border: d ? "border-ink-800" : "border-ink-200",
    borderStrong: d ? "border-ink-700" : "border-ink-300",
    square: d ? "bg-ink-800 text-ink-200" : "bg-ink-100 text-ink-700",
    h: d ? "text-ink-50" : "text-ink-900",
    t1: d ? "text-ink-100" : "text-ink-800",
    t2: d ? "text-ink-200" : "text-ink-700",
    t3: d ? "text-ink-300" : "text-ink-600",
    muted: d ? "text-ink-400" : "text-ink-500",
    faint: d ? "text-ink-500" : "text-ink-400",
    dot: d ? "text-ink-600" : "text-ink-300",
    brand: d ? "text-brand-400" : "text-brand-600",
    brand2: d ? "text-brand-300" : "text-brand-700",
    track: d ? "bg-ink-800" : "bg-ink-200",
    ringTrack: d ? "stroke-ink-800" : "stroke-ink-200",
    ringOffset: d ? "ring-offset-ink-950" : "ring-offset-ink-50",
    navActive: d ? "bg-ink-800 text-ink-50" : "bg-ink-100 text-ink-900",
    navIdle: d
      ? "text-ink-400 hover:text-ink-100"
      : "text-ink-500 hover:text-ink-900",
    iconBtn: d
      ? "border-ink-800 text-ink-300 hover:bg-ink-800 hover:text-ink-50"
      : "border-ink-200 text-ink-500 hover:bg-ink-100 hover:text-ink-900",
    iconBtnFlat: d
      ? "text-ink-400 hover:bg-ink-800 hover:text-ink-100"
      : "text-ink-500 hover:bg-ink-100 hover:text-ink-900",
    hoverBg: d ? "hover:bg-ink-800" : "hover:bg-ink-100",
    input: d
      ? "bg-ink-900 border-ink-700 text-ink-50 placeholder:text-ink-500"
      : "bg-white border-ink-300 text-ink-900 placeholder:text-ink-400",
    chipIdle: d
      ? "border-ink-700 text-ink-300 hover:border-ink-600 hover:text-ink-100"
      : "border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-900",
    overlay: d ? "bg-ink-950/80" : "bg-ink-900/50",
    dashed: d ? "border-ink-700" : "border-ink-300",
    rowBorder: d ? "border-ink-800/60" : "border-ink-100",
    thead: d ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-ink-50",
  };
}

export type ThemeMap = ReturnType<typeof theme>;

type ThemeCtxValue = {
  dark: boolean;
  setDark: (v: boolean) => void;
  toggle: () => void;
};

const ThemeCtx = createContext<ThemeCtxValue>({
  dark: true,
  setDark: () => {},
  toggle: () => {},
});

const STORAGE_KEY = "sv-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDarkState] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light") setDarkState(false);
    else if (stored === "dark") setDarkState(true);
  }, []);

  const setDark = useCallback((v: boolean) => {
    setDarkState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? "dark" : "light");
    } catch {}
  }, []);

  const toggle = useCallback(() => setDark(!dark), [dark, setDark]);

  return (
    <ThemeCtx.Provider value={{ dark, setDark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useDark() {
  return useContext(ThemeCtx).dark;
}

export function useThemeCtx() {
  return useContext(ThemeCtx);
}

export function useT() {
  return theme(useContext(ThemeCtx).dark);
}
