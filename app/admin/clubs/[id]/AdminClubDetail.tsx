"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { InitialsAvatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { setClubAcceptingById } from "@/app/actions/admin";

export type ClubDetailDTO = {
  id: string;
  name: string;
  badge: string;
  league: string;
  city: string;
  accepting: boolean;
  created: string;
  manager: string;
  positions: string[];
  ageGroups: string[];
  kpis: { trials: number; open: number; applicants: number; avg: number; team: number };
  trials: { id: string; title: string; date: string; filled: number; slots: number; status: string }[];
  team: { n: number; name: string; email: string; role: string }[];
};

function StatusBadge({ s }: { s: string }) {
  const dark = useDark();
  const map: Record<string, string> = {
    "ღია": dark ? "bg-brand-500/12 text-brand-300 border-brand-500/25" : "bg-brand-500/12 text-brand-700 border-brand-500/25",
    "დასრულებული": dark ? "bg-ink-800 text-ink-400 border-ink-700" : "bg-ink-100 text-ink-500 border-ink-200",
  };
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${map[s]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span>;
}

export function AdminClubDetail({ club }: { club: ClubDetailDTO }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(club.accepting);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const next = !active;
      await setClubAcceptingById(club.id, next);
      setActive(next);
      setMenu(false);
      router.refresh();
    });
  }

  const KPI = [
    { l: "სულ სინჯი", v: String(club.kpis.trials), sub: `${club.kpis.open} ღია`, accent: false },
    { l: "სულ აპლიკანტი", v: String(club.kpis.applicants), sub: "ყველა სინჯზე", accent: true },
    { l: "საშ. თავსებადობა", v: `${club.kpis.avg}%`, sub: "ღია სინჯებზე", accent: false },
    { l: "გუნდის წევრი", v: String(club.kpis.team), sub: "მენეჯერები", accent: false },
  ];

  return (
    <div onClick={() => setMenu(false)}>
      <Link href="/admin/clubs" className={`mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>{Ic.arrowLeft("h-4 w-4")} კლუბებზე დაბრუნება</Link>

      {/* Hero */}
      <div className={`mb-6 flex flex-wrap items-center gap-6 rounded-card border p-6 ${T.card}`}>
        <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-card bg-brand-500/15 font-display text-[22px] font-extrabold ${T.brand2}`}>{club.badge}</div>
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className={`font-display text-[24px] font-extrabold tracking-tight ${T.h}`}>{club.name}</h1>
            {active
              ? <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${dark ? "bg-brand-500/12 text-brand-300 border-brand-500/25" : "bg-brand-500/12 text-brand-700 border-brand-500/25"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />აქტიური</span>
              : <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${dark ? "bg-warning-500/12 text-warning-300 border-warning-500/25" : "bg-warning-500/12 text-warning-700 border-warning-500/25"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />შეჩერებული</span>}
          </div>
          <div className={`mt-1.5 flex flex-wrap items-center gap-2 text-[13px] ${T.muted}`}>
            <span className="inline-flex items-center gap-1">{Ic.shield("h-3.5 w-3.5")}{club.league}</span><span className={T.dot}>·</span>
            <span className="inline-flex items-center gap-1">{Ic.pin("h-3.5 w-3.5")}{club.city}</span><span className={T.dot}>·</span>
            <span>შეიქმნა {club.created}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`mailto:${club.manager}`} className={`inline-flex h-10 items-center gap-2 rounded-btn border px-4 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>{Ic.mail("h-4 w-4")} შეტყობინება</a>
          <div className="relative">
            <button type="button" onClick={(e) => { e.stopPropagation(); setMenu((v) => !v); }} className={`grid h-10 w-10 place-items-center rounded-btn border transition-colors ${dark ? "border-ink-700 text-ink-300 hover:bg-ink-800" : "border-ink-200 text-ink-500 hover:bg-ink-100"}`}>{Ic.dots("h-4 w-4")}</button>
            {menu && (
              <div className={`absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-card border py-1 shadow-pop ${T.card}`} onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={toggle} disabled={pending} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium ${dark ? "text-warning-300 hover:bg-warning-500/10" : "text-warning-700 hover:bg-warning-500/10"}`}>{Ic.check("h-4 w-4")}{active ? "ანგარიშის შეჩერება" : "გააქტიურება"}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI.map((k) => (
          <div key={k.l} className={`rounded-card border p-5 ${T.card}`}>
            <div className={`text-[12px] font-medium uppercase tracking-wide ${T.muted}`}>{k.l}</div>
            <div className={`mt-2 font-mono text-[26px] font-bold leading-none tabular-nums ${k.accent ? T.brand : T.h}`}>{k.v}</div>
            <div className={`mt-1.5 text-[12px] ${T.muted}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className={`rounded-card border ${T.card}`}>
            <div className={`flex items-center justify-between border-b px-5 py-4 ${T.border}`}>
              <h2 className={`text-[15px] font-bold ${T.h}`}>კლუბის სინჯები</h2>
              <span className={`text-[12.5px] ${T.muted}`}><span className="tabular-nums">{club.trials.length}</span> სულ</span>
            </div>
            {club.trials.map((t) => {
              const pct = Math.round((t.filled / t.slots) * 100);
              return (
                <div key={t.id} className={`flex items-center gap-4 border-b px-5 py-3.5 last:border-0 transition-colors ${T.rowBorder} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
                  <div className="min-w-0 flex-1"><div className={`truncate text-[14px] font-medium ${T.h}`}>{t.title}</div><div className={`text-[12px] ${T.muted}`}>{t.date}</div></div>
                  <div className="w-24 text-right">
                    <div className={`font-mono text-[13px] tabular-nums ${T.t2}`}>{t.filled}/{t.slots}</div>
                    <div className={`mt-1 h-1 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${pct}%` }} /></div>
                  </div>
                  <StatusBadge s={t.status} />
                </div>
              );
            })}
            {club.trials.length === 0 && <div className={`px-5 py-10 text-center text-[13px] ${T.faint}`}>სინჯი ჯერ არ გამოუცხადებია.</div>}
          </div>

          <div className={`rounded-card border ${T.card}`}>
            <div className={`flex items-center justify-between border-b px-5 py-4 ${T.border}`}>
              <h2 className={`text-[15px] font-bold ${T.h}`}>გუნდის წევრები</h2>
            </div>
            {club.team.map((m) => (
              <div key={m.email} className={`flex items-center gap-3 border-b px-5 py-3.5 last:border-0 ${T.rowBorder}`}>
                <InitialsAvatar name={m.name} size={38} />
                <div className="min-w-0 flex-1"><div className={`truncate text-[14px] font-medium ${T.h}`}>{m.name}</div><div className={`truncate text-[12px] ${T.muted}`}>{m.email}</div></div>
                <span className={`rounded-pill px-2 py-0.5 text-[11px] font-semibold ${T.square}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className={`rounded-card border p-5 ${T.card}`}>
            <h3 className={`mb-4 text-[14px] font-semibold ${T.h}`}>კლუბის მონაცემები</h3>
            <div className="space-y-3.5 text-[13px]">
              {[["ლიგა", club.league], ["ქალაქი", club.city], ["სტატუსი", active ? "მიღება ღიაა" : "შეჩერებული"], ["მენეჯერი", club.manager]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between gap-3"><span className={T.muted}>{l}</span><span className={`truncate text-right font-medium ${T.t2}`}>{v}</span></div>
              ))}
            </div>
            {(club.positions.length > 0 || club.ageGroups.length > 0) && (
              <div className={`mt-4 border-t pt-4 ${T.border}`}>
                <div className={`mb-2 text-[12px] uppercase tracking-wide ${T.muted}`}>ეძებს</div>
                <div className="flex flex-wrap gap-1.5">
                  {club.positions.map((p) => <span key={p} className={`rounded-pill bg-brand-500/12 px-2.5 py-0.5 text-[11px] font-medium ${T.brand2}`}>{p}</span>)}
                  {club.ageGroups.map((g) => <span key={g} className={`rounded-pill bg-accent-500/12 px-2.5 py-0.5 text-[11px] font-medium ${dark ? "text-accent-300" : "text-accent-700"}`}>{g}</span>)}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
