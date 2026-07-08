"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";
import { createTrial, type FormState } from "@/app/actions/club";

const POSITIONS: { v: string; l: string }[] = [
  { v: "GK", l: "მეკარე" },
  { v: "DF", l: "მცველი" },
  { v: "MF", l: "ნახევარმცველი" },
  { v: "FW", l: "თავდამსხმელი" },
];
const AGES: { v: string; l: string }[] = [
  { v: "U17", l: "U-17" },
  { v: "U19", l: "U-19" },
  { v: "U21", l: "U-21" },
  { v: "SENIOR", l: "ზრდასრული" },
];
const MONTHS = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"];

export function ClubTrialNewForm({ clubName, league }: { clubName: string; league: string }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(createTrial, undefined);

  const [title, setTitle] = useState("");
  const [criteria, setCriteria] = useState("");
  const [pos, setPos] = useState<string[]>([]);
  const [ages, setAges] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("11:00");
  const [place, setPlace] = useState("");
  const [slots, setSlots] = useState("20");

  useEffect(() => {
    if (state?.ok) router.push("/club/trials");
  }, [state, router]);

  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const badge = clubName.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
  const fmtDate = (d: string) => { if (!d) return "—"; const [, m, day] = d.split("-"); return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]}`; };

  return (
    <div>
      <Link href="/club/trials" className={`mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>{Ic.arrowLeft("h-4 w-4")} სინჯებზე დაბრუნება</Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        {/* Form */}
        <form action={formAction} className="max-w-2xl space-y-7">
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="criteria" value={criteria} />
          <input type="hidden" name="location" value={place} />
          <input type="hidden" name="slotsLimit" value={slots} />
          <input type="hidden" name="date" value={date ? `${date}T${time || "11:00"}` : ""} />
          {pos.map((p) => <input key={p} type="hidden" name="positions" value={p} />)}
          {ages.map((a) => <input key={a} type="hidden" name="ageGroups" value={a} />)}

          <section className="space-y-4">
            <SecTitle n="01" t="ძირითადი" />
            <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>სათაური</span><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="მაგ: თავდამსხმელების სელექცია — U-21" /></label>
            <label className="block">
              <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>კრიტერიუმები / აღწერა</span>
              <textarea rows={3} className={`${inputCls} h-auto py-2.5`} value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="ვის ეძებთ და რას უნდა ელოდოს მოთამაშე" />
            </label>
          </section>

          <section className="space-y-4">
            <SecTitle n="02" t="საჭირო პოზიცია და ასაკი" />
            <div>
              <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>პოზიცია</span>
              <div className="flex flex-wrap gap-2">{POSITIONS.map((p) => <MultiChip key={p.v} label={p.l} active={pos.includes(p.v)} onClick={() => toggle(pos, setPos, p.v)} />)}</div>
            </div>
            <div>
              <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>ასაკობრივი ჯგუფი</span>
              <div className="flex flex-wrap gap-2">{AGES.map((a) => <MultiChip key={a.v} label={a.l} active={ages.includes(a.v)} onClick={() => toggle(ages, setAges, a.v)} />)}</div>
            </div>
          </section>

          <section className="space-y-4">
            <SecTitle n="03" t="დრო, ადგილი და ადგილები" />
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>თარიღი</span><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>დრო</span><input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} /></label>
            </div>
            <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ლოკაცია</span><input className={inputCls} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="სტადიონი / მისამართი" /></label>
            <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ადგილების ლიმიტი</span><input type="number" min={1} className={`${inputCls} w-40`} value={slots} onChange={(e) => setSlots(e.target.value)} /></label>
          </section>

          {state?.error && <div className="rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-[13px] text-danger-300">{state.error}</div>}

          <div className={`flex items-center gap-3 border-t pt-5 ${T.border}`}>
            <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-btn bg-brand-400 px-6 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 disabled:opacity-50">{pending ? "ქვეყნდება..." : "სინჯის გამოქვეყნება"}</button>
            <Link href="/club/trials" className={`inline-flex h-11 items-center rounded-btn border px-5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>გაუქმება</Link>
          </div>
        </form>

        {/* Live preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className={`mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider ${T.muted}`}><span className="h-1.5 w-1.5 rounded-full bg-brand-400" />ცოცხალი წინასწარი ხედი</div>
          <div className={`rounded-card border p-5 ${T.card}`}>
            <div className={`mb-1 text-[11px] font-medium uppercase tracking-wide ${T.muted}`}>როგორ დაინახავს მოთამაშე</div>
            <div className={`mt-3 flex items-start gap-4 rounded-card border p-4 ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-ink-50"}`}>
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-btn font-display text-[13px] font-bold ${T.square}`}>{badge}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className={`text-[15px] font-bold ${T.h}`}>{clubName}</span><span className={`whitespace-nowrap rounded-pill border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${dark ? "border-ink-700 bg-ink-800 text-ink-300" : "border-ink-200 bg-ink-100 text-ink-600"}`}>{league}</span></div>
                <div className={`mt-1 text-[13px] ${T.t2}`}>{title || "სინჯის სათაური"}</div>
                <div className={`mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] ${T.muted}`}>
                  <span className="inline-flex items-center gap-1.5">{Ic.calendar("h-3.5 w-3.5")}{fmtDate(date)}, {time}</span>
                  <span className="inline-flex items-center gap-1.5">{Ic.pin("h-3.5 w-3.5")}{place || "—"}</span>
                  <span className="inline-flex items-center gap-1.5">{Ic.users("h-3.5 w-3.5")}<span className="tabular-nums">0/{slots || "—"}</span></span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pos.map((p) => <span key={p} className={`rounded-pill bg-brand-500/12 px-2 py-0.5 text-[11px] font-medium ${T.brand2}`}>{POSITIONS.find((x) => x.v === p)?.l}</span>)}
                  {ages.map((a) => <span key={a} className={`rounded-pill bg-accent-500/12 px-2 py-0.5 text-[11px] font-medium ${dark ? "text-accent-300" : "text-accent-700"}`}>{AGES.find((x) => x.v === a)?.l}</span>)}
                </div>
              </div>
            </div>
            <div className={`mt-4 flex items-start gap-2.5 rounded-card border border-info-500/25 bg-info-500/8 p-3 text-[12.5px] ${dark ? "text-info-200" : "text-info-700"}`}>
              <span className="mt-0.5">{Ic.shield("h-4 w-4")}</span>
              <span>თავსებადობა ავტომატურად დაითვლება პოზიციის, ასაკის, ქალაქისა და დონის მიხედვით.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function SecTitle({ n, t }: { n: string; t: string }) {
    return (
      <div className="flex items-center gap-2.5">
        <span className={`font-mono text-[12px] font-bold ${T.brand}`}>{n}</span>
        <h2 className={`text-[16px] font-bold ${T.h}`}>{t}</h2>
        <div className={`ml-1 h-px flex-1 ${dark ? "bg-ink-800" : "bg-ink-200"}`} />
      </div>
    );
  }
  function MultiChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[13px] font-medium transition-colors ${active ? `border-brand-400 bg-brand-500/15 ${T.brand2}` : T.chipIdle}`}>
        {active && <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-2.5 w-2.5")}</span>}
        {label}
      </button>
    );
  }
}
