"use client";

import { useState } from "react";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";

type Report = {
  id: string;
  type: string;
  subject: string;
  reason: string;
  detail: string;
  by: string;
  ago: string;
  tone: "warning" | "danger";
};

export function AdminModerationContent() {
  const dark = useDark();
  const T = useT();
  const [tab, setTab] = useState("მოლოდინში");
  const [resolved, setResolved] = useState<string[]>([]);

  // No backend reports yet.
  const reports: Report[] = [];
  const pending = reports.filter((r) => !resolved.includes(r.id));
  const list = tab === "მოლოდინში" ? pending : reports.filter((r) => resolved.includes(r.id));

  return (
    <div>
      <div className={`mb-6 flex gap-1 border-b ${T.border}`}>
        {[["მოლოდინში", pending.length], ["გადაწყვეტილი", resolved.length]].map(([t, cnt]) => (
          <button key={t} type="button" onClick={() => setTab(t as string)} className={`relative flex items-center gap-2 px-4 py-3 text-[14px] font-medium transition-colors ${tab === t ? T.h : T.navIdle}`}>
            {t}<span className={`rounded-pill px-1.5 py-0.5 font-mono text-[11px] tabular-nums ${tab === t ? (dark ? "bg-ink-800 text-ink-200" : "bg-ink-100 text-ink-700") : dark ? "bg-ink-900 text-ink-500" : "bg-ink-100 text-ink-400"}`}>{cnt}</span>
            {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-pill bg-brand-400" />}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-3xl space-y-4">
        {list.length === 0 && (
          <div className={`grid place-items-center rounded-card border border-dashed px-6 py-16 text-center ${dark ? "border-ink-700" : "border-ink-300"}`}>
            <div className={`mb-3 grid h-12 w-12 place-items-center rounded-full ${dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700"}`}>{Ic.check("h-6 w-6")}</div>
            <div className={`text-[14px] font-semibold ${T.t1}`}>{tab === "მოლოდინში" ? "ყველა რეპორტი დამუშავებულია" : "ჯერ არაფერი გადაწყვეტილა"}</div>
            <p className={`mt-1 text-[13px] ${T.muted}`}>{tab === "მოლოდინში" ? "ახალი რეპორტები აქ გამოჩნდება." : "დამუშავებული რეპორტები აქ დაგროვდება."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
