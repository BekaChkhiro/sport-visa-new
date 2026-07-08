"use client";

import { useActionState, useState } from "react";
import { useDark, useT } from "@/components/ui/theme";
import { PlayerHeader } from "@/components/app/PlayerHeader";
import {
  updateAccount,
  changePassword,
  type FormState,
} from "@/app/actions/player";

const SUBTABS = ["ანგარიში", "შეტყობინებები", "კონფიდენციალურობა"];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  const dark = useDark();
  return (
    <button type="button" onClick={onClick} className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${on ? "bg-brand-400" : dark ? "bg-ink-700" : "bg-ink-300"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

const okBox = "rounded-field border border-brand-500/30 bg-brand-500/10 px-3.5 py-2 text-[13px] text-brand-300";
const errBox = "rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2 text-[13px] text-danger-300";

export function PlayerSettingsScreen({
  firstName,
  lastName,
  email,
}: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  const dark = useDark();
  const T = useT();
  const [sub, setSub] = useState("ანგარიში");
  const [notif, setNotif] = useState({ match: true, viewed: true, remind: true, product: false });
  const [privacy, setPrivacy] = useState({ visible: true, media: true, contact: false });
  const [acc, accAction, accPending] = useActionState<FormState, FormData>(updateAccount, undefined);
  const [pw, pwAction, pwPending] = useActionState<FormState, FormData>(changePassword, undefined);

  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <PlayerHeader name={firstName} email={email} />

      <main className="mx-auto max-w-[1080px] px-6 py-8">
        <h1 className={`font-display text-[26px] font-extrabold tracking-tight ${T.h}`}>პარამეტრები</h1>
        <p className={`mt-1 text-[14px] ${T.muted}`}>მართე ანგარიში, შეტყობინებები და ვინ ხედავს შენს პროფილს</p>

        <div className={`mt-6 flex gap-1 border-b ${T.border}`}>
          {SUBTABS.map((t) => (
            <button key={t} type="button" onClick={() => setSub(t)} className={`relative px-4 py-3 text-[14px] font-medium transition-colors ${sub === t ? T.h : T.navIdle}`}>
              {t}{sub === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-pill bg-brand-400" />}
            </button>
          ))}
        </div>

        <div className="mt-6 max-w-3xl">
          {sub === "ანგარიში" && (
            <div className="space-y-6">
              <form action={accAction} className={`rounded-card border p-6 ${T.card}`}>
                <h3 className={`text-[15px] font-bold ${T.h}`}>ანგარიშის მონაცემები</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>სახელი</span><input name="firstName" className={inputCls} defaultValue={firstName} /></label>
                  <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>გვარი</span><input name="lastName" className={inputCls} defaultValue={lastName} /></label>
                  <label className="block sm:col-span-2"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ელ. ფოსტა</span><input type="email" disabled className={`${inputCls} opacity-60`} defaultValue={email} /></label>
                </div>
                {acc?.error && <div className={`mt-4 ${errBox}`}>{acc.error}</div>}
                {acc?.ok && <div className={`mt-4 ${okBox}`}>მონაცემები განახლდა ✓</div>}
                <div className="mt-4 flex justify-end"><button type="submit" disabled={accPending} className="inline-flex h-10 items-center rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">{accPending ? "ინახება..." : "შენახვა"}</button></div>
              </form>

              <form action={pwAction} className={`rounded-card border p-6 ${T.card}`}>
                <h3 className={`text-[15px] font-bold ${T.h}`}>პაროლის შეცვლა</h3>
                <div className="mt-4 space-y-4">
                  <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>მიმდინარე პაროლი</span><input name="current" type="password" className={inputCls} /></label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ახალი პაროლი</span><input name="next" type="password" className={inputCls} placeholder="მინ. 6 სიმბოლო" /></label>
                    <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>გაიმეორე</span><input name="confirm" type="password" className={inputCls} placeholder="ხელახლა" /></label>
                  </div>
                </div>
                {pw?.error && <div className={`mt-4 ${errBox}`}>{pw.error}</div>}
                {pw?.ok && <div className={`mt-4 ${okBox}`}>პაროლი განახლდა ✓</div>}
                <div className="mt-4 flex justify-end"><button type="submit" disabled={pwPending} className={`inline-flex h-10 items-center rounded-btn border px-5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"} disabled:opacity-50`}>{pwPending ? "..." : "პაროლის განახლება"}</button></div>
              </form>
            </div>
          )}

          {sub === "შეტყობინებები" && (
            <div className={`rounded-card border ${T.card}`}>
              {[
                { k: "match", t: "ახალი მორგებული სინჯი", d: "როცა შენს პროფილს ახალი ღია სინჯი ერგება" },
                { k: "viewed", t: "კლუბმა ნახა პროფილი", d: "როცა კლუბი დაათვალიერებს შენს პროფილს" },
                { k: "remind", t: "სინჯის შეხსენება", d: "სინჯამდე 24 საათით ადრე" },
                { k: "product", t: "პროდუქტის სიახლეები", d: "Sport Visa-ს განახლებები" },
              ].map((r, i) => (
                <div key={r.k} className={`flex items-center justify-between gap-4 px-6 py-4 ${i > 0 ? `border-t ${T.rowBorder}` : ""}`}>
                  <div><div className={`text-[14px] font-medium ${T.h}`}>{r.t}</div><div className={`mt-0.5 text-[12.5px] ${T.muted}`}>{r.d}</div></div>
                  <Toggle on={(notif as Record<string, boolean>)[r.k]} onClick={() => setNotif((n) => ({ ...n, [r.k]: !(n as Record<string, boolean>)[r.k] }))} />
                </div>
              ))}
            </div>
          )}

          {sub === "კონფიდენციალურობა" && (
            <div className="space-y-6">
              <div className={`rounded-card border ${T.card}`}>
                {[
                  { k: "visible", t: "პროფილი ჩანს კლუბებთან", d: "გამორთვისას ვერცერთი კლუბი ვერ იპოვის შენს პროფილს" },
                  { k: "media", t: "ვიდეო-მასალის ჩვენება", d: "კლუბებს შეუძლიათ ნახონ შენი highlight-ები" },
                  { k: "contact", t: "საკონტაქტო ინფო კლუბებისთვის", d: "გააზიარე ელ. ფოსტა მხოლოდ იმ კლუბებთან, სადაც განაცხადი გააგზავნე" },
                ].map((r, i) => (
                  <div key={r.k} className={`flex items-center justify-between gap-4 px-6 py-4 ${i > 0 ? `border-t ${T.rowBorder}` : ""}`}>
                    <div><div className={`text-[14px] font-medium ${T.h}`}>{r.t}</div><div className={`mt-0.5 text-[12.5px] ${T.muted}`}>{r.d}</div></div>
                    <Toggle on={(privacy as Record<string, boolean>)[r.k]} onClick={() => setPrivacy((p) => ({ ...p, [r.k]: !(p as Record<string, boolean>)[r.k] }))} />
                  </div>
                ))}
              </div>
              <div className="rounded-card border border-danger-500/25 bg-danger-500/5 p-5">
                <div className={`text-[14px] font-semibold ${dark ? "text-danger-300" : "text-danger-600"}`}>ანგარიშის წაშლა</div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className={`max-w-sm text-[12.5px] ${T.muted}`}>წაშლისას იშლება პროფილი, მედია და ყველა განაცხადი. მოქმედება შეუქცევადია.</p>
                  <button type="button" className={`inline-flex h-9 items-center rounded-btn border px-3.5 text-[13px] font-medium transition-colors border-danger-500/40 ${dark ? "text-danger-300 hover:bg-danger-500/10" : "text-danger-600 hover:bg-danger-500/10"}`}>ანგარიშის წაშლა</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
