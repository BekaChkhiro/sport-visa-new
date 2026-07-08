"use client";

import { useActionState, useState } from "react";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";
import { updateClubProfile, type FormState } from "@/app/actions/club";

const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი"];
const LEAGUES = ["ეროვნული ლიგა", "ეროვნული ლიგა 2", "ლიგა 3", "რეგიონული ლიგა", "ამატორული ლიგა"];
const POSITIONS: { v: string; l: string }[] = [
  { v: "GK", l: "მეკარე" }, { v: "DF", l: "მცველი" }, { v: "MF", l: "ნახევარმცველი" }, { v: "FW", l: "თავდამსხმელი" },
];
const AGES: { v: string; l: string }[] = [
  { v: "U17", l: "U-17" }, { v: "U19", l: "U-19" }, { v: "U21", l: "U-21" }, { v: "SENIOR", l: "ზრდასრული" },
];

type Defaults = { name: string; city: string; league: string; description: string; positions: string[]; ageGroups: string[] };

export function ClubProfileForm({ defaults, trialCount }: { defaults: Defaults; trialCount: number }) {
  const dark = useDark();
  const T = useT();
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateClubProfile, undefined);

  const [name, setName] = useState(defaults.name);
  const [city, setCity] = useState(defaults.city);
  const [league, setLeague] = useState(defaults.league);
  const [about, setAbout] = useState(defaults.description);
  const [pos, setPos] = useState<string[]>(defaults.positions);
  const [ages, setAges] = useState<string[]>(defaults.ageGroups);

  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const badge = name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");

  return (
    <form action={formAction} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="league" value={league} />
      <input type="hidden" name="description" value={about} />
      {pos.map((p) => <input key={p} type="hidden" name="positionsNeeded" value={p} />)}
      {ages.map((a) => <input key={a} type="hidden" name="ageGroups" value={a} />)}

      {/* Form */}
      <div className="max-w-2xl space-y-7">
        <div className="flex items-center gap-5">
          <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-card bg-brand-500/15 font-display text-[26px] font-extrabold ${T.brand2}`}>{badge}</div>
          <div>
            <div className={`text-[14px] font-semibold ${T.h}`}>კლუბის ლოგო</div>
            <p className={`mt-0.5 text-[12.5px] ${T.muted}`}>PNG ან SVG, მინ. 160×160px</p>
            <button type="button" className={`mt-2.5 inline-flex h-9 items-center gap-2 rounded-btn border px-3.5 text-[13px] font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>{Ic.upload("h-4 w-4")} ატვირთვა</button>
          </div>
        </div>

        <div className={`h-px ${dark ? "bg-ink-800" : "bg-ink-200"}`} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>კლუბის სახელი</span><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="block">
            <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ქალაქი</span>
            <div className="relative">
              <select value={city} onChange={(e) => setCity(e.target.value)} className={`${inputCls} appearance-none pr-10`}>{CITIES.map((c) => <option key={c} className={dark ? "bg-ink-900" : "bg-white"}>{c}</option>)}</select>
              <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${T.muted}`}>{Ic.chevronDown("h-4 w-4")}</span>
            </div>
          </label>
          <label className="block">
            <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ლიგა</span>
            <div className="relative">
              <select value={league} onChange={(e) => setLeague(e.target.value)} className={`${inputCls} appearance-none pr-10`}>{LEAGUES.map((l) => <option key={l} className={dark ? "bg-ink-900" : "bg-white"}>{l}</option>)}</select>
              <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${T.muted}`}>{Ic.chevronDown("h-4 w-4")}</span>
            </div>
          </label>
        </div>

        <label className="block">
          <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>კლუბის შესახებ</span>
          <textarea rows={4} className={`${inputCls} h-auto py-2.5`} value={about} onChange={(e) => setAbout(e.target.value)} />
        </label>

        <div>
          <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>საჭირო პოზიციები</span>
          <div className="flex flex-wrap gap-2">{POSITIONS.map((p) => <MultiChip key={p.v} label={p.l} active={pos.includes(p.v)} onClick={() => toggle(pos, setPos, p.v)} />)}</div>
        </div>
        <div>
          <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>ასაკობრივი ჯგუფები</span>
          <div className="flex flex-wrap gap-2">{AGES.map((a) => <MultiChip key={a.v} label={a.l} active={ages.includes(a.v)} onClick={() => toggle(ages, setAges, a.v)} />)}</div>
        </div>

        {state?.error && <div className="rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-[13px] text-danger-300">{state.error}</div>}
        {state?.ok && <div className="rounded-field border border-brand-500/30 bg-brand-500/10 px-3.5 py-2.5 text-[13px] text-brand-300">პროფილი განახლდა ✓</div>}

        <div className={`flex items-center gap-3 border-t pt-5 ${T.border}`}>
          <button type="submit" disabled={pending} className="inline-flex h-11 items-center rounded-btn bg-brand-400 px-6 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">{pending ? "ინახება..." : "ცვლილებების შენახვა"}</button>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className={`mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider ${T.muted}`}><span className="h-1.5 w-1.5 rounded-full bg-brand-400" />როგორ ხედავს მოთამაშე</div>
        <div className={`rounded-card border p-5 ${T.card}`}>
          <div className="flex items-center gap-4">
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-card bg-brand-500/15 font-display text-[18px] font-extrabold ${T.brand2}`}>{badge}</div>
            <div className="min-w-0">
              <div className={`text-[16px] font-bold ${T.h}`}>{name || "კლუბის სახელი"}</div>
              <div className={`flex items-center gap-1.5 text-[12.5px] ${T.muted}`}>{Ic.pin("h-3.5 w-3.5")}{city} · {league}</div>
            </div>
          </div>
          <p className={`mt-4 text-[13px] leading-relaxed ${T.t3}`}>{about || "აღწერა ჯერ არ დამატებულა."}</p>
          <div className={`mt-4 border-t pt-4 ${T.border}`}>
            <div className={`mb-2 text-[11px] font-semibold uppercase tracking-wide ${T.muted}`}>ეძებს</div>
            <div className="flex flex-wrap gap-1.5">
              {pos.length === 0 && ages.length === 0 && <span className={`text-[12.5px] ${T.faint}`}>—</span>}
              {pos.map((p) => <span key={p} className={`rounded-pill bg-brand-500/12 px-2 py-0.5 text-[11px] font-medium ${T.brand2}`}>{POSITIONS.find((x) => x.v === p)?.l}</span>)}
              {ages.map((a) => <span key={a} className={`rounded-pill bg-accent-500/12 px-2 py-0.5 text-[11px] font-medium ${dark ? "text-accent-300" : "text-accent-700"}`}>{AGES.find((x) => x.v === a)?.l}</span>)}
            </div>
          </div>
          <div className={`mt-4 flex items-center gap-4 border-t pt-4 text-center ${T.border}`}>
            {[["ქალაქი", city], ["ლიგა", league.split(" ")[0]], ["სინჯი", String(trialCount)]].map(([l, v]) => (
              <div key={l} className="flex-1">
                <div className={`font-mono text-[15px] font-bold tabular-nums ${T.h}`}>{v}</div>
                <div className={`text-[11px] ${T.muted}`}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );

  function MultiChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[13px] font-medium transition-colors ${active ? `border-brand-400 bg-brand-500/15 ${T.brand2}` : T.chipIdle}`}>
        {active && <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-2.5 w-2.5")}</span>}
        {label}
      </button>
    );
  }
}
