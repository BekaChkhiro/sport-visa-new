"use client";

import { useState } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { InitialsAvatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";

export type ClubTrialRow = {
  id: string;
  title: string;
  date: string;
  pos: string;
  filled: number;
  slots: number;
  avg: number;
  status: string;
};
export type RecentApplicant = { id: string; n: number; name: string; pos: string; score: number };

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

export function ClubDashboardContent({
  kpis,
  trials,
  recent,
}: {
  kpis: { activeTrials: number; activeSub: string; totalApplicants: number; newApplicants: number; avgMatch: number };
  trials: ClubTrialRow[];
  recent: RecentApplicant[];
}) {
  const dark = useDark();
  const T = useT();
  const [tab, setTab] = useState("ყველა");
  const list = trials.filter((t) => tab === "ყველა" || t.status === tab);

  const KPI = [
    { l: "აქტიური სინჯი", v: String(kpis.activeTrials), sub: kpis.activeSub, ic: Ic.calendar, accent: false },
    { l: "სულ აპლიკანტი", v: String(kpis.totalApplicants), sub: `+${kpis.newApplicants} ბოლო 7 დღეში`, ic: Ic.users, accent: true },
    { l: "ახალი განაცხადი", v: String(kpis.newApplicants), sub: "ბოლო 7 დღეში", ic: Ic.chart, accent: false },
    { l: "საშ. თავსებადობა", v: `${kpis.avgMatch}%`, sub: "ღია სინჯებზე", ic: Ic.shield, accent: false },
  ];

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI.map((k) => (
          <div key={k.l} className={`rounded-card border p-5 ${T.card}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className={`text-[12px] font-medium uppercase tracking-wide ${T.muted}`}>{k.l}</span>
              <span className={k.accent ? T.brand : T.faint}>{k.ic("h-4 w-4")}</span>
            </div>
            <div className={`font-mono text-[28px] font-bold leading-none tabular-nums ${k.accent ? T.brand : T.h}`}>{k.v}</div>
            <div className={`mt-2 text-[12px] ${T.muted}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Trials table */}
        <div className={`rounded-card border ${T.soft}`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${T.border}`}>
            <h2 className={`text-[15px] font-bold ${T.h}`}>ჩემი სინჯები</h2>
            <div className={`flex gap-1 rounded-pill border p-1 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"}`}>
              {TABS.map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-pill px-3 py-1.5 text-[12.5px] font-medium transition-colors ${tab === t ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${T.border} ${T.muted}`}>
            <span>სინჯი</span><span className="text-right">აპლიკანტი</span><span className="text-right">საშ. match</span><span className="text-right">სტატუსი</span>
          </div>
          {list.map((t) => {
            const pctFill = Math.round((t.filled / t.slots) * 100);
            return (
              <Link key={t.id} href={`/club/trials/${t.id}`} className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b px-5 py-4 last:border-0 transition-colors ${T.rowBorder} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
                <div className="min-w-0">
                  <div className={`truncate text-[14px] font-semibold ${T.h}`}>{t.title}</div>
                  <div className={`mt-0.5 flex items-center gap-2 text-[12px] ${T.muted}`}><span>{t.date}</span><span className={T.dot}>·</span><span>{t.pos}</span></div>
                </div>
                <div className="w-24 text-right">
                  <div className={`font-mono text-[13px] font-semibold tabular-nums ${T.t1}`}>{t.filled}/{t.slots}</div>
                  <div className={`mt-1 h-1 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${pctFill}%` }} /></div>
                </div>
                <div className="w-14 text-right"><span className={`font-mono text-[14px] font-bold tabular-nums ${t.avg >= 80 ? T.brand : t.avg >= 65 ? "text-accent-400" : "text-warning-400"}`}>{t.avg}%</span></div>
                <div className="flex w-28 justify-end"><StatusBadge s={t.status} /></div>
              </Link>
            );
          })}
          {list.length === 0 && <div className={`px-5 py-10 text-center text-[13px] ${T.faint}`}>ამ სტატუსით სინჯი არ არის.</div>}
        </div>

        {/* Recent applicants */}
        <aside className={`rounded-card border ${T.soft}`}>
          <div className={`flex items-center justify-between border-b px-5 py-4 ${T.border}`}>
            <h2 className={`text-[15px] font-bold ${T.h}`}>ბოლო აპლიკანტები</h2>
            <Link href="/club/applicants" className={`inline-flex items-center gap-1 text-[12.5px] font-medium ${T.brand}`}>ყველა {Ic.arrow("h-3.5 w-3.5")}</Link>
          </div>
          <div>
            {recent.map((r) => (
              <div key={r.id} className={`flex items-center gap-3 border-b px-5 py-3 last:border-0 transition-colors ${T.rowBorder} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
                <InitialsAvatar name={r.name} size={38} />
                <div className="min-w-0 flex-1"><div className={`truncate text-[13.5px] font-medium ${T.h}`}>{r.name}</div><div className={`truncate text-[11.5px] ${T.muted}`}>{r.pos}</div></div>
                <span className={`font-mono text-[13px] font-bold tabular-nums ${r.score >= 80 ? T.brand : "text-accent-400"}`}>{r.score}%</span>
              </div>
            ))}
            {recent.length === 0 && <div className={`px-5 py-10 text-center text-[13px] ${T.faint}`}>ჯერ არავინ დარეგისტრირებულა.</div>}
          </div>
        </aside>
      </div>
    </>
  );
}
