"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { Logo, ThemeToggle, MatchRing } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { ageGroupFromBirthDate, ageGroupLabels } from "@/lib/labels";
import {
  submitOnboarding,
  type MatchRevealDTO,
  type OnboardingInput,
} from "@/app/actions/player";

type Pos = "GK" | "DF" | "MF" | "FW";
type Lvl = "BEGINNER" | "AMATEUR" | "SEMI_PRO" | "PRO";

const STEPS = ["ვინ ხარ", "პოზიცია", "დონე", "მასალა"];
const POSITIONS: { v: Pos; l: string }[] = [
  { v: "GK", l: "მეკარე" },
  { v: "DF", l: "მცველი" },
  { v: "MF", l: "ნახევარმცველი" },
  { v: "FW", l: "თავდამსხმელი" },
];
const FEET = ["მარჯვენა", "მარცხენა", "ორივე"];
const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი"];
const LEVELS: { v: Lvl; l: string }[] = [
  { v: "AMATEUR", l: "მოყვარული" },
  { v: "SEMI_PRO", l: "ნახევრადპროფესიონალი" },
  { v: "PRO", l: "პროფესიონალი" },
];

type Defaults = {
  firstName: string;
  lastName: string;
  birthDate: string;
  position?: Pos;
  city?: string;
  level?: Lvl;
  currentLeague?: string;
};

