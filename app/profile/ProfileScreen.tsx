"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { MatchRing, Badge, InitialsAvatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { PlayerHeader } from "@/components/app/PlayerHeader";
import { deleteMedia } from "@/app/actions/player";

export type MediaDTO = { id: string; type: "VIDEO" | "PHOTO"; url: string; caption: string | null };
export type AppDTO = { id: string; club: string; badge: string; league: string; date: string; score: number };

type PlayerDTO = {
  firstName: string;
  lastName: string;
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
  completeness: number;
};

const TABS = ["მიმოხილვა", "მედია", "განაცხადები"];
const COVER = "https://live.staticflickr.com/8286/7794221892_2db05a6c93_b.jpg";

export function ProfileScreen({ player, media, apps }: { player: PlayerDTO; media: MediaDTO[]; apps: AppDTO[] }) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [tab, setTab] = useState("მიმოხილვა");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const name = `${player.firstName} ${player.lastName}`;
  const attrs: [string, string][] = [
    ["ამპლუა", player.position],
    ["ასაკი", String(player.age)],
    ["ასაკ. ჯგუფი", player.ageGroup],
    ["სიმაღლე", player.heightCm ? `${player.heightCm} სმ` : "—"],
    ["წონა", player.weightKg ? `${player.weightKg} კგ` : "—"],
    ["დონე", player.level],
  ];

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) router.refresh();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <PlayerHeader name={player.firstName} subtitle={`${player.position} · ${player.city}`} email={player.email} />

      <main className="mx-auto max-w-[1180px] px-6 pb-16">
        {/* Cover + identity */}
        <div className={`relative mt-6 overflow-hidden rounded-card border ${T.border}`}>
          <div className="relative h-44 sm:h-52">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={COVER} alt="" className="h-full w-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${dark ? "from-ink-950 via-ink-950/50 to-ink-950/20" : "from-white via-white/50 to-white/10"}`} />
          </div>
          <div className="relative -mt-14 flex flex-wrap items-end gap-5 px-6 pb-6">
            <InitialsAvatar name={name} size={104} rounded="card" className={`border-4 ${dark ? "border-ink-950" : "border-ink-50"}`} />
            <div className="mb-1 flex-1">
              <div className="flex items-center gap-2.5">
                <h1 className={`font-display text-[26px] font-extrabold tracking-tight ${T.h}`}>{name}</h1>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-400 text-ink-950">{Ic.check("h-3 w-3")}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge tone="brand">{player.position}</Badge>
                <Badge tone="neutral">{player.ageGroup}</Badge>
                <span className={`inline-flex items-center gap-1 text-[13px] ${T.muted}`}>{Ic.pin("h-3.5 w-3.5")}{player.city}</span>
                <span className={T.dot}>·</span>
                <span className={`text-[13px] ${T.muted}`}>{player.level}</span>
              </div>
            </div>
            <div className="mb-1 flex items-center gap-2">
              <Link href="/profile/edit" className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.edit("h-4 w-4")} რედაქტირება</Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left */}
          <div>
            <div className={`mb-5 flex gap-1 border-b ${T.border}`}>
              {TABS.map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`relative px-4 py-2.5 text-[14px] font-medium transition-colors ${tab === t ? T.h : T.navIdle}`}>
                  {t === "მედია" ? `მედია (${media.length})` : t === "განაცხადები" ? `განაცხადები (${apps.length})` : t}
                  {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-pill bg-brand-400" />}
                </button>
              ))}
            </div>

            {tab === "მიმოხილვა" && (
              <div className="space-y-6">
                <div className={`rounded-card border p-6 ${T.card}`}>
                  <h3 className={`mb-4 text-[15px] font-bold ${T.h}`}>მახასიათებლები</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                    {attrs.map(([l, v]) => (
                      <div key={l} className={`border-l pl-3 ${T.border}`}>
                        <div className={`text-[12px] uppercase tracking-wide ${T.muted}`}>{l}</div>
                        <div className={`mt-0.5 text-[15px] font-semibold ${T.h}`}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`rounded-card border p-6 ${T.card}`}>
                  <h3 className={`mb-2 text-[15px] font-bold ${T.h}`}>ჩემ შესახებ</h3>
                  <p className={`text-[14px] leading-relaxed ${T.t3}`}>
                    {player.bio || "ბიოგრაფია ჯერ არ დამატებულა. დაამატე რამდენიმე წინადადება შენ შესახებ პარამეტრებში."}
                  </p>
                  <div className={`mt-4 flex items-center gap-2.5 rounded-card border p-3 ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-ink-50"}`}>
                    <div className={`grid h-10 w-10 place-items-center rounded-btn font-display text-[13px] font-bold ${T.square}`}>{player.league.slice(0, 2)}</div>
                    <div className="flex-1"><div className={`text-[13.5px] font-semibold ${T.h}`}>{player.league}</div><div className={`text-[12px] ${T.muted}`}>მიმდინარე ლიგა</div></div>
                    <Badge tone="neutral">აქტიური</Badge>
                  </div>
                </div>
              </div>
            )}

            {tab === "მედია" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.map((m) => (
                  <div key={m.id} className={`group relative aspect-[4/3] overflow-hidden rounded-card border ${T.border}`}>
                    {m.type === "VIDEO" ? (
                      <video src={m.url} className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt={m.caption ?? ""} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />
                    <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink-950/70 text-ink-100">{m.type === "VIDEO" ? Ic.video("h-3.5 w-3.5") : Ic.image("h-3.5 w-3.5")}</span>
                    <button type="button" disabled={pending} onClick={() => startTransition(async () => { await deleteMedia(m.id); router.refresh(); })} className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink-950/70 text-ink-100 opacity-0 transition-opacity hover:bg-danger-500 group-hover:opacity-100">{Ic.trash("h-3.5 w-3.5")}</button>
                    {m.caption && <span className="absolute inset-x-3 bottom-2.5 truncate text-[12.5px] font-medium text-ink-50">{m.caption}</span>}
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={`grid aspect-[4/3] place-items-center rounded-card border border-dashed transition-colors hover:border-brand-500/60 ${dark ? "border-ink-700 text-ink-400 hover:text-brand-300" : "border-ink-300 text-ink-500 hover:text-brand-700"}`}>
                  <span className="text-center"><span className="text-[22px]">{uploading ? "…" : "+"}</span><div className="text-[12.5px] font-medium">{uploading ? "იტვირთება" : "მასალის დამატება"}</div></span>
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" className="hidden" onChange={onFile} />
              </div>
            )}

            {tab === "განაცხადები" && (
              <div className="space-y-3">
                {apps.map((a) => (
                  <div key={a.id} className={`flex items-center gap-4 rounded-card border p-4 transition-colors ${T.card} ${dark ? "hover:border-ink-600" : "hover:border-ink-300"}`}>
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-btn font-display text-[14px] font-bold ${T.square}`}>{a.badge}</div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[15px] font-bold ${T.h}`}>{a.club}</div>
                      <div className={`flex items-center gap-1.5 text-[12.5px] ${T.muted}`}>{Ic.calendar("h-3.5 w-3.5")}{a.date} · {a.league}</div>
                    </div>
                    <Badge tone="brand">გაგზავნილი</Badge>
                    <MatchRing score={a.score} size={46} />
                  </div>
                ))}
                {apps.length === 0 && (
                  <div className={`grid place-items-center rounded-card border border-dashed px-6 py-12 text-center ${dark ? "border-ink-700 bg-ink-900/40" : "border-ink-300 bg-ink-100/60"}`}>
                    <div className={`text-[14px] font-semibold ${T.t2}`}>ჯერ არ გაგიგზავნია განაცხადი</div>
                    <p className={`mt-1 text-[13px] ${T.muted}`}>გადადი <Link href="/dashboard" className={T.brand}>სინჯებზე</Link> და გააგზავნე პირველი განაცხადი.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right rail */}
          <aside className="space-y-5">
            <div className={`rounded-card border p-5 ${T.card}`}>
              <div className="mb-3 flex items-center justify-between">
                <span className={`text-[14px] font-semibold ${T.h}`}>პროფილის სისრულე</span>
                <span className={`font-mono text-[14px] font-bold tabular-nums ${T.brand}`}>{player.completeness}%</span>
              </div>
              <div className={`mb-4 h-2 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${player.completeness}%` }} /></div>
              <p className={`text-[12.5px] leading-relaxed ${T.muted}`}>დაამატე ვიდეო-მასალა — კლუბები 3-ჯერ მეტად უყურებენ სრულ პროფილებს.</p>
              <button type="button" onClick={() => { setTab("მედია"); }} className={`mt-4 w-full rounded-btn border border-brand-500/60 py-2.5 text-[13px] font-medium transition-colors hover:bg-brand-500/10 ${T.brand2}`}>მასალის ატვირთვა</button>
            </div>

            <div className={`rounded-card border p-5 ${T.card}`}>
              <h3 className={`mb-3 text-[14px] font-semibold ${T.h}`}>აქტივობა</h3>
              <div className="space-y-3.5">
                {[["დინამო თბილისმა ნახა შენი პროფილი", "2 სთ წინ"], ["ახალი სინჯი შენს პოზიციაზე", "გუშინ"], ["პროფილი განახლდა", "3 დღის წინ"]].map(([t, d]) => (
                  <div key={t} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    <div><div className={`text-[13px] leading-snug ${T.t2}`}>{t}</div><div className={`text-[11.5px] ${T.faint}`}>{d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
