"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";
import { createTrialForClub, type FormState } from "@/app/actions/admin";

const POSITIONS: { v: string; l: string }[] = [
  { v: "GK", l: "მეკარე" }, { v: "DF", l: "მცველი" }, { v: "MF", l: "ნახევარმცველი" }, { v: "FW", l: "თავდამსხმელი" },
];
const AGES: { v: string; l: string }[] = [
  { v: "U17", l: "U-17" }, { v: "U19", l: "U-19" }, { v: "U21", l: "U-21" }, { v: "SENIOR", l: "ზრდასრული" },
];

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

export function AdminTrialsContent({ trials, clubs }: { trials: AdminTrialRow[]; clubs: { id: string; name: string }[] }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [tab, setTab] = useState("ყველა");
  const [q, setQ] = useState("");
  const [create, setCreate] = useState(false);
  const [pos, setPos] = useState<string[]>([]);
  const [ages, setAges] = useState<string[]>([]);
  const [state, formAction, creating] = useActionState<FormState, FormData>(createTrialForClub, undefined);

  useEffect(() => { if (state?.ok) { setCreate(false); setPos([]); setAges([]); router.refresh(); } }, [state, router]);

  const list = trials.filter((t) => (tab === "ყველა" || t.status === tab) && (t.title.includes(q) || t.club.includes(q)));
  const modalInput = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${dark ? "bg-ink-950 border-ink-700 text-ink-50 placeholder:text-ink-500" : "bg-ink-50 border-ink-300 text-ink-900 placeholder:text-ink-400"}`;
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
        <button type="button" onClick={() => setCreate(true)} className="ml-auto inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.plus("h-4 w-4")} ახალი სინჯი</button>
        <div className="relative">
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${T.faint}`}>{Ic.search("h-4 w-4")}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ძებნა სინჯით ან კლუბით" className={`h-10 w-64 rounded-field border pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`} />
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

      {/* Create trial modal (admin → any club) */}
      {create && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${T.overlay}`} onClick={() => setCreate(false)}>
          <form action={formAction} className={`max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card border p-6 shadow-float ${T.card}`} onClick={(e) => e.stopPropagation()}>
            {pos.map((p) => <input key={p} type="hidden" name="positions" value={p} />)}
            {ages.map((a) => <input key={a} type="hidden" name="ageGroups" value={a} />)}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className={`text-[17px] font-bold ${T.h}`}>ახალი სინჯი</h3>
                <p className={`mt-0.5 text-[12.5px] ${T.muted}`}>აირჩიე კლუბი — სინჯი გამოჩნდება მორგებულ მოთამაშეებთან</p>
              </div>
              <button type="button" onClick={() => setCreate(false)} className={`rounded-btn p-1.5 ${T.iconBtnFlat}`}>{Ic.close("h-5 w-5")}</button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>კლუბი</span>
                <div className="relative">
                  <select name="clubId" required defaultValue="" className={`${modalInput} appearance-none pr-10`}>
                    <option value="" disabled>აირჩიე კლუბი</option>
                    {clubs.map((c) => <option key={c.id} value={c.id} className={dark ? "bg-ink-950" : "bg-white"}>{c.name}</option>)}
                  </select>
                  <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${T.muted}`}>{Ic.chevronDown("h-4 w-4")}</span>
                </div>
              </label>
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>სათაური</span><input name="title" required className={modalInput} placeholder="მაგ: თავდამსხმელების სელექცია — U-21" /></label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>თარიღი</span><input name="date" type="date" required className={modalInput} /></label>
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ადგილების ლიმიტი</span><input name="slotsLimit" type="number" min={1} defaultValue={20} required className={modalInput} /></label>
              </div>
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ლოკაცია</span><input name="location" required className={modalInput} placeholder="სტადიონი / მისამართი" /></label>
              <div>
                <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>პოზიციები</span>
                <div className="flex flex-wrap gap-2">{POSITIONS.map((p) => (
                  <button key={p.v} type="button" onClick={() => setPos((a) => a.includes(p.v) ? a.filter((x) => x !== p.v) : [...a, p.v])} className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[13px] font-medium transition-colors ${pos.includes(p.v) ? `border-brand-400 bg-brand-500/15 ${T.brand2}` : T.chipIdle}`}>{pos.includes(p.v) && <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-2.5 w-2.5")}</span>}{p.l}</button>
                ))}</div>
              </div>
              <div>
                <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>ასაკობრივი ჯგუფები</span>
                <div className="flex flex-wrap gap-2">{AGES.map((a) => (
                  <button key={a.v} type="button" onClick={() => setAges((x) => x.includes(a.v) ? x.filter((y) => y !== a.v) : [...x, a.v])} className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[13px] font-medium transition-colors ${ages.includes(a.v) ? `border-brand-400 bg-brand-500/15 ${T.brand2}` : T.chipIdle}`}>{ages.includes(a.v) && <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-2.5 w-2.5")}</span>}{a.l}</button>
                ))}</div>
              </div>
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>კრიტერიუმები — არასავალდებულო</span><textarea name="criteria" rows={2} className={`${modalInput} h-auto py-2.5`} placeholder="ვის ეძებთ და რას უნდა ელოდოს მოთამაშე" /></label>
              {state?.error && <div className="rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2 text-[13px] text-danger-300">{state.error}</div>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCreate(false)} className={`inline-flex h-10 items-center rounded-btn border px-5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>გაუქმება</button>
              <button type="submit" disabled={creating} className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">{Ic.plus("h-4 w-4")} {creating ? "ქვეყნდება..." : "სინჯის გამოქვეყნება"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
