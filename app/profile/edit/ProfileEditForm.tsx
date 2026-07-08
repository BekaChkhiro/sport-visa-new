"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { InitialsAvatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { PlayerHeader } from "@/components/app/PlayerHeader";
import { updateProfile, addMedia, deleteMedia, type FormState } from "@/app/actions/player";
import { ageGroupFromBirthDate, ageGroupLabels } from "@/lib/labels";

export type MediaItem = { id: string; url: string; type: "VIDEO" | "PHOTO" };

type Pos = "GK" | "DF" | "MF" | "FW";
type Lvl = "BEGINNER" | "AMATEUR" | "SEMI_PRO" | "PRO";

const POSITIONS: { v: Pos; l: string }[] = [
  { v: "GK", l: "მეკარე" }, { v: "DF", l: "მცველი" }, { v: "MF", l: "ნახევარმცველი" }, { v: "FW", l: "თავდამსხმელი" },
];
const FEET = ["მარჯვენა", "მარცხენა", "ორივე"];
const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი"];
const LEVELS: { v: Lvl; l: string }[] = [
  { v: "AMATEUR", l: "მოყვარული" }, { v: "SEMI_PRO", l: "ნახევრადპროფესიონალი" }, { v: "PRO", l: "პროფესიონალი" },
];

type Defaults = {
  firstName: string; lastName: string; birthDate: string;
  position: Pos; city: string; level: Lvl; currentLeague: string;
  heightCm: number | null; weightKg: number | null; bio: string | null; ageGroup: string;
};

