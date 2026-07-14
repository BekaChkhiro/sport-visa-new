"use client";

import type { ReactNode } from "react";
import { useDark, useT } from "./theme";
import { useInputCls } from "./kit";
import { Ic } from "./icons";

// Module-level form helpers. Defined OUTSIDE render bodies so their identity
// is stable — nested-in-render components remount every keystroke and drop
// input focus. Shared by the onboarding wizard and the profile edit form.

export function FField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const T = useT();
  return (
    <label className="block">
      <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>{label}</span>
      {children}
      {hint && <span className={`mt-1 block text-xs ${T.muted}`}>{hint}</span>}
    </label>
  );
}

export function FSelect({
  value,
  onChange,
  options,
  labelMap,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labelMap?: Record<string, string>;
}) {
  const dark = useDark();
  const T = useT();
  const inputCls = useInputCls();
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} appearance-none pr-10`}>
        {options.map((o) => (
          <option key={o} value={o} className={dark ? "bg-ink-900" : "bg-white"}>
            {labelMap ? labelMap[o] : o}
          </option>
        ))}
      </select>
      <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${T.muted}`}>{Ic.chevronDown("h-4 w-4")}</span>
    </div>
  );
}

export function FSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const T = useT();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className={`text-[13px] font-medium ${T.t2}`}>{label}</span>
        <span className={`font-mono text-[13px] font-semibold tabular-nums ${T.brand}`}>{value}%</span>
      </div>
      <input type="range" min={0} max={100} step={5} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand-400" />
    </div>
  );
}
