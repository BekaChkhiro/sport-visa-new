"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";
import { toggleTrialOpen, deleteTrial } from "@/app/actions/club";

export type TrialRow = {
  id: string;
  title: string;
  date: string;
  place: string;
  pos: string;
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

export function ClubTrialsContent({ trials }: { trials: TrialRow[] }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [tab, setTab] = useState("ყველა");
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [closing, setClosing] = useState<TrialRow | null>(null);
  const [pending, startTransition] = useTransition();

  const list = trials.filter((t) => (tab === "ყველა" || t.status === tab) && t.title.includes(q));

  function doClose(t: TrialRow) {
    startTransition(async () => {
      await toggleTrialOpen(t.id, false);
      setClosing(null);
      router.refresh();
    });
  }
  function doDelete(id: string) {
    startTransition(async () => {
      await deleteTrial(id);
      setMenu(null);
      router.refresh();
    });
  }

  return (
    <div onClick={() => setMenu(null)}>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className={`flex gap-1 rounded-pill border p-1 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"}`}>
          {TABS.map((t) => {
            const cnt = t === "ყველა" ? trials.length : trials.filter((x) => x.status === t).length;
            return (
              <button key={t} type="button" onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12.5px] font-medium transition-colors ${tab === t ? "bg-brand-400 text-ink-950" : T.navIdle}`}>
                {t}<span className={`font-mono tabular-nums ${tab === t ? "text-ink-950/70" : T.faint}`}>{cnt}</span>
              </button>
            );
          })}
        </div>
        <div className="relative ml-auto">
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${T.faint}`}>{Ic.search("h-4 w-4")}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ძებნა სახელით" className={`h-10 w-64 rounded-field border pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`} />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-card border ${T.border}`}>
        <div className={`grid grid-cols-[1fr_130px_110px_120px_44px] gap-4 border-b px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${T.thead} ${T.muted}`}>
          <span>სინჯი</span><span className="text-right">აპლიკანტი</span><span className="text-right">საშ. match</span><span>სტატუსი</span><span></span>
        </div>
        {list.map((t) => {
          const pctFill = Math.round((t.filled / t.slots) * 100);
          return (
            <div key={t.id} className={`grid grid-cols-[1fr_130px_110px_120px_44px] items-center gap-4 border-b px-5 py-4 last:border-0 transition-colors ${T.rowBorder} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
              <Link href={`/club/trials/${t.id}`} className="min-w-0">
                <div className={`truncate text-[14px] font-semibold ${T.h}`}>{t.title}</div>
                <div className={`mt-0.5 flex items-center gap-2 text-[12px] ${T.muted}`}><span>{t.date}</span><span className={T.dot}>·</span><span className="truncate">{t.place}</span><span className={T.dot}>·</span><span>{t.pos}</span></div>
              </Link>
              <div className="text-right">
                <div className={`font-mono text-[13px] font-semibold tabular-nums ${T.t1}`}>{t.filled}/{t.slots}</div>
                <div className={`mt-1 h-1 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${pctFill}%` }} /></div>
              </div>
              <div className="text-right"><span className={`font-mono text-[14px] font-bold tabular-nums ${t.avg >= 80 ? T.brand : t.avg >= 65 ? "text-accent-400" : "text-warning-400"}`}>{t.avg}%</span></div>
              <div><StatusBadge s={t.status} /></div>
              <div className="relative flex justify-end">
                <button type="button" onClick={(e) => { e.stopPropagation(); setMenu(menu === t.id ? null : t.id); }} className={`grid h-8 w-8 place-items-center rounded-btn ${T.iconBtnFlat}`}>{Ic.dots ? Ic.dots("h-4 w-4") : "⋯"}</button>
                {menu === t.id && (
                  <div className={`absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-card border py-1 shadow-pop ${T.card}`} onClick={(e) => e.stopPropagation()}>
                    <Link href={`/club/trials/${t.id}`} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium ${dark ? "text-ink-200 hover:bg-ink-800" : "text-ink-700 hover:bg-ink-100"}`}>{Ic.eye("h-4 w-4")}დეტალები</Link>
                    {t.status !== "დასრულებული" && <button type="button" onClick={() => { setClosing(t); setMenu(null); }} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium ${dark ? "text-ink-200 hover:bg-ink-800" : "text-ink-700 hover:bg-ink-100"}`}>{Ic.check("h-4 w-4")}დახურვა</button>}
                    <button type="button" disabled={pending} onClick={() => doDelete(t.id)} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium hover:bg-danger-500/10 ${dark ? "text-danger-400" : "text-danger-600"}`}>{Ic.trash("h-4 w-4")}წაშლა</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="grid place-items-center px-6 py-16 text-center">
            <div className={`mb-3 grid h-12 w-12 place-items-center rounded-full ${T.square}`}>{Ic.calendar("h-6 w-6")}</div>
            <div className={`text-[14px] font-semibold ${T.t1}`}>{q ? "შედეგი ვერ მოიძებნა" : "ამ სტატუსით სინჯი არ არის"}</div>
            <p className={`mt-1 max-w-xs text-[13px] ${T.muted}`}>{q ? "სცადე სხვა საძიებო სიტყვა." : "შექმენი ახალი სასინჯო ღონისძიება და გამოაქვეყნე მორგებულ მოთამაშეებთან."}</p>
            {!q && <Link href="/club/trials/new" className="mt-4 inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.plus("h-4 w-4")} ახალი სინჯი</Link>}
          </div>
        )}
      </div>

      {closing && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${T.overlay}`} onClick={() => setClosing(null)}>
          <div className={`w-full max-w-sm rounded-card border p-6 shadow-float ${T.card}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-btn ${dark ? "bg-warning-500/15 text-warning-300" : "bg-warning-500/15 text-warning-700"}`}>{Ic.check("h-5 w-5")}</div>
                <h3 className={`text-[16px] font-bold ${T.h}`}>სინჯის დახურვა</h3>
              </div>
              <button type="button" onClick={() => setClosing(null)} className={`rounded-btn p-1.5 ${T.iconBtnFlat}`}>{Ic.close("h-5 w-5")}</button>
            </div>
            <p className={`text-[14px] leading-relaxed ${T.muted}`}>„{closing.title}" აღარ გამოჩნდება მოთამაშეებთან და ახალ განაცხადებს ვეღარ მიიღებ. არსებული აპლიკანტები დარჩება.</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setClosing(null)} className={`flex-1 rounded-btn border py-2.5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>გაუქმება</button>
              <button type="button" disabled={pending} onClick={() => doClose(closing)} className="flex-1 rounded-btn bg-brand-400 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">{pending ? "..." : "დახურვა"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
