"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { MatchRing, InitialsAvatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { toggleTrialOpen, deleteTrial } from "@/app/actions/club";

export type TopApplicant = { id: string; n: number; name: string; pos: string; score: number };

type TrialDTO = {
  id: string;
  title: string;
  isOpen: boolean;
  published: string;
  dateTime: string;
  shortDate: string;
  place: string;
  criteria: string | null;
  slots: number;
  filled: number;
  fill: number;
  avg: number;
  daysLeft: number;
  positions: string[];
  ageGroups: string[];
};

export function ClubTrialDetailContent({ trial, top }: { trial: TrialDTO; top: TopApplicant[] }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(trial.isOpen);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const next = !isOpen;
      await toggleTrialOpen(trial.id, next);
      setIsOpen(next);
      setMenu(false);
      router.refresh();
    });
  }
  function remove() {
    startTransition(async () => {
      await deleteTrial(trial.id);
      router.push("/club/trials");
    });
  }

  return (
    <div onClick={() => setMenu(false)}>
      <Link href="/club/trials" className={`mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>{Ic.arrowLeft("h-4 w-4")} სინჯებზე დაბრუნება</Link>

      {/* Title row */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${isOpen ? "border-brand-500/25 bg-brand-500/12 text-brand-300" : dark ? "border-ink-700 bg-ink-800 text-ink-400" : "border-ink-200 bg-ink-100 text-ink-500"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{isOpen ? "ღია" : "დახურულია"}</span>
            <span className={`text-[12.5px] ${T.muted}`}>გამოქვეყნდა {trial.published}</span>
          </div>
          <h1 className={`mt-2 font-display text-[24px] font-extrabold tracking-tight ${T.h}`}>{trial.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/club/applicants" className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.users("h-4 w-4")} აპლიკანტები</Link>
          <div className="relative">
            <button type="button" onClick={(e) => { e.stopPropagation(); setMenu((v) => !v); }} className={`grid h-10 w-10 place-items-center rounded-btn border transition-colors ${dark ? "border-ink-800 text-ink-300 hover:bg-ink-800" : "border-ink-200 text-ink-500 hover:bg-ink-100"}`}>{Ic.dots("h-4 w-4")}</button>
            {menu && (
              <div className={`absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-card border py-1 shadow-pop ${T.card}`} onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={toggle} disabled={pending} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium ${dark ? "text-ink-200 hover:bg-ink-800" : "text-ink-700 hover:bg-ink-100"}`}>{Ic.check("h-4 w-4")}{isOpen ? "დახურვა" : "გახსნა"}</button>
                <button type="button" onClick={remove} disabled={pending} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium hover:bg-danger-500/10 ${dark ? "text-danger-400" : "text-danger-600"}`}>{Ic.trash("h-4 w-4")}წაშლა</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: "აპლიკანტი", v: String(trial.filled), sub: `/ ${trial.slots} ადგილი`, accent: true },
          { l: "საშ. თავსებადობა", v: `${trial.avg}%`, sub: trial.avg >= 80 ? "მაღალი" : trial.avg >= 65 ? "საშუალო" : "დაბალი", accent: false },
          { l: "შევსება", v: `${trial.fill}%`, sub: `${Math.max(0, trial.slots - trial.filled)} ადგილი დარჩა`, accent: false },
          { l: "დარჩა", v: String(trial.daysLeft), sub: "დღე სინჯამდე", accent: false },
        ].map((k) => (
          <div key={k.l} className={`rounded-card border p-5 ${T.card}`}>
            <div className={`text-[12px] font-medium uppercase tracking-wide ${T.muted}`}>{k.l}</div>
            <div className={`mt-2 font-mono text-[26px] font-bold leading-none tabular-nums ${k.accent ? T.brand : T.h}`}>{k.v}</div>
            <div className={`mt-1.5 text-[12px] ${T.muted}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: details */}
        <div className="space-y-6">
          <div className={`rounded-card border p-6 ${T.card}`}>
            <h2 className={`mb-4 text-[15px] font-bold ${T.h}`}>დეტალები</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {[
                [Ic.calendar, "თარიღი და დრო", trial.dateTime],
                [Ic.pin, "ლოკაცია", trial.place],
                [Ic.users, "ადგილები", `${trial.slots} ადგილი`],
                [Ic.clock, "ხანგრძლივობა", "~2 საათი"],
              ].map(([ic, l, v], i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-btn ${T.square}`}>{(ic as (c: string) => React.ReactNode)("h-4 w-4")}</span>
                  <div><div className={`text-[12px] uppercase tracking-wide ${T.muted}`}>{l as string}</div><div className={`mt-0.5 text-[14px] font-semibold ${T.h}`}>{v as string}</div></div>
                </div>
              ))}
            </div>
            {(trial.positions.length > 0 || trial.ageGroups.length > 0) && (
              <div className={`mt-5 border-t pt-4 ${T.border}`}>
                <div className={`mb-2 text-[12px] uppercase tracking-wide ${T.muted}`}>საჭირო პოზიცია / ასაკი</div>
                <div className="flex flex-wrap gap-1.5">
                  {trial.positions.map((p) => <span key={p} className={`rounded-pill bg-brand-500/12 px-2.5 py-0.5 text-[12px] font-medium ${T.brand2}`}>{p}</span>)}
                  {trial.ageGroups.map((g) => <span key={g} className={`rounded-pill bg-accent-500/12 px-2.5 py-0.5 text-[12px] font-medium ${dark ? "text-accent-300" : "text-accent-700"}`}>{g}</span>)}
                </div>
              </div>
            )}
            {trial.criteria && (
              <div className={`mt-4 border-t pt-4 ${T.border}`}>
                <div className={`mb-1.5 text-[12px] uppercase tracking-wide ${T.muted}`}>კრიტერიუმები</div>
                <p className={`text-[13.5px] leading-relaxed ${T.t3}`}>{trial.criteria}</p>
              </div>
            )}
          </div>

          {/* Applicants preview */}
          <div className={`rounded-card border ${T.card}`}>
            <div className={`flex items-center justify-between border-b px-6 py-4 ${T.border}`}>
              <h2 className={`text-[15px] font-bold ${T.h}`}>საუკეთესო აპლიკანტები</h2>
              <Link href="/club/applicants" className={`inline-flex items-center gap-1 text-[12.5px] font-medium ${T.brand}`}>ყველა {trial.filled} {Ic.arrow("h-3.5 w-3.5")}</Link>
            </div>
            {top.map((a, i) => (
              <div key={a.id} className={`flex items-center gap-3 px-6 py-3 transition-colors ${i > 0 ? `border-t ${T.rowBorder}` : ""} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
                <span className={`w-4 font-mono text-[12px] tabular-nums ${T.faint}`}>{i + 1}</span>
                <InitialsAvatar name={a.name} size={38} />
                <div className="min-w-0 flex-1"><div className={`truncate text-[14px] font-medium ${T.h}`}>{a.name}</div><div className={`truncate text-[12px] ${T.muted}`}>{a.pos}</div></div>
                <MatchRing score={a.score} size={44} />
              </div>
            ))}
            {top.length === 0 && <div className={`px-6 py-10 text-center text-[13px] ${T.faint}`}>ჯერ არავინ დარეგისტრირებულა ამ სინჯზე.</div>}
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-6">
          <div className={`rounded-card border p-6 ${T.card}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className={`text-[14px] font-semibold ${T.h}`}>ადგილების შევსება</span>
              <span className={`font-mono text-[14px] font-bold tabular-nums ${T.brand}`}>{trial.fill}%</span>
            </div>
            <div className={`h-2.5 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${trial.fill}%` }} /></div>
            <div className={`mt-2 text-[12.5px] ${T.muted}`}>{trial.filled} დარეგისტრირდა · {Math.max(0, trial.slots - trial.filled)} ადგილი დარჩა</div>
          </div>

          <div className={`rounded-card border p-6 ${T.card}`}>
            <h3 className={`mb-3 text-[14px] font-semibold ${T.h}`}>ქრონოლოგია</h3>
            <div className="space-y-3.5">
              {[["სინჯი გამოქვეყნდა", trial.published], [`${trial.filled} განაცხადი მიღებულია`, "მიმდინარე"], ["სინჯის თარიღი", trial.shortDate]].map(([t, d], i) => (
                <div key={t} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i <= 1 ? "bg-brand-400" : dark ? "bg-ink-700" : "bg-ink-300"}`} />
                  <div className="flex-1"><div className={`text-[13px] leading-snug ${i <= 1 ? T.t2 : T.muted}`}>{t}</div></div>
                  <span className={`text-[11.5px] tabular-nums ${T.faint}`}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
