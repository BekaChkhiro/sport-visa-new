"use client";

import { useState } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { MatchRing, InitialsAvatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";

export type ApplicantDTO = {
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
  bio: string | null;
  score: number;
  trialTitle: string;
  appliedDate: string;
  media: { id: string; url: string; type: "VIDEO" | "PHOTO" }[];
  weights: { l: string; v: number; pct: number }[];
};

export function ClubApplicantDetail({ applicant: a }: { applicant: ApplicantDTO }) {
  const dark = useDark();
  const T = useT();
  const [status, setStatus] = useState<"ნანახი" | "მოწვეული" | "უარყოფილი">("ნანახი");
  const [reject, setReject] = useState(false);
  const [notes, setNotes] = useState("");

  const statusBadge = status === "მოწვეული"
    ? (dark ? "bg-brand-500/12 text-brand-300 border-brand-500/25" : "bg-brand-500/12 text-brand-700 border-brand-500/25")
    : status === "უარყოფილი"
      ? (dark ? "bg-danger-500/12 text-danger-300 border-danger-500/25" : "bg-danger-500/12 text-danger-600 border-danger-500/25")
      : (dark ? "bg-accent-500/12 text-accent-300 border-accent-500/25" : "bg-accent-500/12 text-accent-700 border-accent-500/25");

  const attrs: [string, string][] = [
    ["ამპლუა", a.position],
    ["ასაკი", String(a.age)],
    ["ასაკ. ჯგუფი", a.ageGroup],
    ["სიმაღლე", a.heightCm ? `${a.heightCm} სმ` : "—"],
    ["წონა", a.weightKg ? `${a.weightKg} კგ` : "—"],
    ["დონე", a.level],
  ];

  return (
    <div>
      <Link href="/club/applicants" className={`mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>{Ic.arrowLeft("h-4 w-4")} აპლიკანტებზე დაბრუნება</Link>

      {/* Hero */}
      <div className={`mb-6 flex flex-wrap items-center gap-6 rounded-card border p-6 ${T.card}`}>
        <InitialsAvatar name={a.name} size={80} rounded="card" />
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className={`font-display text-[24px] font-extrabold tracking-tight ${T.h}`}>{a.name}</h1>
            <span className={`inline-flex items-center whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge}`}>{status}</span>
          </div>
          <div className={`mt-1.5 flex flex-wrap items-center gap-2 text-[13px] ${T.muted}`}>
            <span className={`rounded-pill bg-brand-500/12 px-2.5 py-0.5 text-[12px] font-medium ${T.brand2}`}>{a.position}</span>
            <span className={`rounded-pill bg-accent-500/12 px-2.5 py-0.5 text-[12px] font-medium ${dark ? "text-accent-300" : "text-accent-700"}`}>{a.ageGroup}</span>
            <span className="inline-flex items-center gap-1">{Ic.pin("h-3.5 w-3.5")}{a.city}</span>
            <span className={T.dot}>·</span><span>{a.age} წლის</span>
          </div>
        </div>
        <MatchRing score={a.score} size={84} />
        <div className="flex flex-col gap-2">
          {status === "მოწვეული" ? (
            <button type="button" disabled className={`inline-flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-btn border px-5 text-sm font-medium ${dark ? "border-ink-700 bg-ink-800 text-ink-200" : "border-ink-200 bg-ink-100 text-ink-700"}`}>{Ic.check("h-4 w-4")} მიწვეულია სინჯზე</button>
          ) : (
            <button type="button" onClick={() => setStatus("მოწვეული")} className="inline-flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.check("h-4 w-4")} სინჯზე მოწვევა</button>
          )}
          <div className="flex gap-2">
            <a href={`mailto:${a.email}`} className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-btn border text-[13px] font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>{Ic.mail("h-4 w-4")} შეტყობინება</a>
            <button type="button" onClick={() => setReject(true)} className={`grid h-10 w-10 place-items-center rounded-btn border transition-colors ${dark ? "border-danger-500/30 text-danger-300 hover:bg-danger-500/15" : "border-danger-500/30 text-danger-600 hover:bg-danger-500/15"}`}>{Ic.close("h-4 w-4")}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left */}
        <div className="space-y-6">
          <div className={`rounded-card border p-6 ${T.card}`}>
            <h2 className={`mb-4 text-[15px] font-bold ${T.h}`}>მახასიათებლები</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {attrs.map(([l, v]) => (
                <div key={l} className={`border-l pl-3 ${T.border}`}>
                  <div className={`text-[12px] uppercase tracking-wide ${T.muted}`}>{l}</div>
                  <div className={`mt-0.5 text-[15px] font-semibold ${T.h}`}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {a.media.length > 0 && (
            <div className={`rounded-card border p-6 ${T.card}`}>
              <h2 className={`mb-4 text-[15px] font-bold ${T.h}`}>ვიდეო-ჰაილაითები</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {a.media.map((m) => (
                  <div key={m.id} className={`group relative aspect-[3/4] overflow-hidden rounded-card border ${T.border}`}>
                    {m.type === "VIDEO" ? <video src={m.url} className="h-full w-full object-cover" /> : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                    <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink-950/70 text-ink-50 backdrop-blur">{m.type === "VIDEO" ? Ic.play("h-4 w-4") : Ic.image("h-4 w-4")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-card border p-6 ${T.card}`}>
            <h2 className={`mb-2 text-[15px] font-bold ${T.h}`}>ჩემ შესახებ</h2>
            <p className={`text-[14px] leading-relaxed ${T.t3}`}>{a.bio || "ბიოგრაფია არ არის მითითებული."}</p>
          </div>
        </div>

        {/* Right */}
        <aside className="space-y-6">
          <div className={`rounded-card border p-5 ${T.card}`}>
            <div className={`mb-3 text-[14px] font-semibold ${T.h}`}>თავსებადობის დაშლა</div>
            <div className="space-y-2.5">
              {a.weights.map((w) => (
                <div key={w.l}>
                  <div className="mb-1 flex items-center justify-between text-[12px]"><span className={T.t3}>{w.l}</span><span className={`font-mono tabular-nums ${T.muted}`}>+{w.v}</span></div>
                  <div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400/70" style={{ width: `${w.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-card border p-5 ${T.card}`}>
            <div className={`mb-3 text-[14px] font-semibold ${T.h}`}>განაცხადის დეტალები</div>
            <div className="space-y-3 text-[13px]">
              {[["სინჯი", a.trialTitle], ["გაგზავნის თარიღი", a.appliedDate], ["სტატუსი", status], ["ქალაქი", a.city]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between gap-3"><span className={T.muted}>{l}</span><span className={`text-right font-medium ${T.t2}`}>{v}</span></div>
              ))}
            </div>
          </div>

          <div className={`rounded-card border p-5 ${T.card}`}>
            <div className={`mb-2 text-[14px] font-semibold ${T.h}`}>შიდა შენიშვნები</div>
            <p className={`mb-2.5 text-[11.5px] ${T.faint}`}>ხედავს მხოლოდ კლუბის გუნდი</p>
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="დაამატე შენიშვნა ამ აპლიკანტზე..." className={`w-full rounded-field border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`} />
          </div>
        </aside>
      </div>

      {reject && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${T.overlay}`} onClick={() => setReject(false)}>
          <div className={`w-full max-w-sm rounded-card border p-6 shadow-float ${T.card}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-btn ${dark ? "bg-danger-500/15 text-danger-300" : "bg-danger-500/15 text-danger-600"}`}>{Ic.close("h-5 w-5")}</div>
                <h3 className={`text-[16px] font-bold ${T.h}`}>აპლიკანტის უარყოფა</h3>
              </div>
              <button type="button" onClick={() => setReject(false)} className={`rounded-btn p-1.5 ${T.iconBtnFlat}`}>{Ic.close("h-5 w-5")}</button>
            </div>
            <p className={`text-[14px] leading-relaxed ${T.muted}`}>{a.name} მოინიშნება უარყოფილად ამ სინჯისთვის.</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setReject(false)} className={`flex-1 rounded-btn border py-2.5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>გაუქმება</button>
              <button type="button" onClick={() => { setStatus("უარყოფილი"); setReject(false); }} className="flex-1 rounded-btn bg-danger-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger-400">უარყოფა</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
