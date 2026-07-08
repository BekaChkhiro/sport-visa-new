"use client";

import { useActionState, useState } from "react";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";
import { changePassword, type FormState } from "@/app/actions/player";

const SUBTABS = ["ანგარიში", "შეტყობინებები", "გუნდი"];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  const dark = useDark();
  return (
    <button type="button" onClick={onClick} className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${on ? "bg-brand-400" : dark ? "bg-ink-700" : "bg-ink-300"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function ClubSettingsContent({ email, clubName }: { email: string; clubName: string }) {
  const dark = useDark();
  const T = useT();
  const [sub, setSub] = useState("ანგარიში");
  const [notif, setNotif] = useState({ apply: true, remind: true, digest: false, product: true });
  const [pw, pwAction, pwPending] = useActionState<FormState, FormData>(changePassword, undefined);
  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;

  const MEMBERS = [
    { n: 33, name: "კლუბის მენეჯერი", email, role: "მთავარი ადმინი", tone: "brand", joined: "აქტიური", you: true },
  ];
  const roleBadge = (tone: string) => {
    const m: Record<string, string> = {
      brand: dark ? "bg-brand-500/12 text-brand-300 border-brand-500/25" : "bg-brand-500/12 text-brand-700 border-brand-500/25",
      accent: dark ? "bg-accent-500/12 text-accent-300 border-accent-500/25" : "bg-accent-500/12 text-accent-700 border-accent-500/25",
      neutral: dark ? "bg-ink-800 text-ink-300 border-ink-700" : "bg-ink-100 text-ink-600 border-ink-200",
    };
    return m[tone];
  };

  return (
    <div>
      <div className={`mb-6 flex gap-1 border-b ${T.border}`}>
        {SUBTABS.map((t) => (
          <button key={t} type="button" onClick={() => setSub(t)} className={`relative px-4 py-3 text-[14px] font-medium transition-colors ${sub === t ? T.h : T.navIdle}`}>
            {t}{sub === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-pill bg-brand-400" />}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {sub === "ანგარიში" && (
          <div className="space-y-6">
            <div className={`rounded-card border p-6 ${T.card}`}>
              <h3 className={`text-[15px] font-bold ${T.h}`}>ანგარიშის მონაცემები</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>კლუბი</span><input className={`${inputCls} opacity-60`} disabled defaultValue={clubName} /></label>
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ელ. ფოსტა</span><input type="email" className={`${inputCls} opacity-60`} disabled defaultValue={email} /></label>
              </div>
              <p className={`mt-3 text-[12.5px] ${T.muted}`}>კლუბის სახელი და მონაცემები იმართება <span className={T.brand}>კლუბის პროფილში</span>.</p>
            </div>

            <form action={pwAction} className={`rounded-card border p-6 ${T.card}`}>
              <h3 className={`text-[15px] font-bold ${T.h}`}>პაროლის შეცვლა</h3>
              <div className="mt-4 space-y-4">
                <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>მიმდინარე პაროლი</span><input name="current" type="password" className={inputCls} /></label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ახალი პაროლი</span><input name="next" type="password" className={inputCls} placeholder="მინ. 6 სიმბოლო" /></label>
                  <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>გაიმეორე</span><input name="confirm" type="password" className={inputCls} placeholder="ხელახლა" /></label>
                </div>
              </div>
              {pw?.error && <div className="mt-4 rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2 text-[13px] text-danger-300">{pw.error}</div>}
              {pw?.ok && <div className="mt-4 rounded-field border border-brand-500/30 bg-brand-500/10 px-3.5 py-2 text-[13px] text-brand-300">პაროლი განახლდა ✓</div>}
              <div className="mt-4 flex justify-end"><button type="submit" disabled={pwPending} className={`inline-flex h-10 items-center rounded-btn border px-5 text-sm font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"} disabled:opacity-50`}>{pwPending ? "..." : "პაროლის განახლება"}</button></div>
            </form>
          </div>
        )}

        {sub === "შეტყობინებები" && (
          <div className={`rounded-card border ${T.card}`}>
            {[
              { k: "apply", t: "ახალი განაცხადი", d: "როცა მოთამაშე დარეგისტრირდება შენს სინჯზე" },
              { k: "remind", t: "სინჯის შეხსენება", d: "სინჯამდე 24 საათით ადრე" },
              { k: "digest", t: "ყოველკვირეული შეჯამება", d: "აპლიკანტების და აქტივობის მოკლე ანგარიში" },
              { k: "product", t: "პროდუქტის სიახლეები", d: "Sport Visa-ს განახლებები და ფუნქციები" },
            ].map((r, i) => (
              <div key={r.k} className={`flex items-center justify-between gap-4 px-6 py-4 ${i > 0 ? `border-t ${T.rowBorder}` : ""}`}>
                <div><div className={`text-[14px] font-medium ${T.h}`}>{r.t}</div><div className={`mt-0.5 text-[12.5px] ${T.muted}`}>{r.d}</div></div>
                <Toggle on={(notif as Record<string, boolean>)[r.k]} onClick={() => setNotif((n) => ({ ...n, [r.k]: !(n as Record<string, boolean>)[r.k] }))} />
              </div>
            ))}
          </div>
        )}

        {sub === "გუნდი" && (
          <div className={`rounded-card border ${T.card}`}>
            <div className={`flex items-center justify-between border-b px-6 py-4 ${T.border}`}>
              <div>
                <h3 className={`text-[15px] font-bold ${T.h}`}>გუნდის წევრები</h3>
                <p className={`mt-0.5 text-[12.5px] ${T.muted}`}>ახალ წევრს ამატებს კლუბის ადმინი</p>
              </div>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.plus("h-4 w-4")} მოწვევა</button>
            </div>
            {MEMBERS.map((m, i) => (
              <div key={m.n} className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? `border-t ${T.rowBorder}` : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.pravatar.cc/80?img=${m.n}`} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`truncate text-[14px] font-medium ${T.h}`}>{m.name}</span>
                    {m.you && <span className={`rounded-pill px-1.5 py-0.5 text-[10px] font-semibold ${dark ? "bg-ink-800 text-ink-300" : "bg-ink-100 text-ink-600"}`}>შენ</span>}
                  </div>
                  <div className={`truncate text-[12.5px] ${T.muted}`}>{m.email}</div>
                </div>
                <span className={`hidden items-center whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold sm:inline-flex ${roleBadge(m.tone)}`}>{m.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
