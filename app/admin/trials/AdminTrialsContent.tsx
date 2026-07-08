"use client";

import { useState } from "react";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";

export type AdminTrialRow = {
  id: string;
  title: string;
  club: string;
  cn: string;
  ct: string;
  date: string;
  filled: number;
  slots: number;
  avg: number;
  status: string;
};

const TABS = ["ყველა", "ღია", "დაგეგმილი", "დასრულებული"];

function StatusBadge({ s }: { s: string }) {
  const dark = useDark();
  const map: Record<string, string> = {
    "ღია": dark ? "bg-brand-500/12 text-brand-300 border-brand-500/25" : "bg-brand-500/12 text-brand-700 border-brand-500/25",
    "დაგეგმილი": dark ? "bg-warning-500/12 text-warning-300 border-warning-500/25" : "bg-warning-500/12 text-warning-700 border-warning-500/25",
    "დასრულებული": dark ? "bg-ink-800 text-ink-400 border-ink-700" : "bg-ink-100 text-ink-500 border-ink-200",
  };
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${map[s]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span>;
}

export function AdminTrialsContent({ trials }: { trials: AdminTrialRow[] }) {
  const dark = useDark();
  const T = useT();
  const [tab, setTab] = useState("ყველა");
  const [q, setQ] = useState("");
  const list = trials.filter((t) => (tab === "ყველა" || t.status === tab) && (t.title.includes(q) || t.club.includes(q)));
  const tone = (t: string) => {
    const m: Record<string, string> = {
      brand: dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700",
      accent: dark ? "bg-accent-500/15 text-accent-300" : "bg-accent-500/15 text-accent-700",
      iris: dark ? "bg-iris-500/15 text-iris-300" : "bg-iris-500/15 text-iris-700",
      flame: dark ? "bg-flame-500/15 text-flame-300" : "bg-flame-500/15 text-flame-700",
    };
    return m[t] ?? T.square;
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className={`flex gap-1 rounded-pill border p-1 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"}`}>
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-pill px-3 py-1.5 text-[12.5px] font-medium transition-colors ${tab === t ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{t}</button>
          ))}
        </div>
        <div className="relative ml-auto">
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${T.faint}`}>{Ic.search("h-4 w-4")}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ძებნა სინჯით ან კლუბით" className={`h-10 w-72 rounded-field border pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`} />
        </div>
      </div>

      <div className={`rounded-card border ${T.border}`}>
        <div className={`grid grid-cols-[1fr_170px_100px_90px_120px] gap-4 border-b px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${T.thead} ${T.muted}`}>
          <span>სინჯი</span><span>კლუბი</span><span className="text-right">აპლიკანტი</span><span className="text-right">match</span><span>სტატუსი</span>
        </div>
        {list.map((t) => {
          const pctFill = Math.round((t.filled / t.slots) * 100);
          return (
            <div key={t.id} className={`grid grid-cols-[1fr_170px_100px_90px_120px] items-center gap-4 border-b px-5 py-3.5 last:border-0 transition-colors ${T.rowBorder} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
              <div className="min-w-0"><div className={`truncate text-[14px] font-medium ${T.h}`}>{t.title}</div><div className={`text-[12px] ${T.muted}`}>{t.date}</div></div>
              <div className="flex min-w-0 items-center gap-2.5">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-btn font-display text-[11px] font-bold ${tone(t.ct)}`}>{t.cn}</div>
                <span className={`truncate text-[13px] ${T.t2}`}>{t.club}</span>
              </div>
              <div className="text-right">
                <div className={`font-mono text-[13px] font-semibold tabular-nums ${T.t1}`}>{t.filled}/{t.slots}</div>
                <div className={`mt-1 h-1 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${pctFill}%` }} /></div>
              </div>
              <div className="text-right"><span className={`font-mono text-[14px] font-bold tabular-nums ${t.avg >= 80 ? T.brand : t.avg >= 65 ? "text-accent-400" : "text-warning-400"}`}>{t.avg}%</span></div>
              <div><StatusBadge s={t.status} /></div>
            </div>
          );
        })}
        {list.length === 0 && <div className={`px-5 py-12 text-center text-[13px] ${T.faint}`}>სინჯი ვერ მოიძებნა.</div>}
      </div>
    </div>
  );
}
