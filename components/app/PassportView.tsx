"use client";

import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";
import type { PassportDTO } from "@/lib/passport";

const kmh = (meters: number, secs: number | null) =>
  secs && secs > 0 ? Math.round((meters / secs) * 3.6 * 10) / 10 : null;

// Renders the detailed player passport: speed & foot, secondary positions,
// team & contract, career, documents, match links. Sections render only
// when they hold data. Used by the profile page and the club applicant view.
export function PassportView({ p }: { p: PassportDTO }) {
  const dark = useDark();
  const T = useT();

  const cardCls = `rounded-card border p-6 ${T.card}`;
  const hasSpeed = p.sprint10m || p.sprint30m;
  const hasFoot = p.preferredFoot || p.rightFootPct != null || p.leftFootPct != null;
  const hasTeam = p.currentTeam || p.activeSeason || p.contractStart || p.contractEnd;
  const hasDocs = p.gradesSheetUrl || p.contractDocUrl || p.school;

  function Bar({ label, value, right }: { label: string; value: number; right?: string }) {
    return (
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className={`text-[13px] ${T.t2}`}>{label}</span>
          <span className={`font-mono text-[12.5px] font-semibold tabular-nums ${T.brand}`}>{right ?? `${value}%`}</span>
        </div>
        <div className={`h-2 overflow-hidden rounded-pill ${T.track}`}>
          <div className="h-full rounded-pill bg-brand-400" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(hasSpeed || hasFoot) && (
        <div className={cardCls}>
          <h3 className={`mb-4 text-[15px] font-bold ${T.h}`}>სისწრაფე და ფეხი</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {hasSpeed && (
              <div className="space-y-4">
                {p.sprint10m != null && (
                  <div className="flex items-baseline justify-between">
                    <span className={`text-[13px] ${T.t2}`}>სპრინტი 10მ</span>
                    <span className={`font-mono text-[15px] font-semibold ${T.h}`}>{p.sprint10m}წმ <span className={`text-[12px] font-normal ${T.muted}`}>≈ {kmh(10, p.sprint10m)} კმ/სთ</span></span>
                  </div>
                )}
                {p.sprint30m != null && (
                  <div className="flex items-baseline justify-between">
                    <span className={`text-[13px] ${T.t2}`}>სპრინტი 30მ</span>
                    <span className={`font-mono text-[15px] font-semibold ${T.h}`}>{p.sprint30m}წმ <span className={`text-[12px] font-normal ${T.muted}`}>≈ {kmh(30, p.sprint30m)} კმ/სთ</span></span>
                  </div>
                )}
              </div>
            )}
            {hasFoot && (
              <div className="space-y-3">
                {p.preferredFoot && (
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] ${T.t2}`}>უპირატესი ფეხი</span>
                    <span className={`text-[13.5px] font-semibold ${T.h}`}>{p.preferredFoot}</span>
                  </div>
                )}
                {p.rightFootPct != null && <Bar label="მარჯვენა" value={p.rightFootPct} />}
                {p.leftFootPct != null && <Bar label="მარცხენა" value={p.leftFootPct} />}
              </div>
            )}
          </div>
        </div>
      )}

      {p.skills.length > 0 && (
        <div className={cardCls}>
          <h3 className={`mb-4 text-[15px] font-bold ${T.h}`}>დამატებითი პოზიციები</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {p.skills.map((s) => (
              <Bar key={s.position} label={s.position} value={s.percentage} />
            ))}
          </div>
        </div>
      )}

      {hasTeam && (
        <div className={cardCls}>
          <h3 className={`mb-4 text-[15px] font-bold ${T.h}`}>გუნდი და კონტრაქტი</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {p.currentTeam && <Cell l="მიმდინარე გუნდი" v={p.currentTeam} />}
            {p.activeSeason && <Cell l="აქტიური სეზონი" v={p.activeSeason} />}
            {p.contractStart && <Cell l="კონტრაქტი დან" v={p.contractStart} />}
            {p.contractEnd && <Cell l="ვადა" v={p.contractEnd} />}
          </div>
        </div>
      )}

      {p.career.length > 0 && (
        <div className={cardCls}>
          <h3 className={`mb-4 text-[15px] font-bold ${T.h}`}>კარიერა</h3>
          <div className="space-y-2">
            {p.career.map((c, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-card border px-4 py-3 ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-ink-50"}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-btn font-display text-[13px] font-bold ${T.square}`}>{c.teamName.slice(0, 2)}</span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-[14px] font-semibold ${T.h}`}>{c.teamName}</div>
                  <div className={`text-[12px] ${T.muted}`}>{c.years}{c.position ? ` · ${c.position}` : ""}</div>
                </div>
                {c.jerseyNumber != null && <span className={`font-mono text-[15px] font-bold tabular-nums ${T.brand}`}>#{c.jerseyNumber}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {p.matchLinks.length > 0 && (
        <div className={cardCls}>
          <h3 className={`mb-4 text-[15px] font-bold ${T.h}`}>თამაშების ბმულები</h3>
          <div className="space-y-2">
            {p.matchLinks.map((m, i) => (
              <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 rounded-card border px-4 py-3 transition-colors ${dark ? "border-ink-800 bg-ink-950 hover:border-ink-600" : "border-ink-200 bg-ink-50 hover:border-ink-300"}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-btn bg-brand-500/15 ${T.brand2}`}>{Ic.play("h-4 w-4")}</span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-[13.5px] font-medium ${T.t1}`}>{m.opponent ? `vs ${m.opponent}` : m.url}</div>
                  <div className={`text-[12px] ${T.muted}`}>{[m.date, m.competition].filter(Boolean).join(" · ") || "ვიდეო"}</div>
                </div>
                <span className={T.muted}>{Ic.arrow("h-4 w-4")}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {hasDocs && (
        <div className={cardCls}>
          <h3 className={`mb-4 text-[15px] font-bold ${T.h}`}>დოკუმენტები</h3>
          <div className="space-y-3">
            {p.school && <Cell l="სასწავლებელი" v={p.school} />}
            <div className="flex flex-wrap gap-2">
              {p.gradesSheetUrl && <DocLink url={p.gradesSheetUrl} label="ნიშნების ფურცელი" />}
              {p.contractDocUrl && <DocLink url={p.contractDocUrl} label="კონტრაქტი" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function Cell({ l, v }: { l: string; v: string }) {
    return (
      <div className={`border-l pl-3 ${T.border}`}>
        <div className={`text-[12px] uppercase tracking-wide ${T.muted}`}>{l}</div>
        <div className={`mt-0.5 text-[14px] font-semibold ${T.h}`}>{v}</div>
      </div>
    );
  }

  function DocLink({ url, label }: { url: string; label: string }) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-btn border px-3.5 py-2 text-[13px] font-medium transition-colors ${dark ? "border-ink-700 text-ink-100 hover:bg-ink-800" : "border-ink-200 text-ink-800 hover:bg-ink-100"}`}>
        {Ic.eye("h-4 w-4")} {label}
      </a>
    );
  }
}
