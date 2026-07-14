"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { InitialsAvatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { PlayerHeader } from "@/components/app/PlayerHeader";
import { FileUpload } from "@/components/ui/FileUpload";
import { FField, FSelect, FSlider } from "@/components/ui/form";
import {
  addMedia,
  deleteMedia,
  saveProfileEdits,
  type OnboardingInput,
  type CareerInput,
  type MatchLinkInput,
} from "@/app/actions/player";
import { ageGroupFromBirthDate, ageGroupLabels } from "@/lib/labels";

export type MediaItem = { id: string; url: string; type: "VIDEO" | "PHOTO" };

type Pos = "GK" | "DF" | "MF" | "FW";
type Lvl = "BEGINNER" | "AMATEUR" | "SEMI_PRO" | "PRO";
type FootV = "RIGHT" | "LEFT" | "BOTH";
type CareerRow = { teamName: string; startYear: string; endYear: string; position: string; jersey: string };
type MatchRow = { url: string; matchDate: string; opponent: string; competition: string };

const POSITIONS: { v: Pos; l: string }[] = [
  { v: "GK", l: "მეკარე" }, { v: "DF", l: "მცველი" }, { v: "MF", l: "ნახევარმცველი" }, { v: "FW", l: "თავდამსხმელი" },
];
const FEET: { v: FootV; l: string }[] = [
  { v: "RIGHT", l: "მარჯვენა" }, { v: "LEFT", l: "მარცხენა" }, { v: "BOTH", l: "ორივე" },
];
const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი"];
const COUNTRIES = [
  "საქართველო", "უკრაინა", "სომხეთი", "აზერბაიჯანი", "თურქეთი", "რუსეთი",
  "ბრაზილია", "არგენტინა", "ესპანეთი", "საფრანგეთი", "გერმანია", "იტალია",
  "ინგლისი", "პორტუგალია", "ნიგერია", "განა", "სხვა",
];
const LEVELS: { v: Lvl; l: string }[] = [
  { v: "AMATEUR", l: "მოყვარული" }, { v: "SEMI_PRO", l: "ნახევრადპროფესიონალი" }, { v: "PRO", l: "პროფესიონალი" },
];

type Defaults = {
  firstName: string; lastName: string; birthDate: string;
  position: Pos; city: string; level: Lvl; currentLeague: string;
  heightCm: number | null; weightKg: number | null; bio: string | null; ageGroup: string;
  photoUrl: string | null; nationality: string | null; school: string | null;
  gradesSheetUrl: string | null; contractDocUrl: string | null;
  sprint10m: number | null; sprint30m: number | null;
  activeSeason: string | null; currentTeam: string | null;
  contractStart: string; contractEnd: string;
  jerseyNumber: number | null; preferredFoot: FootV | null;
  rightFootPct: number | null; leftFootPct: number | null;
  positionSkills: { position: Pos; percentage: number }[];
  career: CareerRow[]; matchLinks: MatchRow[];
};

