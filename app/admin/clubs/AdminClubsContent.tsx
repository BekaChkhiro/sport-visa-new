"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";
import { createClub, deleteClub, setClubAcceptingById, type FormState } from "@/app/actions/admin";

export type ClubRow = {
  id: string;
  n: string;
  name: string;
  league: string;
  city: string;
  trials: number;
  apps: number;
  status: string;
  created: string;
  manager: string;
  tone: string;
};

const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი"];
const LEAGUES = ["ეროვნული ლიგა", "ეროვნული ლიგა 2", "ლიგა 3", "რეგიონული ლიგა", "ამატორული ლიგა"];
const POSITIONS: { v: string; l: string }[] = [
  { v: "GK", l: "მეკარე" }, { v: "DF", l: "მცველი" }, { v: "MF", l: "ნახევარმცველი" }, { v: "FW", l: "თავდამსხმელი" },
];

function StatusBadge({ s }: { s: string }) {
  const dark = useDark();
  const map: Record<string, string> = {
    "აქტიური": dark ? "bg-brand-500/12 text-brand-300 border-brand-500/25" : "bg-brand-500/12 text-brand-700 border-brand-500/25",
    "შეჩერებული": dark ? "bg-warning-500/12 text-warning-300 border-warning-500/25" : "bg-warning-500/12 text-warning-700 border-warning-500/25",
  };
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${map[s]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span>;
}

export function AdminClubsContent({ clubs }: { clubs: ClubRow[] }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("ყველა");
  const [menu, setMenu] = useState<string | null>(null);
  const [create, setCreate] = useState(false);
  const [pos, setPos] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [state, formAction, creating] = useActionState<FormState, FormData>(createClub, undefined);

  useEffect(() => { if (state?.ok) { setCreate(false); setPos([]); router.refresh(); } }, [state, router]);

  const list = clubs.filter((c) => (tab === "ყველა" || c.status === tab) && c.name.includes(q));
  const toneClasses = (t: string) => {
    const m: Record<string, string> = {
      brand: dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700",
      accent: dark ? "bg-accent-500/15 text-accent-300" : "bg-accent-500/15 text-accent-700",
      iris: dark ? "bg-iris-500/15 text-iris-300" : "bg-iris-500/15 text-iris-700",
      flame: dark ? "bg-flame-500/15 text-flame-300" : "bg-flame-500/15 text-flame-700",
    };
    return m[t] ?? T.square;
  };
  const modalInput = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${dark ? "bg-ink-950 border-ink-700 text-ink-50 placeholder:text-ink-500" : "bg-ink-50 border-ink-300 text-ink-900 placeholder:text-ink-400"}`;

  function toggleStatus(c: ClubRow) {
    startTransition(async () => {
      await setClubAcceptingById(c.id, c.status !== "აქტიური");
      setMenu(null);
      router.refresh();
    });
  }
  function remove(id: string) {
    startTransition(async () => {
      await deleteClub(id);
      setMenu(null);
      router.refresh();
    });
  }

  return (
    <div onClick={() => setMenu(null)}>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className={`flex gap-1 rounded-pill border p-1 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"}`}>
          {["ყველა", "აქტიური", "შეჩერებული"].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-pill px-3 py-1.5 text-[12.5px] font-medium transition-colors ${tab === t ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{t}</button>
          ))}
        </div>
        <button type="button" onClick={() => setCreate(true)} className="ml-auto inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.plus("h-4 w-4")} ახალი კლუბი</button>
        <div className="relative">
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${T.faint}`}>{Ic.search("h-4 w-4")}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ძებნა კლუბით" className={`h-10 w-56 rounded-field border pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`} />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-card border ${T.border}`}>
        <div className={`grid grid-cols-[1fr_120px_80px_100px_110px_44px] gap-4 border-b px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${T.thead} ${T.muted}`}>
          <span>კლუბი</span><span>ქალაქი</span><span className="text-right">სინჯი</span><span className="text-right">აპლიკანტი</span><span>სტატუსი</span><span></span>
        </div>
        {list.map((c) => (
          <div key={c.id} className={`grid grid-cols-[1fr_120px_80px_100px_110px_44px] items-center gap-4 border-b px-5 py-3.5 last:border-0 transition-colors ${T.rowBorder} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
            <Link href={`/admin/clubs/${c.id}`} className="flex min-w-0 items-center gap-3">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-btn font-display text-[14px] font-bold ${toneClasses(c.tone)}`}>{c.n}</div>
              <div className="min-w-0"><div className={`truncate text-[14px] font-medium ${T.h}`}>{c.name}</div><div className={`truncate text-[12px] ${T.muted}`}>{c.league} · {c.manager}</div></div>
            </Link>
            <span className={`text-[13px] ${T.t2}`}>{c.city}</span>
            <span className={`text-right font-mono text-[13px] tabular-nums ${T.t2}`}>{c.trials}</span>
            <span className={`text-right font-mono text-[13px] font-semibold tabular-nums ${T.brand}`}>{c.apps}</span>
            <div><StatusBadge s={c.status} /></div>
            <div className="relative flex justify-end">
              <button type="button" onClick={(e) => { e.stopPropagation(); setMenu(menu === c.id ? null : c.id); }} className={`grid h-8 w-8 place-items-center rounded-btn ${T.iconBtnFlat}`}>{Ic.dots("h-4 w-4")}</button>
              {menu === c.id && (
                <div className={`absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-card border py-1 shadow-pop ${T.card}`} onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => toggleStatus(c)} disabled={pending} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium ${dark ? "text-warning-300 hover:bg-warning-500/10" : "text-warning-700 hover:bg-warning-500/10"}`}>{Ic.check("h-4 w-4")}{c.status === "აქტიური" ? "შეჩერება" : "გააქტიურება"}</button>
                  <button type="button" onClick={() => remove(c.id)} disabled={pending} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium hover:bg-danger-500/10 ${dark ? "text-danger-400" : "text-danger-600"}`}>{Ic.trash("h-4 w-4")}წაშლა</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && <div className={`px-5 py-12 text-center text-[13px] ${T.faint}`}>კლუბი ვერ მოიძებნა.</div>}
      </div>

      {/* Create modal */}
      {create && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${T.overlay}`} onClick={() => setCreate(false)}>
          <form action={formAction} className={`max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card border p-6 shadow-float ${T.card}`} onClick={(e) => e.stopPropagation()}>
            <input type="hidden" name="acceptingTrials" value="on" />
            {pos.map((p) => <input key={p} type="hidden" name="positionsNeeded" value={p} />)}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className={`text-[17px] font-bold ${T.h}`}>ახალი კლუბის შექმნა</h3>
                <p className={`mt-0.5 text-[12.5px] ${T.muted}`}>კლუბი მიიღებს შესვლის მონაცემებს და შეძლებს სინჯების გამოქვეყნებას</p>
              </div>
              <button type="button" onClick={() => setCreate(false)} className={`rounded-btn p-1.5 ${T.iconBtnFlat}`}>{Ic.close("h-5 w-5")}</button>
            </div>
            <div className="space-y-4">
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>კლუბის სახელი</span><input name="name" required className={modalInput} placeholder="მაგ. WIT ჯორჯია" /></label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ქალაქი</span>
                  <div className="relative"><select name="city" className={`${modalInput} appearance-none pr-10`}>{CITIES.map((c) => <option key={c} className={dark ? "bg-ink-950" : "bg-white"}>{c}</option>)}</select><span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${T.muted}`}>{Ic.chevronDown("h-4 w-4")}</span></div>
                </label>
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ლიგა</span>
                  <div className="relative"><select name="league" className={`${modalInput} appearance-none pr-10`}>{LEAGUES.map((l) => <option key={l} className={dark ? "bg-ink-950" : "bg-white"}>{l}</option>)}</select><span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${T.muted}`}>{Ic.chevronDown("h-4 w-4")}</span></div>
                </label>
              </div>
              <div>
                <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>საჭირო პოზიციები</span>
                <div className="flex flex-wrap gap-2">{POSITIONS.map((p) => (
                  <button key={p.v} type="button" onClick={() => setPos((a) => a.includes(p.v) ? a.filter((x) => x !== p.v) : [...a, p.v])} className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[13px] font-medium transition-colors ${pos.includes(p.v) ? `border-brand-400 bg-brand-500/15 ${T.brand2}` : T.chipIdle}`}>{pos.includes(p.v) && <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-2.5 w-2.5")}</span>}{p.l}</button>
                ))}</div>
              </div>
              <div className={`rounded-card border p-4 ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-ink-50"}`}>
                <div className={`mb-3 text-[12px] font-semibold uppercase tracking-wide ${T.muted}`}>კლუბის შესვლის მონაცემები</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ელ. ფოსტა</span><input name="managerEmail" type="email" required className={modalInput} placeholder="club@sportvisa.ge" /></label>
                  <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>დროებითი პაროლი</span><input name="managerPassword" required className={modalInput} defaultValue="sv-7f3k9x" /></label>
                </div>
              </div>
              {state?.error && <div className="rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2 text-[13px] text-danger-300">{state.error}</div>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCreate(false)} className={`inline-flex h-10 items-center rounded-btn border px-5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>გაუქმება</button>
              <button type="submit" disabled={creating} className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">{Ic.plus("h-4 w-4")} {creating ? "იქმნება..." : "კლუბის შექმნა"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
