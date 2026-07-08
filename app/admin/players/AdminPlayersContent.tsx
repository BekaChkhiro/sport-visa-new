"use client";

import { useState } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";

export type PlayerRow = {
  id: string;
  n: number;
  name: string;
  pos: string;
  age: number;
  city: string;
  level: string;
  done: number;
  apps: number;
  status: string;
  joined: string;
};

const POSFILTER = ["ყველა", "თავდამსხმელი", "ნახევარმცველი", "მცველი", "მეკარე"];
const PAGE_SIZE = 12;

export function AdminPlayersContent({ players }: { players: PlayerRow[] }) {
  const dark = useDark();
  const T = useT();
  const [q, setQ] = useState("");
  const [pf, setPf] = useState("ყველა");
  const [page, setPage] = useState(1);

  const list = players.filter((p) => (pf === "ყველა" || p.pos === pf) && p.name.includes(q));
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const paged = list.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const doneTone = (v: number) => (v >= 80 ? T.brand : v >= 60 ? "text-accent-400" : "text-warning-400");
  const doneBar = (v: number) => (v >= 80 ? "bg-brand-400" : v >= 60 ? "bg-accent-400" : "bg-warning-400");

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className={`flex flex-wrap gap-1 rounded-pill border p-1 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"}`}>
          {POSFILTER.map((t) => (
            <button key={t} type="button" onClick={() => { setPf(t); setPage(1); }} className={`rounded-pill px-3 py-1.5 text-[12.5px] font-medium transition-colors ${pf === t ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{t}</button>
          ))}
        </div>
        <div className="relative ml-auto">
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${T.faint}`}>{Ic.search("h-4 w-4")}</span>
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="ძებნა სახელით" className={`h-10 w-56 rounded-field border pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`} />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-card border ${T.border}`}>
        <div className={`grid grid-cols-[1fr_130px_90px_140px_100px] gap-4 border-b px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${T.thead} ${T.muted}`}>
          <span>მოთამაშე</span><span>ქალაქი · დონე</span><span className="text-right">განაცხადი</span><span>პროფილი</span><span>რეგისტრ.</span>
        </div>
        {paged.map((p, i) => (
          <Link key={p.id + i} href={`/admin/players/${p.id}`} className={`grid grid-cols-[1fr_130px_90px_140px_100px] items-center gap-4 border-b px-5 py-3.5 last:border-0 transition-colors ${T.rowBorder} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
            <div className="flex min-w-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.pravatar.cc/80?img=${p.n}`} alt="" className="h-[38px] w-[38px] rounded-full object-cover" />
              <div className="min-w-0"><div className={`truncate text-[14px] font-medium ${T.h}`}>{p.name}</div><div className={`text-[12px] ${T.muted}`}>{p.pos} · {p.age}</div></div>
            </div>
            <div className={`min-w-0 text-[12.5px] ${T.t3}`}><div className="truncate">{p.city}</div><div className={`truncate ${T.faint}`}>{p.level}</div></div>
            <span className={`text-right font-mono text-[13px] tabular-nums ${T.t2}`}>{p.apps}</span>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 flex-1 overflow-hidden rounded-pill ${T.track}`}><div className={`h-full rounded-pill ${doneBar(p.done)}`} style={{ width: `${p.done}%` }} /></div>
              <span className={`w-9 text-right font-mono text-[12.5px] font-semibold tabular-nums ${doneTone(p.done)}`}>{p.done}%</span>
            </div>
            <span className={`font-mono text-[12.5px] tabular-nums ${T.muted}`}>{p.joined}</span>
          </Link>
        ))}
        {paged.length === 0 && <div className={`px-5 py-12 text-center text-[13px] ${T.faint}`}>მოთამაშე ვერ მოიძებნა.</div>}
      </div>

      {/* Pagination */}
      {list.length > 0 && (
        <div className={`mt-3 flex items-center justify-between text-[12.5px] ${T.muted}`}>
          <span><span className={`font-mono tabular-nums ${T.t2}`}>{(activePage - 1) * PAGE_SIZE + 1}–{Math.min(activePage * PAGE_SIZE, list.length)}</span> / {list.length}</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={activePage === 1} className={`grid h-8 w-8 place-items-center rounded-btn border transition-colors disabled:opacity-40 ${dark ? "border-ink-800 text-ink-300 hover:bg-ink-900" : "border-ink-200 text-ink-600 hover:bg-ink-100"}`}>{Ic.arrowLeft("h-4 w-4")}</button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).slice(0, 6).map((p) => (
              <button key={p} type="button" onClick={() => setPage(p)} className={`grid h-8 w-8 place-items-center rounded-btn font-mono text-[12.5px] font-semibold tabular-nums transition-colors ${p === activePage ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{p}</button>
            ))}
            <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={activePage === pageCount} className={`grid h-8 w-8 place-items-center rounded-btn border transition-colors disabled:opacity-40 ${dark ? "border-ink-800 text-ink-300 hover:bg-ink-900" : "border-ink-200 text-ink-600 hover:bg-ink-100"}`}>{Ic.arrow("h-4 w-4")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