export function OnboardingScreen({ defaults }: { defaults: Defaults }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [matches, setMatches] = useState<MatchRevealDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(defaults.firstName);
  const [lastName, setLastName] = useState(defaults.lastName);
  const [birthDate, setBirthDate] = useState(defaults.birthDate);
  const [pos, setPos] = useState<Pos>(defaults.position ?? "FW");
  const [foot, setFoot] = useState("მარჯვენა");
  const [city, setCity] = useState(defaults.city ?? "თბილისი");
  const [level, setLevel] = useState<Lvl>(defaults.level ?? "SEMI_PRO");
  const [league, setLeague] = useState(defaults.currentLeague ?? "");
  const [media, setMedia] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const T_pct = Math.round(((step + 1) / STEPS.length) * 100);
  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;
  const posLabel = POSITIONS.find((p) => p.v === pos)?.l ?? "";
  const levelLabel = LEVELS.find((l) => l.v === level)?.l ?? "";
  const ageGroup = birthDate ? ageGroupLabels[ageGroupFromBirthDate(new Date(birthDate))] : null;

  function next() {
    setError(null);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    // finish → submit
    const input: OnboardingInput = {
      firstName,
      lastName,
      birthDate,
      position: pos,
      city,
      level,
      currentLeague: league,
      media,
    };
    startTransition(async () => {
      const res = await submitOnboarding(input);
      if (res.error) {
        setError(res.error);
      } else {
        setMatches(res.matches ?? []);
        setDone(true);
      }
    });
  }

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <div className="mx-auto grid min-h-screen max-w-[1080px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[300px_1fr]">
        {/* Left rail */}
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <div className="flex items-center justify-between">
            <Logo size={28} />
            <ThemeToggle />
          </div>
          <h1 className={`mt-8 font-display text-[26px] font-extrabold leading-tight tracking-tight ${T.h}`}>
            {done ? "პროფილი მზადაა." : "ავაწყოთ შენი პროფილი"}
          </h1>
          <p className={`mt-2 text-[14px] leading-relaxed ${T.muted}`}>
            {done ? "შენს მონაცემებზე დაყრდნობით უკვე ვიპოვეთ მორგებული კლუბები." : "რაც უფრო სრულია პროფილი, მით უფრო ზუსტია თავსებადობა."}
          </p>

          <div className="mt-8 space-y-1">
            {STEPS.map((s, i) => {
              const state = done || i < step ? "done" : i === step ? "active" : "todo";
              return (
                <div key={s} className="flex items-center gap-3 rounded-btn px-2 py-2">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-[13px] font-semibold ${state === "done" ? "bg-brand-400 text-ink-950" : state === "active" ? `border border-brand-400 ${T.brand2}` : `border ${dark ? "border-ink-700 text-ink-500" : "border-ink-300 text-ink-400"}`}`}>
                    {state === "done" ? Ic.check("h-4 w-4") : i + 1}
                  </span>
                  <span className={`text-[14px] font-medium ${state === "todo" ? T.faint : T.t1}`}>{s}</span>
                </div>
              );
            })}
          </div>

          {!done && (
            <div className="mt-8">
              <div className={`mb-1.5 flex items-center justify-between text-[12px] ${T.muted}`}>
                <span>შევსება</span><span className={`font-mono tabular-nums ${T.brand}`}>{T_pct}%</span>
              </div>
              <div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400 transition-all" style={{ width: `${T_pct}%` }} /></div>
            </div>
          )}
        </aside>

        {/* Right content */}
        <div className={`rounded-card border p-8 ${T.soft}`}>
          {!done ? (
            <>
              {step === 0 && (
                <div className="space-y-5">
                  <StepHead n="01" title="ვინ ხარ" desc="ეს გამოჩნდება კლუბებთან შენს პროფილში." />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>სახელი</span><input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="გიორგი" /></label>
                    <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>გვარი</span><input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="მაისურაძე" /></label>
                  </div>
                  <label className="block">
                    <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>დაბადების თარიღი</span>
                    <input type="date" className={inputCls} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                    {ageGroup && <span className={`mt-2 inline-flex items-center gap-1.5 rounded-pill border border-brand-500/25 bg-brand-500/10 px-2.5 py-0.5 text-[12px] font-medium ${T.brand2}`}>ასაკობრივი ჯგუფი: {ageGroup}</span>}
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <StepHead n="02" title="შენი პოზიცია" desc="აირჩიე ძირითადი პოზიცია მოედანზე." />
                  <div className="grid grid-cols-2 gap-3">
                    {POSITIONS.map((p) => (
                      <button key={p.v} type="button" onClick={() => setPos(p.v)} className={`flex items-center justify-between rounded-card border px-4 py-3.5 text-left transition-colors ${pos === p.v ? "border-brand-400 bg-brand-500/12" : dark ? "border-ink-700 hover:border-ink-600" : "border-ink-200 hover:border-ink-300"}`}>
                        <span className={`text-[15px] font-medium ${pos === p.v ? T.brand2 : T.t1}`}>{p.l}</span>
                        {pos === p.v && <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-3 w-3")}</span>}
                      </button>
                    ))}
                  </div>
                  <div>
                    <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>უპირატესი ფეხი</span>
                    <div className={`inline-flex rounded-pill border p-1 ${dark ? "border-ink-700 bg-ink-900" : "border-ink-200 bg-white"}`}>
                      {FEET.map((f) => (
                        <button key={f} type="button" onClick={() => setFoot(f)} className={`rounded-pill px-4 py-1.5 text-[13px] font-medium transition-colors ${foot === f ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <StepHead n="03" title="დონე და ლიგა" desc="სად და რა დონეზე თამაშობ ამჟამად." />
                  <label className="block">
                    <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ქალაქი</span>
                    <div className="relative">
                      <select value={city} onChange={(e) => setCity(e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                        {CITIES.map((c) => <option key={c} className={dark ? "bg-ink-900" : "bg-white"}>{c}</option>)}
                      </select>
                      <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${T.muted}`}>{Ic.chevronDown("h-4 w-4")}</span>
                    </div>
                  </label>
                  <div>
                    <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>დონე</span>
                    <div className="grid grid-cols-3 gap-2">
                      {LEVELS.map((l) => (
                        <button key={l.v} type="button" onClick={() => setLevel(l.v)} className={`rounded-card border px-3 py-3 text-[13px] font-medium transition-colors ${level === l.v ? `border-brand-400 bg-brand-500/12 ${T.brand2}` : `${dark ? "border-ink-700 hover:border-ink-600" : "border-ink-200 hover:border-ink-300"} ${T.t3}`}`}>{l.l}</button>
                      ))}
                    </div>
                  </div>
                  <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>მიმდინარე ლიგა / გუნდი</span><input className={inputCls} value={league} onChange={(e) => setLeague(e.target.value)} placeholder="თბილისის რეგიონული ლიგა" /></label>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <StepHead n="04" title="ვიდეო-მასალა" desc="დაამატე highlight-ების ბმული — კლუბებს გაუადვილებ გადაწყვეტილებას. (არასავალდებულო)" />
                  <div className="flex gap-2">
                    <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                    <button type="button" onClick={() => { if (draft.trim()) { setMedia([...media, draft.trim()]); setDraft(""); } }} className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-btn px-4 text-sm font-medium transition-colors ${dark ? "bg-ink-800 text-ink-100 hover:bg-ink-700" : "bg-ink-100 text-ink-800 hover:bg-ink-200"}`}>{Ic.plus("h-4 w-4")} დამატება</button>
                  </div>
                  <div className="space-y-2">
                    {media.map((m, i) => (
                      <div key={i} className={`flex items-center gap-3 rounded-card border px-4 py-3 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-ink-50"}`}>
                        <span className={`grid h-9 w-9 place-items-center rounded-btn bg-brand-500/15 ${T.brand2}`}>{Ic.video("h-4 w-4")}</span>
                        <span className={`flex-1 truncate text-[13.5px] ${T.t2}`}>{m}</span>
                        <button type="button" onClick={() => setMedia(media.filter((_, j) => j !== i))} className={`rounded-btn p-1.5 ${T.faint} ${T.hoverBg}`}>{Ic.close("h-4 w-4")}</button>
                      </div>
                    ))}
                    {media.length === 0 && <p className={`rounded-card border border-dashed px-4 py-6 text-center text-[13px] ${dark ? "border-ink-700 text-ink-500" : "border-ink-300 text-ink-400"}`}>მასალა ჯერ არ დამატებულა — ამის გამოტოვება შესაძლებელია.</p>}
                  </div>
                </div>
              )}

              {error && <div className="mt-5 rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-[13px] text-danger-300">{error}</div>}

              <div className={`mt-8 flex items-center justify-between border-t pt-6 ${T.border}`}>
                <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={`inline-flex items-center gap-1.5 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors ${T.t3} ${T.hoverBg} disabled:opacity-30 disabled:pointer-events-none`}>{Ic.arrowLeft("h-4 w-4")} უკან</button>
                <button type="button" onClick={next} disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-btn bg-brand-400 px-6 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 disabled:opacity-50">
                  {pending ? "ინახება..." : step === STEPS.length - 1 ? "პროფილის დასრულება" : "გაგრძელება"} {Ic.arrow("h-4 w-4")}
                </button>
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-btn bg-brand-500/15 ${T.brand2}`}>{Ic.bolt("h-5 w-5")}</span>
                <div>
                  <h2 className={`text-[19px] font-bold ${T.h}`}>{matches.length} კლუბი შენს პროფილს ერგება</h2>
                  <p className={`text-[13.5px] ${T.muted}`}>{posLabel} · {city} · {levelLabel}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {matches.map((m) => (
                  <div key={m.club} className={`flex items-center gap-4 rounded-card border p-4 transition-colors ${T.card} ${dark ? "hover:border-ink-600" : "hover:border-ink-300"}`}>
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-btn font-display text-[14px] font-bold ${T.square}`}>{m.badge}</div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[15px] font-bold ${T.h}`}>{m.club}</div>
                      <div className={`text-[12.5px] ${T.muted}`}>{m.league} · ღია სინჯი</div>
                    </div>
                    <MatchRing score={m.score} size={56} />
                  </div>
                ))}
                {matches.length === 0 && (
                  <p className={`rounded-card border border-dashed px-4 py-6 text-center text-[13px] ${dark ? "border-ink-700 text-ink-400" : "border-ink-300 text-ink-500"}`}>ამჟამად ღია სინჯები არ არის — შემოიარე მოგვიანებით.</p>
                )}
              </div>
              <button type="button" onClick={() => router.push("/dashboard")} className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-400 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500">
                გადადი დეშბორდზე {Ic.arrow("h-4 w-4")}
              </button>
              <Link href="/profile" className={`mt-2 block w-full rounded-btn py-2.5 text-center text-[13px] font-medium transition-colors ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>პროფილის რედაქტირება</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function StepHead({ n, title, desc }: { n: string; title: string; desc: string }) {
    return (
      <div>
        <div className="mb-1 flex items-center gap-2.5">
          <span className={`font-mono text-[13px] font-bold ${T.brand}`}>{n}</span>
          <h2 className={`text-[20px] font-bold ${T.h}`}>{title}</h2>
        </div>
        <p className={`text-[13.5px] leading-relaxed ${T.muted}`}>{desc}</p>
      </div>
    );
  }
}
