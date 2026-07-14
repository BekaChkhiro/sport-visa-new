"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { Logo, ThemeToggle, MatchRing } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { FileUpload } from "@/components/ui/FileUpload";
import { FField, FSelect, FSlider } from "@/components/ui/form";
import { ageGroupFromBirthDate, ageGroupLabels } from "@/lib/labels";
import {
  submitOnboarding,
  type MatchRevealDTO,
  type OnboardingInput,
  type CareerInput,
  type MatchLinkInput,
} from "@/app/actions/player";

type Pos = "GK" | "DF" | "MF" | "FW";
type Lvl = "BEGINNER" | "AMATEUR" | "SEMI_PRO" | "PRO";
type FootV = "RIGHT" | "LEFT" | "BOTH";

const STEPS = [
  "ვინ ხარ",
  "პოზიცია",
  "დონე & ლიგა",
  "ფიზიკური",
  "გუნდი & კონტრაქტი",
  "კარიერა & მედია",
];
// steps 0–2 are required core; 3–5 are skippable passport
const LAST_REQUIRED = 2;

const POSITIONS: { v: Pos; l: string }[] = [
  { v: "GK", l: "მეკარე" },
  { v: "DF", l: "მცველი" },
  { v: "MF", l: "ნახევარმცველი" },
  { v: "FW", l: "თავდამსხმელი" },
];
const FEET: { v: FootV; l: string }[] = [
  { v: "RIGHT", l: "მარჯვენა" },
  { v: "LEFT", l: "მარცხენა" },
  { v: "BOTH", l: "ორივე" },
];
const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი"];
const COUNTRIES = [
  "საქართველო", "უკრაინა", "სომხეთი", "აზერბაიჯანი", "თურქეთი", "რუსეთი",
  "ბრაზილია", "არგენტინა", "ესპანეთი", "საფრანგეთი", "გერმანია", "იტალია",
  "ინგლისი", "პორტუგალია", "ნიგერია", "განა", "სხვა",
];
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

