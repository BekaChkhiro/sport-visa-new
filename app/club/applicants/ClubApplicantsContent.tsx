"use client";

import { useState } from "react";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";

export type Applicant = {
  id: string;
  n: number;
  name: string;
  pos: string;
  age: number;
  city: string;
  level: string;
  league: string;
  score: number;
  date: string;
  trialTitle: string;
  weights: { l: string; v: number; pct: number }[];
  media: string[];
};

const PAGE_SIZE = 10;

export function ClubApplicantsContent({ applicants, slots }: { applicants: Applicant[]; slots: number }) {
  const dark = useDark();
  const T = useT();
  const [sel, setSel] = useState<Applicant | null>(null);
  const [sort, setSort] = useState("match");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const list = applicants
    .filter((a) => a.name.includes(q))
    .slice()
    .sort((a, b) => (sort === "match" ? b.score - a.score : b.age - a.age));
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const paged = list.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const inputCls = `h-10 rounded-field border pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;
  const scoreTone = (s: number) => (s >= 80 ? T.brand : s >= 65 ? "text-accent-400" : "text-warning-400");
  const scoreBar = (s: number) => (s >= 80 ? "bg-brand-400" : s >= 65 ? "bg-accent-400" : "bg-warning-400");

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${T.faint}`}>{Ic.search("h-4 w-4")}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ძებნა სახელით" className={`${inputCls} w-56`} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-[12.5px] ${T.muted}`}>დახარისხება:</span>
          <div className={`flex gap-1 rounded-pill border p-1 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"}`}>
            {[["match", "თავსებადობა"], ["age", "ასაკი"]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setSort(k)} className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12.5px] font-medium transition-colors ${sort === k ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-hidden rounded-card border ${T.border}`}>
        <div className={`grid grid-cols-[36px_1fr_140px_120px_100px] gap-4 border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${T.thead} ${T.muted}`}>
          <span>#</span><span>მოთამაშე</span><span>ქალაქი · დონე</span><span className="text-right">თავსებადობა</span><span className="text-right">განაცხადი</span>
        </div>
        {paged.map((a, i) => (
          <button key={a.id} type="button" onClick={() => setSel(a)} className={`grid w-full grid-cols-[36px_1fr_140px_120px_100px] items-center gap-4 border-b px-4 py-3 text-left transition-colors last:border-0 ${T.rowBorder} ${sel?.id === a.id ? (dark ? "bg-ink-900/80" : "bg-ink-100") : dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
            <span className={`font-mono text-[13px] tabular-nums ${T.faint}`}>{(activePage - 1) * PAGE_SIZE + i + 1}</span>
            <div className="flex min-w-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.pravatar.cc/80?img=${a.n}`} alt="" className="h-9 w-9 rounded-full object-cover" />
              <div className="min-w-0"><div className={`truncate text-[14px] font-medium ${T.h}`}>{a.name}</div><div className={`text-[12px] ${T.muted}`}>{a.pos} · {a.age}</div></div>
            </div>
            <div className={`min-w-0 text-[12.5px] ${T.t3}`}><div className="truncate">{a.city}</div><div className={`truncate ${T.faint}`}>{a.level}</div></div>
            <div className="flex items-center justify-end gap-2">
              <div className={`hidden h-1.5 w-14 overflow-hidden rounded-pill sm:block ${T.track}`}><div className={`h-full rounded-pill ${scoreBar(a.score)}`} style={{ width: `${a.score}%` }} /></div>
              <span className={`w-9 text-right font-mono text-[14px] font-bold tabular-nums ${scoreTone(a.score)}`}>{a.score}</span>
            </div>
            <span className={`text-right font-mono text-[12.5px] tabular-nums ${T.muted}`}>{a.date}</span>
          </button>
        ))}
        {paged.length === 0 && <div className={`px-4 py-16 text-center text-[13px] ${T.faint}`}>{q ? "შედეგი ვერ მოიძებნა" : "ჯერ არავინ დარეგისტრირებულა."}</div>}
      </div>

      {/* Pagination */}
      {list.length > 0 && (
        <div className={`mt-3 flex items-center justify-between text-[12.5px] ${T.muted}`}>
          <span><span className={`font-mono tabular-nums ${T.t2}`}>{(activePage - 1) * PAGE_SIZE + 1}–{Math.min(activePage * PAGE_SIZE, list.length)}</span> / {list.length}</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={activePage === 1} className={`grid h-8 w-8 place-items-center rounded-btn border transition-colors disabled:opacity-40 ${dark ? "border-ink-800 text-ink-300 hover:bg-ink-900" : "border-ink-200 text-ink-600 hover:bg-ink-100"}`}>{Ic.arrowLeft("h-4 w-4")}</button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <button key={p} type="button" onClick={() => setPage(p)} className={`grid h-8 w-8 place-items-center rounded-btn font-mono text-[12.5px] font-semibold tabular-nums transition-colors ${p === activePage ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{p}</button>
            ))}
            <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={activePage === pageCount} className={`grid h-8 w-8 place-items-center rounded-btn border transition-colors disabled:opacity-40 ${dark ? "border-ink-800 text-ink-300 hover:bg-ink-900" : "border-ink-200 text-ink-600 hover:bg-ink-100"}`}>{Ic.arrow("h-4 w-4")}</button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {sel && (
        <div className={`fixed inset-0 z-50 flex justify-end backdrop-blur-sm ${T.overlay}`} onClick={() => setSel(null)}>
          <div className={`h-full w-full max-w-md overflow-y-auto border-l shadow-float ${T.card}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between border-b px-5 py-4 ${T.border}`}>
              <span className={`text-[13px] font-semibold ${T.t3}`}>აპლიკანტის დეტალები</span>
              <button type="button" onClick={() => setSel(null)} className={`rounded-btn p-1.5 ${T.iconBtnFlat}`}>{Ic.close("h-5 w-5")}</button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.pravatar.cc/120?img=${sel.n}`} alt="" className="h-16 w-16 rounded-card object-cover" />
                <div className="flex-1">
                  <div className={`text-[18px] font-bold ${T.h}`}>{sel.name}</div>
                  <div className={`text-[13px] ${T.muted}`}>{sel.pos} · {sel.age} წლის · {sel.city}</div>
                  <div className={`text-[12px] ${T.faint}`}>{sel.league}</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-[24px] font-bold leading-none tabular-nums ${sel.score >= 80 ? T.brand : "text-accent-400"}`}>{sel.score}%</div>
                  <div className={`text-[10px] uppercase tracking-wide ${T.muted}`}>match</div>
                </div>
              </div>

              <div className={`mt-3 rounded-card border px-3 py-2 text-[12.5px] ${dark ? "border-ink-800 bg-ink-950 text-ink-300" : "border-ink-200 bg-ink-50 text-ink-600"}`}>
                სინჯი: <span className={`font-medium ${T.t2}`}>{sel.trialTitle}</span>
              </div>

              <div className={`mt-4 rounded-card border p-4 ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-ink-50"}`}>
                <div className={`mb-3 text-[13px] font-semibold ${T.h}`}>თავსებადობის დაშლა</div>
                <div className="space-y-2.5">
                  {sel.weights.map((w) => (
                    <div key={w.l}>
                      <div className="mb-1 flex items-center justify-between text-[12px]"><span className={T.t3}>{w.l}</span><span className={`font-mono tabular-nums ${T.muted}`}>+{w.v}</span></div>
                      <div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400/70" style={{ width: `${w.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>

              {sel.media.length > 0 && (
                <div className="mt-5">
                  <div className={`mb-2 text-[13px] font-semibold ${T.h}`}>ვიდეო-ჰაილაითები</div>
                  <div className="grid grid-cols-2 gap-2">
                    {sel.media.map((url, i) => (
                      <div key={i} className={`relative aspect-video overflow-hidden rounded-card border ${T.border}`}>
                        <video src={url} className="h-full w-full object-cover" />
                        <span className="absolute inset-0 grid place-items-center"><span className="grid h-9 w-9 place-items-center rounded-full bg-ink-950/70 text-ink-50">{Ic.play("h-4 w-4")}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setSel(null)} className={`flex-1 rounded-btn border py-2.5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>დახურვა</button>
                <a href={`mailto:`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-btn bg-brand-400 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.check("h-4 w-4")} მოწვევა</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
