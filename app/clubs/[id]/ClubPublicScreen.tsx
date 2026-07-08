"use client";

import { useState } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { MatchRing } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { PlayerHeader } from "@/components/app/PlayerHeader";

export type PublicTrial = {
  id: string;
  title: string;
  date: string;
  place: string;
  filled: number;
  slots: number;
  score: number;
  applied: boolean;
};

type ClubDTO = {
  name: string;
  badge: string;
  league: string;
  city: string;
  description: string | null;
  acceptingTrials: boolean;
  positions: string[];
  ageGroups: string[];
  totalApplicants: number;
};

const COVER = "https://live.staticflickr.com/8286/7794221892_2db05a6c93_b.jpg";

export function ClubPublicScreen({ email, club, trials }: { email: string; club: ClubDTO; trials: PublicTrial[] }) {
  const dark = useDark();
  const T = useT();
  const [follow, setFollow] = useState(false);

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <PlayerHeader name="პროფილი" email={email} />

      <main className="mx-auto max-w-[1080px] px-6 py-6">
        <Link href="/dashboard" className={`mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>{Ic.arrowLeft("h-4 w-4")} სინჯებზე დაბრუნება</Link>

        {/* Club hero */}
        <div className={`relative overflow-hidden rounded-card border ${T.border}`}>
          <div className="relative h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={COVER} alt="" className="h-full w-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${dark ? "from-ink-950 via-ink-950/50 to-ink-950/20" : "from-white via-white/50 to-white/10"}`} />
          </div>
          <div className={`relative -mt-12 flex flex-wrap items-end gap-5 px-6 pb-6 ${dark ? "bg-ink-900" : "bg-white"}`}>
            <div className={`grid h-24 w-24 shrink-0 place-items-center rounded-card border-4 bg-brand-500/15 font-display text-[30px] font-extrabold ${T.brand2} ${dark ? "border-ink-950" : "border-ink-50"}`}>{club.badge}</div>
            <div className="mb-1 flex-1">
              <h1 className={`font-display text-[24px] font-extrabold tracking-tight ${T.h}`}>{club.name}</h1>
              <div className={`mt-1 flex flex-wrap items-center gap-2 text-[13px] ${T.muted}`}>
                <span className="inline-flex items-center whitespace-nowrap rounded-pill border border-brand-500/25 bg-brand-500/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-300">{club.league}</span>
                <span className="inline-flex items-center gap-1">{Ic.pin("h-3.5 w-3.5")}{club.city}</span>
                {club.acceptingTrials && <><span className={T.dot}>·</span><span className={T.brand}>მიღება ღიაა</span></>}
              </div>
            </div>
            <div className="mb-1 flex items-center gap-2">
              <button type="button" onClick={() => setFollow(!follow)} className={`inline-flex h-10 items-center gap-2 rounded-btn px-4 text-sm font-semibold transition-colors ${follow ? `border ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}` : "bg-brand-400 text-ink-950 hover:bg-brand-300"}`}>
                {follow ? <>{Ic.check("h-4 w-4")} მიდევნებ</> : <>{Ic.plus("h-4 w-4")} დევნება</>}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className={`rounded-card border p-6 ${T.card}`}>
              <h2 className={`mb-2 text-[15px] font-bold ${T.h}`}>კლუბის შესახებ</h2>
              <p className={`text-[14px] leading-relaxed ${T.t3}`}>{club.description || "კლუბი აქვეყნებს ღია სინჯებს ნიჭიერი მოთამაშეებისთვის."}</p>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className={`text-[16px] font-bold ${T.h}`}>ღია სინჯები</h2>
                <span className={`text-[13px] ${T.muted}`}><span className={`tabular-nums ${T.t2}`}>{trials.length}</span> აქტიური</span>
              </div>
              <div className="space-y-3">
                {trials.map((t) => (
                  <div key={t.id} className={`group flex flex-wrap items-center gap-4 rounded-card border p-5 transition-colors ${T.card} ${dark ? "hover:border-ink-600" : "hover:border-ink-300"}`}>
                    <div className="min-w-[200px] flex-1">
                      <div className={`text-[15px] font-semibold ${T.h}`}>{t.title}</div>
                      <div className={`mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] ${T.muted}`}>
                        <span className="inline-flex items-center gap-1.5">{Ic.calendar("h-3.5 w-3.5")}{t.date}</span>
                        <span className="inline-flex items-center gap-1.5">{Ic.pin("h-3.5 w-3.5")}{t.place}</span>
                        <span className="inline-flex items-center gap-1.5">{Ic.users("h-3.5 w-3.5")}<span className="tabular-nums">{t.filled}/{t.slots}</span></span>
                      </div>
                    </div>
                    <MatchRing score={t.score} size={52} />
                    {t.applied ? (
                      <span className={`inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-btn border px-4 text-[13px] font-medium ${dark ? "border-ink-700 bg-ink-800 text-ink-200" : "border-ink-200 bg-ink-100 text-ink-700"}`}>{Ic.check("h-4 w-4")} გაგზავნილი</span>
                    ) : (
                      <Link href={`/trial/${t.id}`} className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-btn bg-brand-400 px-4 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-brand-300">დეტალები</Link>
                    )}
                  </div>
                ))}
                {trials.length === 0 && (
                  <div className={`grid place-items-center rounded-card border border-dashed px-6 py-10 text-center ${dark ? "border-ink-700 bg-ink-900/40" : "border-ink-300 bg-ink-100/60"}`}>
                    <div className={`text-[14px] font-semibold ${T.t2}`}>ამ კლუბს ღია სინჯი არ აქვს</div>
                    <p className={`mt-1 text-[13px] ${T.muted}`}>დაიმახსოვრე კლუბი — ახალი სინჯები მალე გამოჩნდება.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className={`rounded-card border p-5 ${T.card}`}>
              <h3 className={`mb-4 text-[14px] font-semibold ${T.h}`}>კლუბის მონაცემები</h3>
              <div className="space-y-3.5 text-[13px]">
                {[["ლიგა", club.league], ["ქალაქი", club.city], ["სტატუსი", club.acceptingTrials ? "მიღება ღიაა" : "მიღება დახურულია"]].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between">
                    <span className={T.muted}>{l}</span><span className={`font-medium ${T.t2}`}>{v}</span>
                  </div>
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

            <div className={`rounded-card border p-5 ${T.card}`}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-btn bg-brand-500/15 text-brand-300">{Ic.users("h-5 w-5")}</div>
                <div><div className={`font-mono text-[18px] font-bold tabular-nums ${T.h}`}>{club.totalApplicants}</div><div className={`text-[12px] ${T.muted}`}>აპლიკანტი სულ</div></div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
