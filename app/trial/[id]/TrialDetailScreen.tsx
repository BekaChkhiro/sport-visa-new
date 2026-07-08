"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { MatchRing } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { PlayerHeader } from "@/components/app/PlayerHeader";
import { applyToTrial } from "@/app/actions/player";

export type WeightRow = { label: string; value: number; pct: number; hit: boolean };

type TrialDTO = {
  id: string;
  club: string;
  badge: string;
  league: string;
  title: string;
  date: string;
  shortDate: string;
  place: string;
  criteria: string | null;
  filled: number;
  slots: number;
  score: number;
  isOpen: boolean;
  applied: boolean;
  positions: string[];
  ageGroups: string[];
};

const EXPECT = [
  "15 წთ გახურება და ფიზიკური ტესტები",
  "2×20 წთ სათამაშო მატჩი",
  "ინდივიდუალური ტექნიკის შეფასება",
  "შედეგები — 24 საათში",
];

export function TrialDetailScreen({
  email,
  trial,
  weights,
}: {
  email: string;
  trial: TrialDTO;
  weights: WeightRow[];
}) {
  const dark = useDark();
  const T = useT();
  const [applied, setApplied] = useState(trial.applied);
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  const full = trial.filled >= trial.slots;
  const remaining = Math.max(0, trial.slots - trial.filled);
  const fillPct = Math.min(100, Math.round((trial.filled / trial.slots) * 100));

  function apply() {
    startTransition(async () => {
      const res = await applyToTrial(trial.id);
      if (!res?.error) setApplied(true);
      setConfirm(false);
    });
  }

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <PlayerHeader name="პროფილი" email={email} />

      <main className="mx-auto max-w-[1080px] px-6 py-6">
        <Link href="/dashboard" className={`mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>{Ic.arrowLeft("h-4 w-4")} სინჯებზე დაბრუნება</Link>

        {/* Hero */}
        <div className={`relative overflow-hidden rounded-card border border-brand-500/30 bg-gradient-to-br from-brand-500/12 ${dark ? "via-ink-900 to-ink-900" : "via-white to-white"} p-6`}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-card bg-brand-500/15 font-display text-[20px] font-bold ${T.brand2}`}>{trial.badge}</div>
            <div className="min-w-[240px] flex-1">
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className={`text-[19px] font-bold ${T.h}`}>{trial.club}</span>
                <span className={`inline-flex items-center whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${dark ? "bg-ink-800 text-ink-200 border-ink-700" : "bg-ink-100 text-ink-700 border-ink-200"}`}>{trial.league}</span>
              </div>
              <div className={`text-[15px] font-medium ${T.t2}`}>{trial.title}</div>
              <div className={`mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] ${T.muted}`}>
                <span className="inline-flex items-center gap-1.5">{Ic.calendar("h-4 w-4")}{trial.date}</span>
                <span className="inline-flex items-center gap-1.5">{Ic.pin("h-4 w-4")}{trial.place}</span>
                <span className="inline-flex items-center gap-1.5">{Ic.users("h-4 w-4")}<span className="tabular-nums">{trial.filled}/{trial.slots} ადგილი</span></span>
              </div>
            </div>
            <MatchRing score={trial.score} size={96} />
            <div className="flex flex-col gap-2">
              {applied ? (
                <button type="button" disabled className={`inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-btn border px-6 text-[15px] font-medium ${dark ? "border-ink-700 bg-ink-800 text-ink-200" : "border-ink-200 bg-ink-100 text-ink-700"}`}>{Ic.check("h-4 w-4")} განაცხადი გაგზავნილია</button>
              ) : full || !trial.isOpen ? (
                <button type="button" disabled className={`inline-flex h-12 min-w-[180px] items-center justify-center rounded-btn border px-6 text-[15px] font-medium ${dark ? "border-ink-700 text-ink-500" : "border-ink-200 text-ink-400"}`}>{full ? "ადგილი შეივსო" : "დახურულია"}</button>
              ) : (
                <button type="button" onClick={() => setConfirm(true)} className="inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-btn bg-brand-400 px-6 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500">განაცხადის გაგზავნა {Ic.arrow("h-4 w-4")}</button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className={`rounded-card border p-6 ${T.card}`}>
              <h2 className={`mb-3 text-[15px] font-bold ${T.h}`}>სინჯის შესახებ</h2>
              <p className={`text-[14px] leading-relaxed ${T.t3}`}>{trial.criteria || "კლუბი აცხადებს ღია სელექციას. საუკეთესოები მიიწვევიან შემდეგ ეტაპზე."}</p>
              <div className={`mt-4 border-t pt-4 ${T.border}`}>
                <div className={`mb-2 text-[12px] uppercase tracking-wide ${T.muted}`}>საჭირო პროფილი</div>
                <div className="flex flex-wrap gap-1.5">
                  {trial.positions.map((p) => <span key={p} className={`rounded-pill bg-brand-500/12 px-2.5 py-0.5 text-[12px] font-medium ${T.brand2}`}>{p}</span>)}
                  {trial.ageGroups.map((g) => <span key={g} className={`rounded-pill bg-accent-500/12 px-2.5 py-0.5 text-[12px] font-medium ${dark ? "text-accent-300" : "text-accent-700"}`}>{g}</span>)}
                </div>
              </div>
            </div>

            <div className={`rounded-card border p-6 ${T.card}`}>
              <h2 className={`mb-4 text-[15px] font-bold ${T.h}`}>რას უნდა ელოდო</h2>
              <div className="space-y-3">
                {EXPECT.map((e, i) => (
                  <div key={e} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500/15 font-mono text-[12px] font-bold text-brand-300">{i + 1}</span>
                    <span className={`text-[13.5px] ${T.t2}`}>{e}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-5 flex items-start gap-2.5 rounded-card border p-3 ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-ink-50"}`}>
                <span className={`mt-0.5 ${T.brand}`}>{Ic.clock("h-4 w-4")}</span>
                <span className={`text-[12.5px] ${T.muted}`}>მოდი 20 წუთით ადრე რეგისტრაციისთვის. თან იქონიე ბუცები და შენი ეკიპირება.</span>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className={`rounded-card border p-5 ${T.card}`}>
              <div className={`mb-3 flex items-center gap-2 text-[14px] font-semibold ${T.h}`}>{Ic.bolt(`h-4 w-4 ${T.brand}`)} შენი თავსებადობა</div>
              <div className="space-y-2.5">
                {weights.map((wt) => (
                  <div key={wt.label}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className={`inline-flex items-center gap-1.5 ${T.t3}`}>{wt.hit && <span className={T.brand}>{Ic.check("h-3 w-3")}</span>}{wt.label}</span>
                      <span className={`font-mono tabular-nums ${T.muted}`}>+{wt.value}</span>
                    </div>
                    <div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}><div className={`h-full rounded-pill ${wt.hit ? "bg-brand-400" : "bg-brand-400/40"}`} style={{ width: `${wt.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-card border p-5 ${T.card}`}>
              <div className="mb-3 flex items-center justify-between">
                <span className={`text-[14px] font-semibold ${T.h}`}>აპლიკანტები</span>
                <span className={`font-mono text-[13px] font-bold tabular-nums ${T.t2}`}>{trial.filled}/{trial.slots}</span>
              </div>
              <div className={`mb-3 h-2 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${fillPct}%` }} /></div>
              <div className="flex items-center">
                {[21, 32, 45, 51, 12].slice(0, Math.min(5, trial.filled)).map((n, i) => (
                  <div key={n} style={{ marginLeft: i ? -10 : 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.pravatar.cc/80?img=${n}`} alt="" className={`h-8 w-8 rounded-full border-2 object-cover ${dark ? "border-ink-900" : "border-white"}`} />
                  </div>
                ))}
                {trial.filled > 5 && <span className={`ml-2 text-[12.5px] ${T.muted}`}>+{trial.filled - 5} სხვა</span>}
              </div>
              {remaining > 0 && <p className={`mt-3 text-[12px] ${T.faint}`}>{remaining} ადგილი დარჩა — არ დააგვიანო განაცხადი.</p>}
            </div>
          </aside>
        </div>
      </main>

      {confirm && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${T.overlay}`} onClick={() => setConfirm(false)}>
          <div className={`w-full max-w-md rounded-card border p-6 shadow-float ${T.card}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <MatchRing score={trial.score} size={52} />
                <div>
                  <h3 className={`text-[17px] font-bold ${T.h}`}>{trial.club}</h3>
                  <p className={`text-[13px] ${T.muted}`}>{trial.shortDate}</p>
                </div>
              </div>
              <button type="button" onClick={() => setConfirm(false)} className={`rounded-btn p-1.5 ${T.iconBtnFlat}`}>{Ic.close("h-5 w-5")}</button>
            </div>
            <p className={`text-[14px] leading-relaxed ${T.t3}`}>შენი პროფილი გაეგზავნება კლუბს. თავსებადობა <span className={`font-semibold ${T.brand}`}>{trial.score}%</span>. სინჯამდე შეგიძლია განაცხადის გაუქმება.</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setConfirm(false)} className={`flex-1 rounded-btn px-5 py-2.5 text-sm font-medium transition-colors ${dark ? "text-ink-200 hover:bg-ink-800" : "text-ink-700 hover:bg-ink-100"}`}>გაუქმება</button>
              <button type="button" disabled={pending} onClick={apply} className="flex-1 rounded-btn bg-brand-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">{pending ? "იგზავნება..." : "დადასტურება"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