const toNum = (s: string): number | null => {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const kmh = (meters: number, secs: number | null) =>
  secs && secs > 0 ? Math.round((meters / secs) * 3.6 * 10) / 10 : null;

export function OnboardingScreen({ defaults }: { defaults: Defaults }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [matches, setMatches] = useState<MatchRevealDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  // step 0 — identity
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(defaults.firstName);
  const [lastName, setLastName] = useState(defaults.lastName);
  const [birthDate, setBirthDate] = useState(defaults.birthDate);
  const [nationality, setNationality] = useState("საქართველო");

  // step 1 — position
  const [pos, setPos] = useState<Pos>(defaults.position ?? "FW");
  const [jersey, setJersey] = useState("");
  const [foot, setFoot] = useState<FootV>("RIGHT");
  const [rightPct, setRightPct] = useState(100);
  const [leftPct, setLeftPct] = useState(20);
  const [secSkills, setSecSkills] = useState<Record<string, number>>({});

  // step 2 — level & league
  const [city, setCity] = useState(defaults.city ?? "თბილისი");
  const [level, setLevel] = useState<Lvl>(defaults.level ?? "SEMI_PRO");
  const [league, setLeague] = useState(defaults.currentLeague ?? "");
  const [currentTeam, setCurrentTeam] = useState("");

  // step 3 — physical
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [sprint10, setSprint10] = useState("");
  const [sprint30, setSprint30] = useState("");

  // step 4 — team & contract
  const [activeSeason, setActiveSeason] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [contractDocUrl, setContractDocUrl] = useState<string | null>(null);
  const [school, setSchool] = useState("");
  const [gradesSheetUrl, setGradesSheetUrl] = useState<string | null>(null);

  // step 5 — career & media
  const [career, setCareer] = useState<CareerRow[]>([]);
  const [matchLinks, setMatchLinks] = useState<MatchRow[]>([]);
  const [media, setMedia] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const T_pct = Math.round(((step + 1) / STEPS.length) * 100);
  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;
  const posLabel = POSITIONS.find((p) => p.v === pos)?.l ?? "";
  const levelLabel = LEVELS.find((l) => l.v === level)?.l ?? "";
  const ageGroup = birthDate
    ? ageGroupLabels[ageGroupFromBirthDate(new Date(birthDate))]
    : null;

  function toggleSec(p: Pos) {
    setSecSkills((prev) => {
      const nextS = { ...prev };
      if (p in nextS) delete nextS[p];
      else nextS[p] = 70;
      return nextS;
    });
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (firstName.trim().length < 2) return "შეიყვანე სახელი";
      if (lastName.trim().length < 2) return "შეიყვანე გვარი";
      if (!birthDate) return "აირჩიე დაბადების თარიღი";
    }
    if (step === 2 && league.trim().length < 2) return "შეიყვანე ლიგა / გუნდი";
    return null;
  }

  function next() {
    const v = validateStep();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    submit();
  }

  function submit() {
    const input: OnboardingInput = {
      firstName,
      lastName,
      birthDate,
      position: pos,
      city,
      level,
      currentLeague: league,
      photoUrl,
      nationality,
      school: school || null,
      gradesSheetUrl,
      heightCm: toNum(heightCm),
      weightKg: toNum(weightKg),
      sprint10m: toNum(sprint10),
      sprint30m: toNum(sprint30),
      activeSeason: activeSeason || null,
      currentTeam: currentTeam || null,
      contractStart: contractStart || null,
      contractEnd: contractEnd || null,
      contractDocUrl,
      jerseyNumber: toNum(jersey),
      preferredFoot: foot,
      rightFootPct: rightPct,
      leftFootPct: leftPct,
      positionSkills: (Object.entries(secSkills) as [Pos, number][]).map(
        ([position, percentage]) => ({ position, percentage }),
      ),
      career: career
        .filter((c) => c.teamName.trim() && c.startYear.trim())
        .map<CareerInput>((c) => ({
          teamName: c.teamName.trim(),
          startYear: Number(c.startYear),
          endYear: toNum(c.endYear),
          position: (c.position || null) as Pos | null,
          jerseyNumber: toNum(c.jersey),
        })),
      matchLinks: matchLinks
        .filter((m) => m.url.trim())
        .map<MatchLinkInput>((m) => ({
          url: m.url.trim(),
          matchDate: m.matchDate || null,
          opponent: m.opponent || null,
          competition: m.competition || null,
        })),
      media,
    };
    startTransition(async () => {
      const res = await submitOnboarding(input);
      if (res.error) setError(res.error);
      else {
        setMatches(res.matches ?? []);
        setDone(true);
      }
    });
  }

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <div className="mx-auto grid min-h-screen max-w-[1100px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[300px_1fr]">
        {/* Left rail */}
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <div className="flex items-center justify-between">
            <Logo size={28} />
            <ThemeToggle />
          </div>
          <h1 className={`mt-8 font-display text-[26px] font-extrabold leading-tight tracking-tight ${T.h}`}>
            {done ? "პროფილი მზადაა." : "ავაწყოთ შენი პასპორტი"}
          </h1>
          <p className={`mt-2 text-[14px] leading-relaxed ${T.muted}`}>
            {done
              ? "შენს მონაცემებზე დაყრდნობით უკვე ვიპოვეთ მორგებული კლუბები."
              : "პირველი 3 ბიჯი სავალდებულოა — დანარჩენს ნებისმიერ დროს შეავსებ."}
          </p>

          <div className="mt-8 space-y-1">
            {STEPS.map((s, i) => {
              const state =
                done || i < step ? "done" : i === step ? "active" : "todo";
              return (
                <div key={s} className="flex items-center gap-3 rounded-btn px-2 py-2">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-[13px] font-semibold ${state === "done" ? "bg-brand-400 text-ink-950" : state === "active" ? `border border-brand-400 ${T.brand2}` : `border ${dark ? "border-ink-700 text-ink-500" : "border-ink-300 text-ink-400"}`}`}>
                    {state === "done" ? Ic.check("h-4 w-4") : i + 1}
                  </span>
                  <span className={`flex-1 text-[14px] font-medium ${state === "todo" ? T.faint : T.t1}`}>{s}</span>
                  {i > LAST_REQUIRED && !done && (
                    <span className={`text-[10px] font-medium uppercase ${T.faint}`}> არასავალდ.</span>
                  )}
                </div>
              );
            })}
          </div>

          {!done && (
            <div className="mt-8">
              <div className={`mb-1.5 flex items-center justify-between text-[12px] ${T.muted}`}>
                <span>შევსება</span>
                <span className={`font-mono tabular-nums ${T.brand}`}>{T_pct}%</span>
              </div>
              <div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}>
                <div className="h-full rounded-pill bg-brand-400 transition-all" style={{ width: `${T_pct}%` }} />
              </div>
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
                  <FileUpload
                    kind="photo"
                    value={photoUrl}
                    onChange={setPhotoUrl}
                    label="პროფილის ფოტო"
                    hint="კვადრატული სურათი უკეთ გამოიყურება (JPG/PNG/WebP)."
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FField label="სახელი"><input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="გიორგი" /></FField>
                    <FField label="გვარი"><input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="მაისურაძე" /></FField>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FField label="დაბადების თარიღი">
                      <input type="date" className={inputCls} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                      {ageGroup && <span className={`mt-2 inline-flex items-center gap-1.5 rounded-pill border border-brand-500/25 bg-brand-500/10 px-2.5 py-0.5 text-[12px] font-medium ${T.brand2}`}>ასაკობრივი ჯგუფი: {ageGroup}</span>}
                    </FField>
                    <FField label="მოქალაქეობა">
                      <FSelect value={nationality} onChange={setNationality} options={COUNTRIES} />
                    </FField>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <StepHead n="02" title="შენი პოზიცია" desc="ძირითადი პოზიცია, ფეხი და მაისურის ნომერი." />
                  <div className="grid grid-cols-2 gap-3">
                    {POSITIONS.map((p) => (
                      <button key={p.v} type="button" onClick={() => { setPos(p.v); setSecSkills((s) => { const n = { ...s }; delete n[p.v]; return n; }); }} className={`flex items-center justify-between rounded-card border px-4 py-3.5 text-left transition-colors ${pos === p.v ? "border-brand-400 bg-brand-500/12" : dark ? "border-ink-700 hover:border-ink-600" : "border-ink-200 hover:border-ink-300"}`}>
                        <span className={`text-[15px] font-medium ${pos === p.v ? T.brand2 : T.t1}`}>{p.l}</span>
                        {pos === p.v && <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-3 w-3")}</span>}
                      </button>
                    ))}
                  </div>

                  <div>
                    <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>დამატებითი პოზიცია(ები) — რამდენად ეხერხება</span>
                    <div className="space-y-2">
                      {POSITIONS.filter((p) => p.v !== pos).map((p) => {
                        const on = p.v in secSkills;
                        return (
                          <div key={p.v} className={`rounded-card border px-4 py-3 transition-colors ${on ? "border-brand-400/60 bg-brand-500/8" : dark ? "border-ink-700" : "border-ink-200"}`}>
                            <div className="flex items-center justify-between">
                              <button type="button" onClick={() => toggleSec(p.v)} className="flex items-center gap-2.5">
                                <span className={`grid h-5 w-5 place-items-center rounded border ${on ? "border-brand-400 bg-brand-400 text-ink-950" : dark ? "border-ink-600" : "border-ink-300"}`}>{on && Ic.check("h-3 w-3")}</span>
                                <span className={`text-[14px] font-medium ${on ? T.t1 : T.t3}`}>{p.l}</span>
                              </button>
                              {on && <span className={`font-mono text-[13px] font-semibold tabular-nums ${T.brand}`}>{secSkills[p.v]}%</span>}
                            </div>
                            {on && (
                              <input type="range" min={0} max={100} step={5} value={secSkills[p.v]} onChange={(e) => setSecSkills((s) => ({ ...s, [p.v]: Number(e.target.value) }))} className="mt-2 w-full accent-brand-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>უპირატესი ფეხი</span>
                      <div className={`inline-flex rounded-pill border p-1 ${dark ? "border-ink-700 bg-ink-900" : "border-ink-200 bg-white"}`}>
                        {FEET.map((f) => (
                          <button key={f.v} type="button" onClick={() => setFoot(f.v)} className={`rounded-pill px-4 py-1.5 text-[13px] font-medium transition-colors ${foot === f.v ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{f.l}</button>
                        ))}
                      </div>
                    </div>
                    <FField label="მაისურის ნომერი"><input type="number" min={0} max={99} className={inputCls} value={jersey} onChange={(e) => setJersey(e.target.value)} placeholder="10" /></FField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FSlider label="მარჯვენა ფეხი" value={rightPct} onChange={setRightPct} />
                    <FSlider label="მარცხენა ფეხი" value={leftPct} onChange={setLeftPct} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <StepHead n="03" title="დონე და ლიგა" desc="სად და რა დონეზე თამაშობ ამჟამად." />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FField label="ქალაქი"><FSelect value={city} onChange={setCity} options={CITIES} /></FField>
                    <FField label="მიმდინარე გუნდი"><input className={inputCls} value={currentTeam} onChange={(e) => setCurrentTeam(e.target.value)} placeholder="სკ დინამო" /></FField>
                  </div>
                  <div>
                    <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>დონე</span>
                    <div className="grid grid-cols-3 gap-2">
                      {LEVELS.map((l) => (
                        <button key={l.v} type="button" onClick={() => setLevel(l.v)} className={`rounded-card border px-3 py-3 text-[13px] font-medium transition-colors ${level === l.v ? `border-brand-400 bg-brand-500/12 ${T.brand2}` : `${dark ? "border-ink-700 hover:border-ink-600" : "border-ink-200 hover:border-ink-300"} ${T.t3}`}`}>{l.l}</button>
                      ))}
                    </div>
                  </div>
                  <FField label="მიმდინარე ლიგა"><input className={inputCls} value={league} onChange={(e) => setLeague(e.target.value)} placeholder="თბილისის რეგიონული ლიგა" /></FField>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <StepHead n="04" title="ფიზიკური მონაცემები" desc="სიმაღლე, წონა და სპრინტის დრო. (არასავალდებულო)" />
                  <div className="grid grid-cols-2 gap-4">
                    <FField label="სიმაღლე (სმ)"><input type="number" className={inputCls} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="178" /></FField>
                    <FField label="წონა (კგ)"><input type="number" className={inputCls} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" /></FField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FField label="სპრინტი 10მ (წამი)">
                      <input type="number" step="0.01" className={inputCls} value={sprint10} onChange={(e) => setSprint10(e.target.value)} placeholder="1.80" />
                      {kmh(10, toNum(sprint10)) && <span className={`mt-1 block text-xs ${T.muted}`}>≈ {kmh(10, toNum(sprint10))} კმ/სთ</span>}
                    </FField>
                    <FField label="სპრინტი 30მ (წამი)">
                      <input type="number" step="0.01" className={inputCls} value={sprint30} onChange={(e) => setSprint30(e.target.value)} placeholder="4.10" />
                      {kmh(30, toNum(sprint30)) && <span className={`mt-1 block text-xs ${T.muted}`}>≈ {kmh(30, toNum(sprint30))} კმ/სთ</span>}
                    </FField>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <StepHead n="05" title="გუნდი და კონტრაქტი" desc="სეზონი, კონტრაქტი და სასწავლებელი. (არასავალდებულო)" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FField label="აქტიური სეზონი"><input className={inputCls} value={activeSeason} onChange={(e) => setActiveSeason(e.target.value)} placeholder="2025/2026" /></FField>
                    <FField label="სასწავლებელი"><input className={inputCls} value={school} onChange={(e) => setSchool(e.target.value)} placeholder="თბილისის №1 სკოლა" /></FField>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FField label="კონტრაქტის დაწყება"><input type="date" className={inputCls} value={contractStart} onChange={(e) => setContractStart(e.target.value)} /></FField>
                    <FField label="კონტრაქტის ვადა"><input type="date" className={inputCls} value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} /></FField>
                  </div>
                  <FileUpload kind="contract" variant="row" value={contractDocUrl} onChange={setContractDocUrl} label="კონტრაქტის ფაილი" hint="სურათი ან PDF (მაქს. 15MB)." />
                  <FileUpload kind="grades" variant="row" value={gradesSheetUrl} onChange={setGradesSheetUrl} label="ნიშნების ფურცელი" hint="სურათი ან PDF (მაქს. 15MB)." />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-7">
                  <StepHead n="06" title="კარიერა და მედია" desc="წარსული გუნდები და თამაშების ბმულები. (არასავალდებულო)" />

                  {/* Career */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-[13px] font-medium ${T.t2}`}>კარიერა — წარსული გუნდები</span>
                      <button type="button" onClick={() => setCareer([...career, emptyCareer()])} className={`inline-flex items-center gap-1.5 rounded-btn px-2.5 py-1.5 text-[13px] font-medium ${T.brand} ${T.hoverBg}`}>{Ic.plus("h-4 w-4")} დამატება</button>
                    </div>
                    <div className="space-y-3">
                      {career.map((c, i) => (
                        <div key={i} className={`rounded-card border p-3 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-ink-50"}`}>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <input className={`${inputCls} col-span-2`} value={c.teamName} onChange={(e) => updateCareer(i, { teamName: e.target.value })} placeholder="გუნდი" />
                            <input type="number" className={inputCls} value={c.startYear} onChange={(e) => updateCareer(i, { startYear: e.target.value })} placeholder="დან (წელი)" />
                            <input type="number" className={inputCls} value={c.endYear} onChange={(e) => updateCareer(i, { endYear: e.target.value })} placeholder="მდე" />
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div className="col-span-2">
                              <FSelect value={c.position || ""} onChange={(v) => updateCareer(i, { position: v as Pos })} options={["", ...POSITIONS.map((p) => p.v)]} labelMap={{ "": "პოზიცია", GK: "მეკარე", DF: "მცველი", MF: "ნახევარმცველი", FW: "თავდამსხმელი" }} />
                            </div>
                            <input type="number" className={inputCls} value={c.jersey} onChange={(e) => updateCareer(i, { jersey: e.target.value })} placeholder="ნომერი" />
                            <button type="button" onClick={() => setCareer(career.filter((_, j) => j !== i))} className={`inline-flex items-center justify-center gap-1.5 rounded-field text-[13px] font-medium text-danger-500 transition-colors hover:bg-danger-500/10`}>{Ic.trash("h-4 w-4")} წაშლა</button>
                          </div>
                        </div>
                      ))}
                      {career.length === 0 && <Empty text="კარიერა ჯერ არ დამატებულა." />}
                    </div>
                  </div>

                  {/* Match links */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-[13px] font-medium ${T.t2}`}>თამაშების ბმულები</span>
                      <button type="button" onClick={() => setMatchLinks([...matchLinks, emptyMatch()])} className={`inline-flex items-center gap-1.5 rounded-btn px-2.5 py-1.5 text-[13px] font-medium ${T.brand} ${T.hoverBg}`}>{Ic.plus("h-4 w-4")} დამატება</button>
                    </div>
                    <div className="space-y-3">
                      {matchLinks.map((m, i) => (
                        <div key={i} className={`rounded-card border p-3 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-ink-50"}`}>
                          <input className={inputCls} value={m.url} onChange={(e) => updateMatch(i, { url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <input type="date" className={`${inputCls} col-span-2`} value={m.matchDate} onChange={(e) => updateMatch(i, { matchDate: e.target.value })} />
                            <input className={inputCls} value={m.opponent} onChange={(e) => updateMatch(i, { opponent: e.target.value })} placeholder="ოპონენტი" />
                            <div className="flex gap-1">
                              <input className={inputCls} value={m.competition} onChange={(e) => updateMatch(i, { competition: e.target.value })} placeholder="ტურნირი" />
                              <button type="button" onClick={() => setMatchLinks(matchLinks.filter((_, j) => j !== i))} className="inline-flex shrink-0 items-center rounded-field px-2 text-danger-500 transition-colors hover:bg-danger-500/10">{Ic.trash("h-4 w-4")}</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {matchLinks.length === 0 && <Empty text="თამაშის ბმული ჯერ არ დამატებულა." />}
                    </div>
                  </div>

                  {/* Highlight videos */}
                  <div>
                    <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>Highlight ვიდეოები</span>
                    <div className="flex gap-2">
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                      <button type="button" onClick={() => { if (draft.trim()) { setMedia([...media, draft.trim()]); setDraft(""); } }} className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-btn px-4 text-sm font-medium transition-colors ${dark ? "bg-ink-800 text-ink-100 hover:bg-ink-700" : "bg-ink-100 text-ink-800 hover:bg-ink-200"}`}>{Ic.plus("h-4 w-4")} დამატება</button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {media.map((m, i) => (
                        <div key={i} className={`flex items-center gap-3 rounded-card border px-4 py-3 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-ink-50"}`}>
                          <span className={`grid h-9 w-9 place-items-center rounded-btn bg-brand-500/15 ${T.brand2}`}>{Ic.video("h-4 w-4")}</span>
                          <span className={`flex-1 truncate text-[13.5px] ${T.t2}`}>{m}</span>
                          <button type="button" onClick={() => setMedia(media.filter((_, j) => j !== i))} className={`rounded-btn p-1.5 ${T.faint} ${T.hoverBg}`}>{Ic.close("h-4 w-4")}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="mt-5 rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-[13px] text-danger-300">{error}</div>}

              <div className={`mt-8 flex items-center justify-between border-t pt-6 ${T.border}`}>
                <button type="button" onClick={() => { setError(null); setStep(Math.max(0, step - 1)); }} disabled={step === 0} className={`inline-flex items-center gap-1.5 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors ${T.t3} ${T.hoverBg} disabled:opacity-30 disabled:pointer-events-none`}>{Ic.arrowLeft("h-4 w-4")} უკან</button>
                <div className="flex items-center gap-2">
                  {step > LAST_REQUIRED && step < STEPS.length - 1 && (
                    <button type="button" onClick={() => { setError(null); setStep(step + 1); }} className={`rounded-btn px-3 py-2.5 text-sm font-medium ${T.muted} ${T.hoverBg}`}>გამოტოვება</button>
                  )}
                  {step > LAST_REQUIRED && (
                    <button type="button" onClick={submit} disabled={pending} className={`rounded-btn px-4 py-2.5 text-sm font-medium ${T.brand} ${T.hoverBg} disabled:opacity-50`}>დასრულება ახლა</button>
                  )}
                  <button type="button" onClick={next} disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-btn bg-brand-400 px-6 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 disabled:opacity-50">
                    {pending ? "ინახება..." : step === STEPS.length - 1 ? "პროფილის დასრულება" : "გაგრძელება"} {Ic.arrow("h-4 w-4")}
                  </button>
                </div>
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

  function updateCareer(i: number, patch: Partial<CareerRow>) {
    setCareer(career.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }
  function updateMatch(i: number, patch: Partial<MatchRow>) {
    setMatchLinks(matchLinks.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  }

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

  function Empty({ text }: { text: string }) {
    return <p className={`rounded-card border border-dashed px-4 py-5 text-center text-[13px] ${dark ? "border-ink-700 text-ink-500" : "border-ink-300 text-ink-400"}`}>{text}</p>;
  }
}

type CareerRow = { teamName: string; startYear: string; endYear: string; position: string; jersey: string };
type MatchRow = { url: string; matchDate: string; opponent: string; competition: string };
const emptyCareer = (): CareerRow => ({ teamName: "", startYear: "", endYear: "", position: "", jersey: "" });
const emptyMatch = (): MatchRow => ({ url: "", matchDate: "", opponent: "", competition: "" });
