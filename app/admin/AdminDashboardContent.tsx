"use client";

import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";

export type TopClub = { n: string; name: string; league: string; apps: number; tone: string };
export type ActivityItem = { t: string; ts: string; tone: "brand" | "accent" | "warning" | "neutral" };

export function AdminDashboardContent({
  kpis,
  chart,
  topClubs,
  activity,
}: {
  kpis: { players: number; clubs: number; openTrials: number; apps: number };
  chart: { m: string; v: number }[];
  topClubs: TopClub[];
  activity: ActivityItem[];
}) {
  const dark = useDark();
  const T = useT();
  const max = Math.max(1, ...chart.map((c) => c.v));
  const topApps = Math.max(1, topClubs[0]?.apps ?? 1);

  const toneClasses = (t: string) => {
    const m: Record<string, string> = {
      brand: dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700",
      accent: dark ? "bg-accent-500/15 text-accent-300" : "bg-accent-500/15 text-accent-700",
      iris: dark ? "bg-iris-500/15 text-iris-300" : "bg-iris-500/15 text-iris-700",
      flame: dark ? "bg-flame-500/15 text-flame-300" : "bg-flame-500/15 text-flame-700",
      warning: dark ? "bg-warning-500/15 text-warning-300" : "bg-warning-500/15 text-warning-700",
      neutral: T.square,
    };
    return m[t] ?? T.square;
  };

  const KPI = [
    { l: "მოთამაშეები", v: kpis.players.toLocaleString(), ic: Ic.user, accent: true },
    { l: "აქტიური კლუბი", v: String(kpis.clubs), ic: Ic.shield, accent: false },
    { l: "ღია სინჯი", v: String(kpis.openTrials), ic: Ic.calendar, accent: false },
    { l: "სულ განაცხადი", v: kpis.apps.toLocaleString(), ic: Ic.chart, accent: false },
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* Chart */}
        <div className={`rounded-card border p-6 ${T.card}`}>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className={`text-[15px] font-bold ${T.h}`}>აპლიკანტები კლუბების მიხედვით</h2>
              <p className={`text-[12.5px] ${T.muted}`}>ტოპ კლუბები განაცხადებით</p>
            </div>
          </div>
          <div className="flex h-48 items-end gap-3">
            {chart.map((c, i) => (
              <div key={c.m + i} className="flex h-full flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end justify-center">
                  <div className={`group relative w-full rounded-t-lg transition-colors ${i === 0 ? "bg-brand-400" : `bg-brand-400/40 ${dark ? "hover:bg-brand-400/70" : "hover:bg-brand-400/60"}`}`} style={{ height: `${(c.v / max) * 100}%` }}>
                    <span className={`absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[11px] font-semibold tabular-nums opacity-0 transition-opacity group-hover:opacity-100 ${T.t2}`}>{c.v}</span>
                  </div>
                </div>
                <span className={`text-[11px] ${T.muted}`}>{c.m}</span>
              </div>
            ))}
            {chart.length === 0 && <div className={`grid w-full place-items-center text-[13px] ${T.faint}`}>მონაცემი არ არის</div>}
          </div>
        </div>

        {/* Activity */}
        <aside className={`rounded-card border ${T.soft}`}>
          <div className={`flex items-center justify-between border-b px-5 py-4 ${T.border}`}>
            <h2 className={`text-[15px] font-bold ${T.h}`}>ბოლო აქტივობა</h2>
          </div>
          <div className="p-2">
            {activity.map((a, i) => (
              <div key={i} className={`flex gap-3 rounded-btn px-3 py-2.5 ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.tone === "brand" ? "bg-brand-400" : a.tone === "accent" ? "bg-accent-400" : a.tone === "warning" ? "bg-warning-400" : dark ? "bg-ink-600" : "bg-ink-300"}`} />
                <div className="min-w-0"><p className={`text-[13px] leading-snug ${T.t2}`}>{a.t}</p><p className={`mt-0.5 text-[11.5px] ${T.faint}`}>{a.ts}</p></div>
              </div>
            ))}
            {activity.length === 0 && <div className={`px-3 py-8 text-center text-[13px] ${T.faint}`}>აქტივობა არ არის</div>}
          </div>
        </aside>
      </div>

      {/* Top clubs */}
      <div className={`mt-6 rounded-card border ${T.card}`}>
        <div className={`flex items-center justify-between border-b px-5 py-4 ${T.border}`}>
          <h2 className={`text-[15px] font-bold ${T.h}`}>ტოპ კლუბები აპლიკანტებით</h2>
          <Link href="/admin/clubs" className={`inline-flex items-center gap-1 text-[12.5px] font-medium ${T.brand}`}>ყველა კლუბი {Ic.arrow("h-3.5 w-3.5")}</Link>
        </div>
        <div className={`grid grid-cols-[28px_1fr_auto_120px] gap-4 border-b px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${T.border} ${T.muted}`}>
          <span>#</span><span>კლუბი</span><span className="text-right">აპლიკანტი</span><span>წილი</span>
        </div>
        {topClubs.map((c, i) => (
          <div key={c.name} className={`grid grid-cols-[28px_1fr_auto_120px] items-center gap-4 border-b px-5 py-3.5 last:border-0 transition-colors ${T.rowBorder} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
            <span className={`font-mono text-[13px] tabular-nums ${T.faint}`}>{i + 1}</span>
            <div className="flex items-center gap-3">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-btn font-display text-[13px] font-bold ${toneClasses(c.tone)}`}>{c.n}</div>
              <div><div className={`text-[14px] font-medium ${T.h}`}>{c.name}</div><div className={`text-[12px] ${T.muted}`}>{c.league}</div></div>
            </div>
            <span className={`font-mono text-[14px] font-bold tabular-nums ${T.t1}`}>{c.apps}</span>
            <div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${(c.apps / topApps) * 100}%` }} /></div>
          </div>
        ))}
        {topClubs.length === 0 && <div className={`px-5 py-8 text-center text-[13px] ${T.faint}`}>კლუბები არ არის</div>}
      </div>
    </>
  );
}
