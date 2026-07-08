"use client";

import { useState } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { InitialsAvatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";

export type PlayerDetailDTO = {
  name: string;
  email: string;
  position: string;
  ageGroup: string;
  age: number;
  city: string;
  level: string;
  league: string;
  heightCm: number | null;
  weightKg: number | null;
  completeness: number;
  registered: string;
  apps: { id: string; club: string; badge: string; ct: string; trial: string; date: string; status: string }[];
  media: { id: string; url: string; type: "VIDEO" | "PHOTO" }[];
};

export function AdminPlayerDetail({ player: p }: { player: PlayerDetailDTO }) {
  const dark = useDark();
  const T = useT();
  const [suspended, setSuspended] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const tone = (t: string) => {
    const m: Record<string, string> = {
      brand: dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700",
      accent: dark ? "bg-accent-500/15 text-accent-300" : "bg-accent-500/15 text-accent-700",
      iris: dark ? "bg-iris-500/15 text-iris-300" : "bg-iris-500/15 text-iris-700",
      flame: dark ? "bg-flame-500/15 text-flame-300" : "bg-flame-500/15 text-flame-700",
    };
    return m[t] ?? T.square;
  };
  const appStatus = (s: string) => {
    const m: Record<string, string> = {
      "გაგზავნილი": dark ? "bg-accent-500/12 text-accent-300 border-accent-500/25" : "bg-accent-500/12 text-accent-700 border-accent-500/25",
      "გასული": dark ? "bg-ink-800 text-ink-400 border-ink-700" : "bg-ink-100 text-ink-500 border-ink-200",
    };
    return m[s] ?? m["გასული"];
  };

  const attrs: [string, string][] = [
    ["ამპლუა", p.position],
    ["ასაკი", String(p.age)],
    ["ქალაქი", p.city],
    ["დონე", p.level],
    ["სიმაღლე", p.heightCm ? `${p.heightCm} სმ` : "—"],
    ["წონა", p.weightKg ? `${p.weightKg} კგ` : "—"],
  ];
  const invited = 0;

  return (
    <div>
      <Link href="/admin/players" className={`mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>{Ic.arrowLeft("h-4 w-4")} მოთამაშეებზე დაბრუნება</Link>

      {/* Hero */}
      <div className={`mb-6 flex flex-wrap items-center gap-6 rounded-card border p-6 ${T.card}`}>
        <InitialsAvatar name={p.name} size={72} rounded="card" className={suspended ? "opacity-60" : ""} />
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className={`font-display text-[24px] font-extrabold tracking-tight ${T.h}`}>{p.name}</h1>
            {suspended
              ? <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${dark ? "bg-danger-500/12 text-danger-300 border-danger-500/25" : "bg-danger-500/12 text-danger-600 border-danger-500/25"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />შეჩერებული</span>
              : <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${dark ? "bg-brand-500/12 text-brand-300 border-brand-500/25" : "bg-brand-500/12 text-brand-700 border-brand-500/25"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />აქტიური</span>}
          </div>
          <div className={`mt-1.5 flex flex-wrap items-center gap-2 text-[13px] ${T.muted}`}>
            <span className={`rounded-pill bg-brand-500/12 px-2.5 py-0.5 text-[12px] font-medium ${T.brand2}`}>{p.position}</span>
            <span className="inline-flex items-center gap-1">{Ic.pin("h-3.5 w-3.5")}{p.city}</span><span className={T.dot}>·</span><span>{p.age} წლის</span><span className={T.dot}>·</span><span>{p.level}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`mailto:${p.email}`} className={`inline-flex h-10 items-center gap-2 rounded-btn border px-4 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>{Ic.mail("h-4 w-4")} შეტყობინება</a>
          {suspended
            ? <button type="button" onClick={() => setSuspended(false)} className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.check("h-4 w-4")} გააქტიურება</button>
            : <button type="button" onClick={() => setConfirm(true)} className={`inline-flex h-10 items-center gap-2 rounded-btn border px-4 text-sm font-medium transition-colors ${dark ? "border-danger-500/30 text-danger-300 hover:bg-danger-500/15" : "border-danger-500/30 text-danger-600 hover:bg-danger-500/15"}`}>{Ic.close("h-4 w-4")} შეჩერება</button>}
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {([["განაცხადი", String(p.apps.length), false], ["მოწვევა", String(invited), true], ["პროფილი", `${p.completeness}%`, false], ["რეგისტრ.", p.registered, false]] as [string, string, boolean][]).map(([l, v, acc]) => (
          <div key={l} className={`rounded-card border p-5 ${T.card}`}>
            <div className={`text-[12px] font-medium uppercase tracking-wide ${T.muted}`}>{l}</div>
            <div className={`mt-2 font-mono text-[24px] font-bold tabular-nums ${acc ? T.brand : T.h}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className={`rounded-card border p-6 ${T.card}`}>
            <h2 className={`mb-4 text-[15px] font-bold ${T.h}`}>მახასიათებლები</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {attrs.map(([l, v]) => (
                <div key={l} className={`border-l pl-3 ${T.border}`}><div className={`text-[12px] uppercase tracking-wide ${T.muted}`}>{l}</div><div className={`mt-0.5 text-[15px] font-semibold ${T.h}`}>{v}</div></div>
              ))}
            </div>
          </div>

          <div className={`rounded-card border ${T.card}`}>
            <div className={`flex items-center justify-between border-b px-5 py-4 ${T.border}`}>
              <h2 className={`text-[15px] font-bold ${T.h}`}>განაცხადების ისტორია</h2>
              <span className={`text-[12.5px] ${T.muted}`}><span className="tabular-nums">{p.apps.length}</span> სულ</span>
            </div>
            {p.apps.map((a) => (
              <div key={a.id} className={`flex items-center gap-3 border-b px-5 py-3.5 last:border-0 transition-colors ${T.rowBorder} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-btn font-display text-[12px] font-bold ${tone(a.ct)}`}>{a.badge}</div>
                <div className="min-w-0 flex-1"><div className={`truncate text-[14px] font-medium ${T.h}`}>{a.club}</div><div className={`truncate text-[12px] ${T.muted}`}>{a.trial} · {a.date}</div></div>
                <span className={`inline-flex items-center whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${appStatus(a.status)}`}>{a.status}</span>
              </div>
            ))}
            {p.apps.length === 0 && <div className={`px-5 py-10 text-center text-[13px] ${T.faint}`}>განაცხადი ჯერ არ გაუგზავნია.</div>}
          </div>

          {p.media.length > 0 && (
            <div className={`rounded-card border p-6 ${T.card}`}>
              <h2 className={`mb-4 text-[15px] font-bold ${T.h}`}>ვიდეო-მასალა</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {p.media.map((m) => (
                  <div key={m.id} className={`group relative aspect-video overflow-hidden rounded-card border ${T.border}`}>
                    {m.type === "VIDEO" ? <video src={m.url} className="h-full w-full object-cover" /> : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="h-full w-full object-cover" />
                    )}
                    <span className="absolute inset-0 grid place-items-center"><span className="grid h-8 w-8 place-items-center rounded-full bg-ink-950/70 text-ink-50">{m.type === "VIDEO" ? Ic.play("h-4 w-4") : Ic.image("h-4 w-4")}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className={`rounded-card border p-5 ${T.card}`}>
            <h3 className={`mb-4 text-[14px] font-semibold ${T.h}`}>ანგარიშის ინფო</h3>
            <div className="space-y-3.5 text-[13px]">
              {[["ელ. ფოსტა", p.email], ["რეგისტრაცია", p.registered], ["ლიგა", p.league], ["ასაკ. ჯგუფი", p.ageGroup]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between gap-3"><span className={T.muted}>{l}</span><span className={`truncate text-right font-medium ${T.t2}`}>{v}</span></div>
              ))}
            </div>
          </div>

          <div className={`rounded-card border p-5 ${T.card}`}>
            <h3 className={`mb-3 text-[14px] font-semibold ${T.h}`}>მოდერაცია</h3>
            <div className={`flex items-start gap-2.5 rounded-card border p-3 ${dark ? "border-brand-500/25 bg-brand-500/8 text-brand-200" : "border-brand-500/25 bg-brand-500/8 text-brand-700"}`}>
              <span className="mt-0.5">{Ic.check("h-4 w-4")}</span>
              <span className="text-[12.5px]">რეპორტები არ არის. პროფილი სუფთაა.</span>
            </div>
          </div>
        </aside>
      </div>

      {confirm && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${T.overlay}`} onClick={() => setConfirm(false)}>
          <div className={`w-full max-w-sm rounded-card border p-6 shadow-float ${T.card}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-btn ${dark ? "bg-danger-500/15 text-danger-300" : "bg-danger-500/15 text-danger-600"}`}>{Ic.close("h-5 w-5")}</div>
                <h3 className={`text-[16px] font-bold ${T.h}`}>ანგარიშის შეჩერება</h3>
              </div>
              <button type="button" onClick={() => setConfirm(false)} className={`rounded-btn p-1.5 ${T.iconBtnFlat}`}>{Ic.close("h-5 w-5")}</button>
            </div>
            <p className={`text-[14px] leading-relaxed ${T.muted}`}>{p.name}-ის პროფილი დაიმალება კლუბებთან და ვეღარ შეძლებს ახალი განაცხადის გაგზავნას.</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setConfirm(false)} className={`flex-1 rounded-btn border py-2.5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>გაუქმება</button>
              <button type="button" onClick={() => { setSuspended(true); setConfirm(false); }} className="flex-1 rounded-btn bg-danger-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger-400">შეჩერება</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