const toNum = (s: string): number | null => {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const kmh = (m: number, s: number | null) => (s && s > 0 ? Math.round((m / s) * 3.6 * 10) / 10 : null);

export function ProfileEditForm({ email, defaults, media }: { email: string; defaults: Defaults; media: MediaItem[] }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // core
  const [firstName, setFirstName] = useState(defaults.firstName);
  const [lastName, setLastName] = useState(defaults.lastName);
  const [birthDate, setBirthDate] = useState(defaults.birthDate);
  const [pos, setPos] = useState<Pos>(defaults.position);
  const [city, setCity] = useState(defaults.city);
  const [level, setLevel] = useState<Lvl>(defaults.level);
  const [league, setLeague] = useState(defaults.currentLeague);
  const [height, setHeight] = useState(defaults.heightCm != null ? String(defaults.heightCm) : "");
  const [weight, setWeight] = useState(defaults.weightKg != null ? String(defaults.weightKg) : "");
  // passport
  const [photoUrl, setPhotoUrl] = useState<string | null>(defaults.photoUrl);
  const [nationality, setNationality] = useState(defaults.nationality ?? "საქართველო");
  const [foot, setFoot] = useState<FootV>(defaults.preferredFoot ?? "RIGHT");
  const [jersey, setJersey] = useState(defaults.jerseyNumber != null ? String(defaults.jerseyNumber) : "");
  const [rightPct, setRightPct] = useState(defaults.rightFootPct ?? 100);
  const [leftPct, setLeftPct] = useState(defaults.leftFootPct ?? 20);
  const [secSkills, setSecSkills] = useState<Record<string, number>>(
    Object.fromEntries(defaults.positionSkills.map((s) => [s.position, s.percentage])),
  );
  const [sprint10, setSprint10] = useState(defaults.sprint10m != null ? String(defaults.sprint10m) : "");
  const [sprint30, setSprint30] = useState(defaults.sprint30m != null ? String(defaults.sprint30m) : "");
  const [activeSeason, setActiveSeason] = useState(defaults.activeSeason ?? "");
  const [currentTeam, setCurrentTeam] = useState(defaults.currentTeam ?? "");
  const [contractStart, setContractStart] = useState(defaults.contractStart);
  const [contractEnd, setContractEnd] = useState(defaults.contractEnd);
  const [contractDocUrl, setContractDocUrl] = useState<string | null>(defaults.contractDocUrl);
  const [school, setSchool] = useState(defaults.school ?? "");
  const [gradesSheetUrl, setGradesSheetUrl] = useState<string | null>(defaults.gradesSheetUrl);
  const [career, setCareer] = useState<CareerRow[]>(defaults.career);
  const [matchLinks, setMatchLinks] = useState<MatchRow[]>(defaults.matchLinks);
  const [draft, setDraft] = useState("");

  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;
  const posLabel = POSITIONS.find((p) => p.v === pos)?.l ?? "";
  const levelLabel = LEVELS.find((l) => l.v === level)?.l ?? "";
  const ageGroup = birthDate ? ageGroupLabels[ageGroupFromBirthDate(new Date(birthDate))] : defaults.ageGroup;
  const completeness = media.length > 0 ? 100 : 80;

  function toggleSec(p: Pos) {
    setSecSkills((prev) => {
      const n = { ...prev };
      if (p in n) delete n[p];
      else n[p] = 70;
      return n;
    });
  }
  function updateCareer(i: number, patch: Partial<CareerRow>) {
    setCareer(career.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }
  function updateMatch(i: number, patch: Partial<MatchRow>) {
    setMatchLinks(matchLinks.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  }

  function save() {
    setError(null);
    setSaved(false);
    if (firstName.trim().length < 2 || lastName.trim().length < 2) { setError("შეავსე სახელი და გვარი"); return; }
    if (league.trim().length < 2) { setError("შეიყვანე ლიგა"); return; }
    const input: OnboardingInput = {
      firstName, lastName, birthDate, position: pos, city, level, currentLeague: league,
      photoUrl, nationality, school: school || null, gradesSheetUrl,
      heightCm: toNum(height), weightKg: toNum(weight),
      sprint10m: toNum(sprint10), sprint30m: toNum(sprint30),
      activeSeason: activeSeason || null, currentTeam: currentTeam || null,
      contractStart: contractStart || null, contractEnd: contractEnd || null, contractDocUrl,
      jerseyNumber: toNum(jersey), preferredFoot: foot, rightFootPct: rightPct, leftFootPct: leftPct,
      positionSkills: (Object.entries(secSkills) as [Pos, number][]).map(([position, percentage]) => ({ position, percentage })),
      career: career.filter((c) => c.teamName.trim() && c.startYear.trim()).map<CareerInput>((c) => ({
        teamName: c.teamName.trim(), startYear: Number(c.startYear), endYear: toNum(c.endYear),
        position: (c.position || null) as Pos | null, jerseyNumber: toNum(c.jersey),
      })),
      matchLinks: matchLinks.filter((m) => m.url.trim()).map<MatchLinkInput>((m) => ({
        url: m.url.trim(), matchDate: m.matchDate || null, opponent: m.opponent || null, competition: m.competition || null,
      })),
      // media handled separately below
    };
    startSaving(async () => {
      const res = await saveProfileEdits(input);
      if (res.error) setError(res.error);
      else { setSaved(true); router.refresh(); }
    });
  }

  function addLink() {
    const url = draft.trim();
    if (!url) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("type", "VIDEO");
      fd.append("url", url);
      await addMedia(undefined, fd);
      setDraft("");
      router.refresh();
    });
  }
  function removeMedia(id: string) {
    startTransition(async () => { await deleteMedia(id); router.refresh(); });
  }

  function SecTitle({ n, t }: { n: string; t: string }) {
    return (
      <div className="mb-4 flex items-center gap-2.5">
        <span className={`font-mono text-[12px] font-bold ${T.brand}`}>{n}</span>
        <h2 className={`text-[15px] font-bold ${T.h}`}>{t}</h2>
        <div className={`ml-1 h-px flex-1 ${dark ? "bg-ink-800" : "bg-ink-200"}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <PlayerHeader name={firstName} subtitle={`${posLabel} · ${city}`} email={email} />

      <main className="mx-auto max-w-[1080px] px-6 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/profile" className={`mb-2 inline-flex items-center gap-1.5 text-[13px] font-medium ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>{Ic.arrowLeft("h-4 w-4")} პროფილზე დაბრუნება</Link>
            <h1 className={`font-display text-[24px] font-extrabold tracking-tight ${T.h}`}>პროფილის რედაქტირება</h1>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${T.brand}`}>{Ic.check("h-4 w-4")} შენახულია</span>}
            <Link href="/profile" className={`inline-flex h-10 items-center rounded-btn border px-4 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>გაუქმება</Link>
            <button type="button" onClick={save} disabled={saving} className="inline-flex h-10 items-center rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">{saving ? "ინახება..." : "ცვლილებების შენახვა"}</button>
          </div>
        </div>

        {error && <div className="mb-4 rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-[13px] text-danger-300">{error}</div>}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {/* 01 basics */}
            <section className={`rounded-card border p-6 ${T.card}`}>
              <SecTitle n="01" t="ძირითადი მონაცემები" />
              <FileUpload kind="photo" value={photoUrl} onChange={setPhotoUrl} label="პროფილის ფოტო" />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FField label="სახელი"><input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></FField>
                <FField label="გვარი"><input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} /></FField>
                <FField label="დაბადების თარიღი"><input type="date" className={inputCls} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></FField>
                <FField label="მოქალაქეობა"><FSelect value={nationality} onChange={setNationality} options={COUNTRIES} /></FField>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 rounded-pill border border-brand-500/25 bg-brand-500/10 px-2.5 py-1.5 text-[12px] font-medium ${T.brand2}`}>ასაკობრივი ჯგუფი: {ageGroup}</span>
              </div>
            </section>

            {/* 02 position */}
            <section className={`rounded-card border p-6 ${T.card}`}>
              <SecTitle n="02" t="პოზიცია და ფეხი" />
              <div className="grid grid-cols-2 gap-3">
                {POSITIONS.map((p) => (
                  <button key={p.v} type="button" onClick={() => { setPos(p.v); setSecSkills((s) => { const n = { ...s }; delete n[p.v]; return n; }); }} className={`flex items-center justify-between rounded-card border px-4 py-3.5 text-left transition-colors ${pos === p.v ? "border-brand-400 bg-brand-500/12" : dark ? "border-ink-700 hover:border-ink-600" : "border-ink-200 hover:border-ink-300"}`}>
                    <span className={`text-[15px] font-medium ${pos === p.v ? T.brand2 : T.t1}`}>{p.l}</span>
                    {pos === p.v && <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-3 w-3")}</span>}
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>დამატებითი პოზიცია(ები)</span>
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
                        {on && <input type="range" min={0} max={100} step={5} value={secSkills[p.v]} onChange={(e) => setSecSkills((s) => ({ ...s, [p.v]: Number(e.target.value) }))} className="mt-2 w-full accent-brand-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>უპირატესი ფეხი</span>
                  <div className={`inline-flex rounded-pill border p-1 ${dark ? "border-ink-700 bg-ink-900" : "border-ink-200 bg-white"}`}>
                    {FEET.map((f) => <button key={f.v} type="button" onClick={() => setFoot(f.v)} className={`rounded-pill px-4 py-1.5 text-[13px] font-medium transition-colors ${foot === f.v ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{f.l}</button>)}
                  </div>
                </div>
                <FField label="მაისურის ნომერი"><input type="number" className={inputCls} value={jersey} onChange={(e) => setJersey(e.target.value)} /></FField>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FSlider label="მარჯვენა ფეხი" value={rightPct} onChange={setRightPct} />
                <FSlider label="მარცხენა ფეხი" value={leftPct} onChange={setLeftPct} />
              </div>
            </section>

            {/* 03 level & physical */}
            <section className={`rounded-card border p-6 ${T.card}`}>
              <SecTitle n="03" t="დონე და ფიზიკური მონაცემები" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FField label="ქალაქი"><FSelect value={city} onChange={setCity} options={CITIES} /></FField>
                <FField label="მიმდინარე ლიგა"><input className={inputCls} value={league} onChange={(e) => setLeague(e.target.value)} /></FField>
                <FField label="სიმაღლე (სმ)"><input type="number" className={inputCls} value={height} onChange={(e) => setHeight(e.target.value)} /></FField>
                <FField label="წონა (კგ)"><input type="number" className={inputCls} value={weight} onChange={(e) => setWeight(e.target.value)} /></FField>
                <FField label="სპრინტი 10მ (წამი)">
                  <input type="number" step="0.01" className={inputCls} value={sprint10} onChange={(e) => setSprint10(e.target.value)} />
                  {kmh(10, toNum(sprint10)) && <span className={`mt-1 block text-xs ${T.muted}`}>≈ {kmh(10, toNum(sprint10))} კმ/სთ</span>}
                </FField>
                <FField label="სპრინტი 30მ (წამი)">
                  <input type="number" step="0.01" className={inputCls} value={sprint30} onChange={(e) => setSprint30(e.target.value)} />
                  {kmh(30, toNum(sprint30)) && <span className={`mt-1 block text-xs ${T.muted}`}>≈ {kmh(30, toNum(sprint30))} კმ/სთ</span>}
                </FField>
              </div>
              <div className="mt-4">
                <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>დონე</span>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map((l) => <button key={l.v} type="button" onClick={() => setLevel(l.v)} className={`rounded-card border px-3 py-3 text-[13px] font-medium transition-colors ${level === l.v ? `border-brand-400 bg-brand-500/12 ${T.brand2}` : `${dark ? "border-ink-700 hover:border-ink-600" : "border-ink-200 hover:border-ink-300"} ${T.t3}`}`}>{l.l}</button>)}
                </div>
              </div>
            </section>

            {/* 04 team & contract */}
            <section className={`rounded-card border p-6 ${T.card}`}>
              <SecTitle n="04" t="გუნდი, კონტრაქტი, დოკუმენტები" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FField label="მიმდინარე გუნდი"><input className={inputCls} value={currentTeam} onChange={(e) => setCurrentTeam(e.target.value)} /></FField>
                <FField label="აქტიური სეზონი"><input className={inputCls} value={activeSeason} onChange={(e) => setActiveSeason(e.target.value)} placeholder="2025/2026" /></FField>
                <FField label="კონტრაქტის დაწყება"><input type="date" className={inputCls} value={contractStart} onChange={(e) => setContractStart(e.target.value)} /></FField>
                <FField label="კონტრაქტის ვადა"><input type="date" className={inputCls} value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} /></FField>
                <FField label="სასწავლებელი"><input className={inputCls} value={school} onChange={(e) => setSchool(e.target.value)} /></FField>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FileUpload kind="contract" variant="row" value={contractDocUrl} onChange={setContractDocUrl} label="კონტრაქტის ფაილი" />
                <FileUpload kind="grades" variant="row" value={gradesSheetUrl} onChange={setGradesSheetUrl} label="ნიშნების ფურცელი" />
              </div>
            </section>

            {/* 05 career & matches */}
            <section className={`rounded-card border p-6 ${T.card}`}>
              <SecTitle n="05" t="კარიერა და თამაშები" />
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-[13px] font-medium ${T.t2}`}>წარსული გუნდები</span>
                <button type="button" onClick={() => setCareer([...career, { teamName: "", startYear: "", endYear: "", position: "", jersey: "" }])} className={`inline-flex items-center gap-1.5 rounded-btn px-2.5 py-1.5 text-[13px] font-medium ${T.brand} ${dark ? "hover:bg-ink-800" : "hover:bg-ink-100"}`}>{Ic.plus("h-4 w-4")} დამატება</button>
              </div>
              <div className="space-y-3">
                {career.map((c, i) => (
                  <div key={i} className={`rounded-card border p-3 ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-ink-50"}`}>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <input className={`${inputCls} col-span-2`} value={c.teamName} onChange={(e) => updateCareer(i, { teamName: e.target.value })} placeholder="გუნდი" />
                      <input type="number" className={inputCls} value={c.startYear} onChange={(e) => updateCareer(i, { startYear: e.target.value })} placeholder="დან" />
                      <input type="number" className={inputCls} value={c.endYear} onChange={(e) => updateCareer(i, { endYear: e.target.value })} placeholder="მდე" />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="col-span-2"><FSelect value={c.position} onChange={(v) => updateCareer(i, { position: v })} options={["", ...POSITIONS.map((p) => p.v)]} labelMap={{ "": "პოზიცია", GK: "მეკარე", DF: "მცველი", MF: "ნახევარმცველი", FW: "თავდამსხმელი" }} /></div>
                      <input type="number" className={inputCls} value={c.jersey} onChange={(e) => updateCareer(i, { jersey: e.target.value })} placeholder="ნომერი" />
                      <button type="button" onClick={() => setCareer(career.filter((_, j) => j !== i))} className="inline-flex items-center justify-center gap-1.5 rounded-field text-[13px] font-medium text-danger-500 transition-colors hover:bg-danger-500/10">{Ic.trash("h-4 w-4")} წაშლა</button>
                    </div>
                  </div>
                ))}
                {career.length === 0 && <p className={`rounded-card border border-dashed px-4 py-5 text-center text-[13px] ${dark ? "border-ink-700 text-ink-500" : "border-ink-300 text-ink-400"}`}>კარიერა ჯერ არ დამატებულა.</p>}
              </div>

              <div className="mb-2 mt-6 flex items-center justify-between">
                <span className={`text-[13px] font-medium ${T.t2}`}>თამაშების ბმულები</span>
                <button type="button" onClick={() => setMatchLinks([...matchLinks, { url: "", matchDate: "", opponent: "", competition: "" }])} className={`inline-flex items-center gap-1.5 rounded-btn px-2.5 py-1.5 text-[13px] font-medium ${T.brand} ${dark ? "hover:bg-ink-800" : "hover:bg-ink-100"}`}>{Ic.plus("h-4 w-4")} დამატება</button>
              </div>
              <div className="space-y-3">
                {matchLinks.map((m, i) => (
                  <div key={i} className={`rounded-card border p-3 ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-ink-50"}`}>
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
                {matchLinks.length === 0 && <p className={`rounded-card border border-dashed px-4 py-5 text-center text-[13px] ${dark ? "border-ink-700 text-ink-500" : "border-ink-300 text-ink-400"}`}>თამაშის ბმული ჯერ არ დამატებულა.</p>}
              </div>
            </section>
          </div>

          {/* Media (separate actions) + live preview */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className={`rounded-card border p-5 ${T.card}`}>
              <div className="mb-3 flex items-center gap-2.5">
                <span className={`font-mono text-[12px] font-bold ${T.brand}`}>06</span>
                <h2 className={`text-[15px] font-bold ${T.h}`}>Highlight ვიდეოები</h2>
              </div>
              <div className="flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://youtube.com/..." className={inputCls} />
                <button type="button" onClick={addLink} disabled={pending} className={`inline-flex h-11 shrink-0 items-center gap-1 rounded-btn border px-3 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>{Ic.plus("h-4 w-4")}</button>
              </div>
              <div className="mt-3 space-y-2">
                {media.map((m) => (
                  <div key={m.id} className={`flex items-center gap-3 rounded-card border px-3 py-2.5 ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-ink-50"}`}>
                    <span className={`grid h-8 w-8 place-items-center rounded-btn bg-brand-500/15 ${T.brand2}`}>{Ic.video("h-4 w-4")}</span>
                    <span className={`flex-1 truncate text-[12.5px] ${T.t2}`}>{m.url}</span>
                    <button type="button" onClick={() => removeMedia(m.id)} disabled={pending} className={`rounded-btn p-1.5 ${T.faint} ${dark ? "hover:bg-ink-800" : "hover:bg-ink-100"}`}>{Ic.close("h-4 w-4")}</button>
                  </div>
                ))}
                {media.length === 0 && <p className={`rounded-card border border-dashed px-4 py-5 text-center text-[12.5px] ${dark ? "border-ink-700 text-ink-500" : "border-ink-300 text-ink-400"}`}>მასალა ჯერ არ დამატებულა.</p>}
              </div>
            </div>

            <div>
              <div className={`mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider ${T.muted}`}><span className="h-1.5 w-1.5 rounded-full bg-brand-400" />ცოცხალი წინასწარი ხედი</div>
              <div className={`rounded-card border p-5 ${T.card}`}>
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="" width={52} height={52} className={`h-[52px] w-[52px] rounded-card border-2 object-cover ${dark ? "border-ink-950" : "border-ink-50"}`} />
                  ) : (
                    <InitialsAvatar name={`${firstName} ${lastName}`} size={52} rounded="card" className={`border-2 ${dark ? "border-ink-950" : "border-ink-50"}`} />
                  )}
                  <div className="min-w-0">
                    <div className={`text-[15px] font-bold ${T.h}`}>{firstName} {lastName}</div>
                    <div className={`flex items-center gap-1 text-[12.5px] ${T.muted}`}>{Ic.pin("h-3.5 w-3.5")}{city}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className={`rounded-pill bg-brand-500/12 px-2.5 py-0.5 text-[11px] font-medium ${T.brand2}`}>{posLabel}</span>
                  <span className={`rounded-pill bg-accent-500/12 px-2.5 py-0.5 text-[11px] font-medium ${dark ? "text-accent-300" : "text-accent-700"}`}>{ageGroup}</span>
                  <span className={`rounded-pill px-2.5 py-0.5 text-[11px] font-medium ${T.square}`}>{levelLabel}</span>
                </div>
                <div className={`mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center ${T.border}`}>
                  {[[height || "—", "სმ"], [weight || "—", "კგ"], [String(media.length), "ვიდეო"]].map(([v, l]) => (
                    <div key={l}><div className={`font-mono text-[16px] font-bold tabular-nums ${T.h}`}>{v}</div><div className={`text-[11px] ${T.muted}`}>{l}</div></div>
                  ))}
                </div>
                <div className={`mt-4 border-t pt-4 ${T.border}`}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className={`text-[12.5px] ${T.muted}`}>პროფილის სისრულე</span>
                    <span className={`font-mono text-[12.5px] font-bold tabular-nums ${T.brand}`}>{completeness}%</span>
                  </div>
                  <div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400 transition-all" style={{ width: `${completeness}%` }} /></div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
