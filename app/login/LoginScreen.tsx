"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { ThemeToggle } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { login, type AuthState } from "@/app/actions/auth";

const QUICK = [
  { label: "მოთამაშე", email: "player1@sportvisa.ge" },
  { label: "კლუბი", email: "dinamo@sportvisa.ge" },
  { label: "ადმინი", email: "admin@sportvisa.ge" },
];
const QUICK_PW = "password123";

export function LoginScreen() {
  const dark = useDark();
  const T = useT();
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    login,
    undefined,
  );
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [view, setView] = useState<"login" | "forgot" | "sent">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;

  return (
    <div className={`relative grid min-h-screen min-w-full grid-cols-1 font-sans lg:grid-cols-2 ${T.page}`}>
      {/* Brand panel — stays dark */}
      <div className="relative hidden overflow-hidden border-r border-ink-800 bg-ink-950 lg:block">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-brand-500/12 blur-[110px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-btn bg-brand-400 text-[14px] font-extrabold text-ink-950">SV</span>
            <span className="text-[16px] font-bold tracking-tight text-ink-50">Sport<span className="text-brand-400">Visa</span></span>
          </Link>
          <div>
            <h2 className="max-w-md font-display text-[36px] font-extrabold leading-[1.08] tracking-tight text-ink-50">
              მოგესალმებით.<br />მოედანი გელოდება.
            </h2>
            <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-ink-300">
              შედი ანგარიშზე და ნახე შენზე მორგებული ახალი ღია სინჯები.
            </p>
            <div className="mt-8 space-y-3">
              {[["92%", "დინამო თბილისი", "ეროვნული ლიგა"], ["78%", "საბურთალო", "ლიგა 2"]].map(([s, c, l]) => (
                <div key={c} className="flex items-center gap-3 rounded-card border border-ink-800 bg-ink-900/60 p-3 backdrop-blur">
                  <span className="font-mono text-[15px] font-bold tabular-nums text-brand-400">{s}</span>
                  <div className="h-8 w-px bg-ink-800" />
                  <div><div className="text-[13.5px] font-semibold text-ink-100">{c}</div><div className="text-[11.5px] text-ink-400">{l}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[12.5px] text-ink-500">© 2026 Sport Visa</div>
        </div>
      </div>

      <div className="absolute right-5 top-5 z-10"><ThemeToggle /></div>

      {/* Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-btn bg-brand-400 text-[14px] font-extrabold text-ink-950">SV</span>
            <span className={`text-[16px] font-bold tracking-tight ${T.h}`}>Sport<span className="text-brand-400">Visa</span></span>
          </Link>

          {view === "login" && (
            <>
              <h1 className={`font-display text-[28px] font-extrabold tracking-tight ${T.h}`}>შესვლა</h1>
              <p className={`mt-1.5 text-[14px] ${T.muted}`}>გააგრძელე შენი პროფილითა და სინჯებით.</p>

              <form action={formAction} className="mt-8 space-y-4">
                {state?.error && (
                  <div className="rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-[13px] text-danger-300">
                    {state.error}
                  </div>
                )}
                <label className="block">
                  <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ელ. ფოსტა</span>
                  <input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@sportvisa.ge" />
                </label>
                <label className="block">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className={`text-[13px] font-medium ${T.t2}`}>პაროლი</span>
                    <button type="button" onClick={() => setView("forgot")} className={`text-[12.5px] font-medium ${T.brand}`}>დაგავიწყდა?</button>
                  </div>
                  <div className="relative">
                    <input name="password" type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} pr-11`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShow(!show)} className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-btn p-1.5 ${dark ? "text-ink-400 hover:text-ink-100" : "text-ink-400 hover:text-ink-900"}`}>{Ic.eye("h-4 w-4")}</button>
                  </div>
                </label>

                <button type="button" onClick={() => setRemember(!remember)} className="flex items-center gap-2.5 text-left">
                  <span className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors ${remember ? "border-brand-400 bg-brand-400 text-ink-950" : dark ? "border-ink-600" : "border-ink-300"}`}>{remember && Ic.check("h-3 w-3")}</span>
                  <span className={`text-[13px] ${T.t3}`}>დამიმახსოვრე</span>
                </button>

                <button type="submit" disabled={isPending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-400 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 disabled:opacity-50">
                  {isPending ? "შესვლა..." : <>შესვლა {Ic.arrow("h-4 w-4")}</>}
                </button>
              </form>

              {process.env.NODE_ENV !== "production" && (
                <div className="mt-6">
                  <div className="mb-2.5 flex items-center gap-3">
                    <div className={`h-px flex-1 ${dark ? "bg-ink-800" : "bg-ink-200"}`} />
                    <span className={`text-[11px] ${T.faint}`}>სწრაფი სატესტო შესვლა</span>
                    <div className={`h-px flex-1 ${dark ? "bg-ink-800" : "bg-ink-200"}`} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK.map((q) => (
                      <button
                        key={q.email}
                        type="button"
                        onClick={() => { setEmail(q.email); setPassword(QUICK_PW); }}
                        className={`rounded-btn border px-2 py-2 text-[12px] font-medium transition-colors ${T.chipIdle}`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className={`mt-6 text-center text-[13.5px] ${T.muted}`}>
                არ გაქვს ანგარიში? <Link href="/register" className={`font-semibold ${T.brand}`}>დარეგისტრირდი</Link>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <button type="button" onClick={() => setView("login")} className={`mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors ${T.t3}`}>
                {Ic.arrow("h-3.5 w-3.5 rotate-180")}უკან
              </button>
              <h1 className={`font-display text-[28px] font-extrabold tracking-tight ${T.h}`}>პაროლის აღდგენა</h1>
              <p className={`mt-1.5 text-[14px] ${T.muted}`}>შეიყვანე ელ. ფოსტა და გამოგიგზავნით აღდგენის ბმულს.</p>
              <div className="mt-8 space-y-4">
                <label className="block">
                  <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ელ. ფოსტა</span>
                  <input type="email" className={inputCls} placeholder="you@sportvisa.ge" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                </label>
                <button type="button" onClick={() => setView("sent")} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-400 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500">
                  ბმულის გაგზავნა {Ic.arrow("h-4 w-4")}
                </button>
              </div>
            </>
          )}

          {view === "sent" && (
            <>
              <div className={`grid h-12 w-12 place-items-center rounded-btn ${dark ? "bg-brand-400/15" : "bg-brand-100"}`}>{Ic.check(`h-5 w-5 ${T.brand}`)}</div>
              <h1 className={`mt-5 font-display text-[24px] font-extrabold tracking-tight ${T.h}`}>ბმული გაიგზავნა</h1>
              <p className={`mt-1.5 text-[14px] leading-relaxed ${T.muted}`}>
                აღდგენის ინსტრუქცია გაიგზავნა მისამართზე <span className={`font-semibold ${T.t2}`}>{resetEmail}</span>. შეამოწმე ინბოქსი.
              </p>
              <button type="button" onClick={() => setView("login")} className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-400 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500">
                შესვლაზე დაბრუნება
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