export function ProfileEditForm({ email, defaults, media }: { email: string; defaults: Defaults; media: MediaItem[] }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [state, formAction, saving] = useActionState<FormState, FormData>(updateProfile, undefined);

  const [firstName, setFirstName] = useState(defaults.firstName);
  const [lastName, setLastName] = useState(defaults.lastName);
  const [birthDate, setBirthDate] = useState(defaults.birthDate);
  const [pos, setPos] = useState<Pos>(defaults.position);
  const [foot, setFoot] = useState("მარჯვენა");
  const [city, setCity] = useState(defaults.city);
  const [level, setLevel] = useState<Lvl>(defaults.level);
  const [league, setLeague] = useState(defaults.currentLeague);
  const [height, setHeight] = useState(defaults.heightCm ? String(defaults.heightCm) : "");
  const [weight, setWeight] = useState(defaults.weightKg ? String(defaults.weightKg) : "");
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;
  const posLabel = POSITIONS.find((p) => p.v === pos)?.l ?? "";
  const levelLabel = LEVELS.find((l) => l.v === level)?.l ?? "";
  const ageGroup = birthDate ? ageGroupLabels[ageGroupFromBirthDate(new Date(birthDate))] : defaults.ageGroup;
  const completeness = media.length > 0 ? 100 : 80;

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
    startTransition(async () => {
      await deleteMedia(id);
      router.refresh();
    });
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
            {state?.ok && <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${T.brand}`}>{Ic.check("h-4 w-4")} შენახულია</span>}
            <Link href="/profile" className={`inline-flex h-10 items-center rounded-btn border px-4 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>გაუქმება</Link>
            <button type="submit" form="profile-edit-form" disabled={saving} className="inline-flex h-10 items-center rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">{saving ? "ინახება..." : "ცვლილებების შენახვა"}</button>
          </div>
        </div>

        {state?.error && <div className="mb-4 rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-[13px] text-danger-300">{state.error}</div>}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <form id="profile-edit-form" action={formAction} className="space-y-8">
            <input type="hidden" name="firstName" value={firstName} />
            <input type="hidden" name="lastName" value={lastName} />
            <input type="hidden" name="birthDate" value={birthDate} />
            <input type="hidden" name="position" value={pos} />
            <input type="hidden" name="foot" value={foot} />
            <input type="hidden" name="city" value={city} />
            <input type="hidden" name="level" value={level} />
            <input type="hidden" name="currentLeague" value={league} />
            <input type="hidden" name="heightCm" value={height} />
            <input type="hidden" name="weightKg" value={weight} />
            <input type="hidden" name="bio" value={defaults.bio ?? ""} />

            <section className={`rounded-card border p-6 ${T.card}`}>
              <SecTitle n="01" t="ძირითადი მონაცემები" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>სახელი</span><input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>გვარი</span><input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>დაბადების თარიღი</span><input type="date" className={inputCls} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label>
                <div className="flex items-end">
                  <span className={`inline-flex items-center gap-1.5 rounded-pill border border-brand-500/25 bg-brand-500/10 px-2.5 py-1.5 text-[12px] font-medium ${T.brand2}`}>ასაკობრივი ჯგუფი: {ageGroup}</span>
                </div>
              </div>
            </section>

            <section className={`rounded-card border p-6 ${T.card}`}>
              <SecTitle n="02" t="პოზიცია" />
              <div className="grid grid-cols-2 gap-3">
                {POSITIONS.map((p) => (
                  <button key={p.v} type="button" onClick={() => setPos(p.v)} className={`flex items-center justify-between rounded-card border px-4 py-3.5 text-left transition-colors ${pos === p.v ? "border-brand-400 bg-brand-500/12" : dark ? "border-ink-700 hover:border-ink-600" : "border-ink-200 hover:border-ink-300"}`}>
                    <span className={`text-[15px] font-medium ${pos === p.v ? T.brand2 : T.t1}`}>{p.l}</span>
                    {pos === p.v && <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-3 w-3")}</span>}
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>უპირატესი ფეხი</span>
                <div className={`inline-flex rounded-pill border p-1 ${dark ? "border-ink-700 bg-ink-900" : "border-ink-200 bg-white"}`}>
                  {FEET.map((f) => (
                    <button key={f} type="button" onClick={() => setFoot(f)} className={`rounded-pill px-4 py-1.5 text-[13px] font-medium transition-colors ${foot === f ? "bg-brand-400 text-ink-950" : T.navIdle}`}>{f}</button>
                  ))}
                </div>
              </div>
            </section>

            <section className={`rounded-card border p-6 ${T.card}`}>
              <SecTitle n="03" t="დონე და ფიზიკური მონაცემები" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ქალაქი</span>
                  <div className="relative">
                    <select value={city} onChange={(e) => setCity(e.target.value)} className={`${inputCls} appearance-none pr-10`}>{CITIES.map((c) => <option key={c} className={dark ? "bg-ink-900" : "bg-white"}>{c}</option>)}</select>
                    <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${T.muted}`}>{Ic.chevronDown("h-4 w-4")}</span>
                  </div>
                </label>
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>მიმდინარე ლიგა / გუნდი</span><input className={inputCls} value={league} onChange={(e) => setLeague(e.target.value)} /></label>
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>სიმაღლე (სმ)</span><input type="number" className={inputCls} value={height} onChange={(e) => setHeight(e.target.value)} /></label>
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>წონა (კგ)</span><input type="number" className={inputCls} value={weight} onChange={(e) => setWeight(e.target.value)} /></label>
              </div>
              <div className="mt-4">
                <span className={`mb-2 block text-[13px] font-medium ${T.t2}`}>დონე</span>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map((l) => (
                    <button key={l.v} type="button" onClick={() => setLevel(l.v)} className={`rounded-card border px-3 py-3 text-[13px] font-medium transition-colors ${level === l.v ? `border-brand-400 bg-brand-500/12 ${T.brand2}` : `${dark ? "border-ink-700 hover:border-ink-600" : "border-ink-200 hover:border-ink-300"} ${T.t3}`}`}>{l.l}</button>
                  ))}
                </div>
              </div>
            </section>
          </form>

          {/* Media (separate — uses its own actions) + live preview */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className={`rounded-card border p-5 ${T.card}`}>
              <div className="mb-3 flex items-center gap-2.5">
                <span className={`font-mono text-[12px] font-bold ${T.brand}`}>04</span>
                <h2 className={`text-[15px] font-bold ${T.h}`}>ვიდეო-მასალა</h2>
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
                  <InitialsAvatar name={`${firstName} ${lastName}`} size={52} rounded="card" className={`border-2 ${dark ? "border-ink-950" : "border-ink-50"}`} />
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
