"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { MatchRing } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { PlayerHeader } from "@/components/app/PlayerHeader";
import { applyToTrial } from "@/app/actions/player";

export type TrialDTO = {
  id: string;
  club: string;
  badge: string;
  league: string;
  title: string;
  date: string;
  place: string;
  filled: number;
  slots: number;
  score: number;
  applied: boolean;
  positions: string[];
};

type PlayerDTO = {
  firstName: string;
  position: string;
  city: string;
  level: string;
  league: string;
  completeness: number;
  hasMedia: boolean;
};

const FILTERS = ["ყველა", "თავდამსხმელი", "ნახევარმცველი", "მცველი", "მეკარე"];
const WEIGHTS: [string, number, string][] = [
  ["პოზიცია", 40, "w-full"],
  ["ასაკობრივი ჯგუფი", 25, "w-[62%]"],
  ["ქალაქი", 20, "w-[50%]"],
  ["დონე ↔ ლიგა", 15, "w-[38%]"],
];

export function DashboardScreen({
  player,
  trials,
  openTrialCount,
}: {
  player: PlayerDTO;
  trials: TrialDTO[];
  openTrialCount: number;
}) {
  const dark = useDark();
  const T = useT();
  const [filter, setFilter] = useState("ყველა");
  const [applied, setApplied] = useState<string[]>(
    trials.filter((t) => t.applied).map((t) => t.id),
  );
  const [confirm, setConfirm] = useState<TrialDTO | null>(null);
  const [pending, startTransition] = useTransition();

  const list = trials.filter(
    (t) => filter === "ყველა" || t.positions.includes(filter),
  );
  const best = trials[0];

  function doApply(t: TrialDTO) {
    startTransition(async () => {
      const res = await applyToTrial(t.id);
      if (!res?.error) setApplied((a) => [...new Set([...a, t.id])]);
      setConfirm(null);
    });
  }

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <PlayerHeader
        name={player.firstName}
        subtitle={`${player.position} · ${player.city}`}
        avatarN={12}
      />

      <main className="mx-auto max-w-[1180px] px-6 py-8">
        {/* Greeting */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className={`font-display text-[30px] font-extrabold leading-tight tracking-tight ${T.h}`}>გამარჯობა, {player.firstName}</h1>
            <p className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] ${T.muted}`}>
              <span className={T.t2}>{player.position}</span><span className={T.dot}>·</span>
              <span>{player.city}</span><span className={T.dot}>·</span>
              <span>{player.level}</span><span className={T.dot}>·</span>
              <span>{player.league}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <div className={`rounded-card border px-4 py-2 text-center ${T.card}`}>
              <div className={`font-mono text-[20px] font-bold tabular-nums ${T.h}`}>{openTrialCount}</div>
              <div className={`text-[11px] uppercase tracking-wide ${T.muted}`}>ღია სინჯი</div>
            </div>
            <div className={`rounded-card border px-4 py-2 text-center ${T.card}`}>
              <div className={`font-mono text-[20px] font-bold tabular-nums ${T.brand}`}>{applied.length}</div>
              <div className={`text-[11px] uppercase tracking-wide ${T.muted}`}>განაცხადი</div>
            </div>
          </div>
        </div>

        {/* Featured best match */}
        {best && (
          <div className={`relative mb-8 overflow-hidden rounded-card border border-brand-500/30 bg-gradient-to-br from-brand-500/12 ${dark ? "via-ink-900 to-ink-900" : "via-white to-white"} p-6`}>
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative flex flex-wrap items-center gap-6">
              <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-card bg-brand-500/15 font-display text-[20px] font-bold ${T.brand2}`}>{best.badge}</div>
              <div className="min-w-[240px] flex-1">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="rounded-pill border border-brand-500/25 bg-brand-500/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-300">საუკეთესო თავსებადობა</span>
                  <span className={`rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${dark ? "border-ink-700 bg-ink-800 text-ink-200" : "border-ink-200 bg-ink-100 text-ink-700"}`}>{best.league}</span>
                </div>
                <div className={`text-[19px] font-bold ${T.h}`}>{best.club}</div>
                <div className={`text-[13.5px] ${T.t3}`}>{best.title}</div>
                <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] ${T.muted}`}>
                  <span className="inline-flex items-center gap-1.5">{Ic.calendar("h-3.5 w-3.5")}{best.date}</span>
                  <span className="inline-flex items-center gap-1.5">{Ic.pin("h-3.5 w-3.5")}{best.place}</span>
                  <span className="inline-flex items-center gap-1.5">{Ic.users("h-3.5 w-3.5")}<span className="tabular-nums">{best.filled}/{best.slots} ადგილი</span></span>
                </div>
              </div>
              <MatchRing score={best.score} size={82} />
              <button type="button" onClick={() => !applied.includes(best.id) && setConfirm(best)} disabled={applied.includes(best.id)} className="inline-flex h-12 items-center gap-2 rounded-btn bg-brand-400 px-6 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 disabled:opacity-40 disabled:pointer-events-none">
                {applied.includes(best.id) ? <>{Ic.check("h-4 w-4")} გაგზავნილია</> : <>განაცხადი {Ic.arrow("h-4 w-4")}</>}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left: trials */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-[17px] font-bold ${T.h}`}>რეკომენდებული სინჯები</h2>
              <span className={`text-[13px] ${T.muted}`}><span className={`tabular-nums ${T.t2}`}>{list.length}</span> შედეგი</span>
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-pill border px-3 py-1.5 text-[13px] font-medium transition-colors ${filter === f ? `border-brand-400 bg-brand-500/15 ${T.brand2}` : T.chipIdle}`}>{f}</button>
              ))}
            </div>

            <div className="space-y-3">
              {list.map((t) => {
                const isApplied = applied.includes(t.id);
                const full = t.filled >= t.slots;
                return (
                  <div key={t.id} className={`group flex flex-wrap items-center gap-5 rounded-card border p-5 transition-colors ${T.card} ${dark ? "hover:border-ink-600" : "hover:border-ink-300"}`}>
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-btn font-display text-[15px] font-bold ${T.square}`}>{t.badge}</div>
                    <Link href={`/trial/${t.id}`} className="min-w-[200px] flex-1">
                      <div className="mb-1 flex items-center gap-2.5">
                        <span className={`text-[16px] font-bold ${T.h}`}>{t.club}</span>
                        <span className={`rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${dark ? "border-ink-700 bg-ink-800 text-ink-200" : "border-ink-200 bg-ink-100 text-ink-700"}`}>{t.league}</span>
                      </div>
                      <div className={`mb-2 text-[13.5px] ${T.t3}`}>{t.title}</div>
                      <div className={`flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] ${T.muted}`}>
                        <span className="inline-flex items-center gap-1.5">{Ic.calendar("h-3.5 w-3.5")}{t.date}</span>
                        <span className="inline-flex items-center gap-1.5">{Ic.pin("h-3.5 w-3.5")}{t.place}</span>
                        <span className="inline-flex items-center gap-1.5">{Ic.users("h-3.5 w-3.5")}<span className="tabular-nums">{t.filled}/{t.slots}</span></span>
                      </div>
                    </Link>
                    <MatchRing score={t.score} />
                    {isApplied ? (
                      <button type="button" disabled className={`inline-flex h-11 min-w-[130px] items-center justify-center gap-2 rounded-btn border px-5 text-sm font-medium ${dark ? "border-ink-700 bg-ink-800 text-ink-200" : "border-ink-200 bg-ink-100 text-ink-700"}`}>{Ic.check("h-4 w-4")} გაგზავნილია</button>
                    ) : full ? (
                      <button type="button" disabled className={`inline-flex h-11 min-w-[130px] items-center justify-center rounded-btn border px-5 text-sm font-medium ${dark ? "border-ink-700 text-ink-500" : "border-ink-200 text-ink-400"}`}>ადგილი შეივსო</button>
                    ) : (
                      <button type="button" onClick={() => setConfirm(t)} className={`inline-flex h-11 min-w-[130px] items-center justify-center rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 ${T.ringOffset}`}>განაცხადი</button>
                    )}
                  </div>
                );
              })}
              {list.length === 0 && (
                <div className={`grid place-items-center rounded-card border border-dashed px-6 py-12 text-center ${dark ? "border-ink-700 bg-ink-900/40" : "border-ink-300 bg-ink-100/60"}`}>
                  <div className={`text-[14px] font-semibold ${T.t2}`}>ამ პოზიციაზე ღია სინჯი არ არის</div>
                  <p className={`mt-1 text-[13px] ${T.muted}`}>სცადე სხვა ფილტრი ან შემოიარე მოგვიანებით.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right rail */}
          <aside className="space-y-5">
            <div className={`rounded-card border p-5 ${T.card}`}>
              <div className="mb-3 flex items-center justify-between">
                <span className={`text-[14px] font-semibold ${T.h}`}>პროფილის სისრულე</span>
                <span className={`font-mono text-[14px] font-bold tabular-nums ${T.brand}`}>{player.completeness}%</span>
              </div>
              <div className={`mb-4 h-2 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${player.completeness}%` }} /></div>
              <ul className="space-y-2.5 text-[13px]">
                <li className={`flex items-center gap-2.5 ${T.muted}`}><span className={`grid h-5 w-5 place-items-center rounded-full bg-brand-500/20 ${T.brand2}`}>{Ic.check("h-3 w-3")}</span>ძირითადი მონაცემები</li>
                <li className={`flex items-center gap-2.5 ${T.muted}`}><span className={`grid h-5 w-5 place-items-center rounded-full bg-brand-500/20 ${T.brand2}`}>{Ic.check("h-3 w-3")}</span>პოზიცია და ლიგა</li>
                <li className={`flex items-center gap-2.5 ${player.hasMedia ? T.muted : T.t2}`}>
                  <span className={player.hasMedia ? `grid h-5 w-5 place-items-center rounded-full bg-brand-500/20 ${T.brand2}` : `grid h-5 w-5 place-items-center rounded-full border ${dark ? "border-ink-600 text-ink-500" : "border-ink-300 text-ink-400"}`}>{player.hasMedia ? Ic.check("h-3 w-3") : Ic.video("h-3 w-3")}</span>
                  ვიდეო-მასალის დამატება
                </li>
              </ul>
              <Link href="/profile" className={`mt-4 block w-full rounded-btn border border-brand-500/60 py-2.5 text-center text-[13px] font-medium transition-colors hover:bg-brand-500/10 ${T.brand2}`}>მასალის ატვირთვა</Link>
            </div>

            <div className={`rounded-card border p-5 ${T.card}`}>
              <div className={`mb-3 flex items-center gap-2 text-[14px] font-semibold ${T.h}`}>{Ic.bolt(`h-4 w-4 ${T.brand}`)} როგორ ითვლება match</div>
              <div className="space-y-2.5">
                {WEIGHTS.map(([l, v, w]) => (
                  <div key={l}>
                    <div className="mb-1 flex items-center justify-between text-[12px]"><span className={T.t3}>{l}</span><span className={`font-mono tabular-nums ${T.muted}`}>+{v}</span></div>
                    <div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}><div className={`h-full ${w} rounded-pill bg-brand-400/70`} /></div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Confirm modal */}
      {confirm && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${T.overlay}`} onClick={() => setConfirm(null)}>
          <div className={`w-full max-w-md rounded-card border p-6 shadow-float ${T.card}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <MatchRing score={confirm.score} size={56} />
                <div>
                  <h3 className={`text-[17px] font-bold ${T.h}`}>{confirm.club}</h3>
                  <p className={`text-[13px] ${T.muted}`}>{confirm.date}</p>
                </div>
              </div>
              <button type="button" onClick={() => setConfirm(null)} className={`rounded-btn p-1.5 ${T.iconBtnFlat}`}>{Ic.close("h-5 w-5")}</button>
            </div>
            <p className={`text-[14px] leading-relaxed ${T.t3}`}>შენი პროფილი გაეგზავნება კლუბს — <span className={`font-medium ${T.t2}`}>{confirm.title}</span>. თავსებადობა <span className={`font-semibold ${T.brand}`}>{confirm.score}%</span>. სინჯამდე შეგიძლია განაცხადის გაუქმება.</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setConfirm(null)} className={`flex-1 rounded-btn px-5 py-2.5 text-sm font-medium transition-colors ${T.t2} ${T.hoverBg}`}>გაუქმება</button>
              <button type="button" disabled={pending} onClick={() => doApply(confirm)} className="flex-1 rounded-btn bg-brand-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">{pending ? "იგზავნება..." : "განაცხადის გაგზავნა"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
