"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { MatchRing } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { PlayerHeader } from "@/components/app/PlayerHeader";
import { withdrawApplication } from "@/app/actions/player";

export type AppItem = {
  id: string;
  trialId: string;
  club: string;
  badge: string;
  ct: string;
  league: string;
  title: string;
  date: string;
  place: string;
  score: number;
  group: string;
  status: string;
};

const TABS = ["ყველა", "აქტიური", "წარსული"];

export function ApplicationsScreen({
  email,
  firstName,
  items,
  summary,
}: {
  email: string;
  firstName: string;
  items: AppItem[];
  summary: { total: number; active: number; past: number; avg: number };
}) {
  const dark = useDark();
  const T = useT();
  const router = useRouter();
  const [tab, setTab] = useState("ყველა");
  const [confirm, setConfirm] = useState<AppItem | null>(null);
  const [withdrawn, setWithdrawn] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const list = items.filter((a) => tab === "ყველა" || a.group === tab);
  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      "გაგზავნილი": dark ? "bg-accent-500/12 text-accent-300 border-accent-500/25" : "bg-accent-500/12 text-accent-700 border-accent-500/25",
      "გაუქმებული": dark ? "bg-ink-800 text-ink-400 border-ink-700" : "bg-ink-100 text-ink-500 border-ink-200",
      "გასული": dark ? "bg-ink-800 text-ink-400 border-ink-700" : "bg-ink-100 text-ink-500 border-ink-200",
    };
    return m[s] ?? m["გასული"];
  };
  const tone = (t: string) => {
    const m: Record<string, string> = {
      brand: dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700",
      accent: dark ? "bg-accent-500/15 text-accent-300" : "bg-accent-500/15 text-accent-700",
      iris: dark ? "bg-iris-500/15 text-iris-300" : "bg-iris-500/15 text-iris-700",
      flame: dark ? "bg-flame-500/15 text-flame-300" : "bg-flame-500/15 text-flame-700",
    };
    return m[t] ?? T.square;
  };

  function doWithdraw(a: AppItem) {
    startTransition(async () => {
      await withdrawApplication(a.trialId);
      setWithdrawn((w) => [...w, a.id]);
      setConfirm(null);
      router.refresh();
    });
  }

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <PlayerHeader name={firstName} email={email} />

      <main className="mx-auto max-w-[1080px] px-6 py-8">
        <div className="mb-6">
          <h1 className={`font-display text-[26px] font-extrabold tracking-tight ${T.h}`}>ჩემი განაცხადები</h1>
          <p className={`mt-1 text-[14px] ${T.muted}`}>თვალი ადევნე შენს განაცხადებს და მართე ისინი სინჯამდე</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([["სულ", String(summary.total), false], ["აქტიური", String(summary.active), true], ["წარსული", String(summary.past), false], ["საშ. match", `${summary.avg}%`, false]] as [string, string, boolean][]).map(([l, v, acc]) => (
            <div key={l} className={`rounded-card border p-4 ${T.card}`}>
              <div className={`font-mono text-[24px] font-bold tabular-nums ${acc ? T.brand : T.h}`}>{v}</div>
              <div className={`mt-0.5 text-[12px] ${T.muted}`}>{l}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div className={`flex gap-1 rounded-pill border p-1 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"}`}>
            {TABS.map((t) => {
              const cnt = t === "ყველა" ? items.length : items.filter((a) => a.group === t).length;
              return (
                <button key={t} type="button" onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-[13px] font-medium transition-colors ${tab === t ? "bg-brand-400 text-ink-950" : T.navIdle}`}>
                  {t}<span className={`font-mono tabular-nums ${tab === t ? "text-ink-950/70" : T.faint}`}>{cnt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {list.map((a) => {
            const wd = withdrawn.includes(a.id);
            const canWithdraw = a.group === "აქტიური" && !wd;
            const status = wd ? "გაუქმებული" : a.status;
            return (
              <div key={a.id} className={`flex flex-wrap items-center gap-4 rounded-card border p-5 transition-colors ${T.card} ${dark ? "hover:border-ink-600" : "hover:border-ink-300"} ${wd ? "opacity-70" : ""}`}>
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-btn font-display text-[15px] font-bold ${tone(a.ct)}`}>{a.badge}</div>
                <Link href={`/trial/${a.trialId}`} className="min-w-[200px] flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`text-[15px] font-bold ${T.h}`}>{a.club}</span>
                    <span className={`inline-flex items-center whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge(status)}`}>{status}</span>
                  </div>
                  <div className={`text-[13px] ${T.t3}`}>{a.title}</div>
                  <div className={`mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] ${T.muted}`}>
                    <span className="inline-flex items-center gap-1.5">{Ic.calendar("h-3.5 w-3.5")}{a.date}</span>
                    <span className="inline-flex items-center gap-1.5">{Ic.pin("h-3.5 w-3.5")}{a.place}</span>
                    <span className={T.dot}>·</span><span>{a.league}</span>
                  </div>
                </Link>
                <MatchRing score={a.score} size={48} />
                <div className="flex items-center gap-2">
                  <Link href={`/trial/${a.trialId}`} className={`inline-flex h-9 items-center rounded-btn border px-3.5 text-[13px] font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>დეტალები</Link>
                  {canWithdraw && (
                    <button type="button" onClick={() => setConfirm(a)} className={`inline-flex h-9 items-center rounded-btn px-3.5 text-[13px] font-medium transition-colors ${dark ? "text-danger-300 hover:bg-danger-500/10" : "text-danger-600 hover:bg-danger-500/10"}`}>გაუქმება</button>
                  )}
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className={`grid place-items-center rounded-card border border-dashed px-6 py-16 text-center ${dark ? "border-ink-700" : "border-ink-300"}`}>
              <div className={`mb-3 grid h-12 w-12 place-items-center rounded-full ${T.square}`}>{Ic.calendar("h-6 w-6")}</div>
              <div className={`text-[14px] font-semibold ${T.h}`}>ამ კატეგორიაში განაცხადი არ არის</div>
              <p className={`mt-1 text-[13px] ${T.muted}`}>ნახე რეკომენდებული სინჯები და გააგზავნე პირველი განაცხადი.</p>
              <Link href="/dashboard" className="mt-4 inline-flex h-10 items-center rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">სინჯების ნახვა</Link>
            </div>
          )}
        </div>
      </main>

      {confirm && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${T.overlay}`} onClick={() => setConfirm(null)}>
          <div className={`w-full max-w-sm rounded-card border p-6 shadow-float ${T.card}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-btn ${dark ? "bg-danger-500/15 text-danger-300" : "bg-danger-500/15 text-danger-600"}`}>{Ic.close("h-5 w-5")}</div>
                <h3 className={`text-[16px] font-bold ${T.h}`}>განაცხადის გაუქმება</h3>
              </div>
              <button type="button" onClick={() => setConfirm(null)} className={`rounded-btn p-1.5 ${T.iconBtnFlat}`}>{Ic.close("h-5 w-5")}</button>
            </div>
            <p className={`text-[14px] leading-relaxed ${T.muted}`}>„{confirm.club}"-ის სინჯზე შენი განაცხადი გაუქმდება და კლუბი აღარ დაინახავს შენს პროფილს. მოგვიანებით ხელახლა შეგიძლია განაცხადის გაგზავნა.</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setConfirm(null)} className={`flex-1 rounded-btn border py-2.5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"}`}>დახურვა</button>
              <button type="button" disabled={pending} onClick={() => doWithdraw(confirm)} className="flex-1 rounded-btn bg-danger-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger-400 disabled:opacity-50">{pending ? "..." : "განაცხადის გაუქმება"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
