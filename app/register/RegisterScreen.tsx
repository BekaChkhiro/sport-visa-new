"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { ThemeToggle, MatchRing } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { registerPlayer, type AuthState } from "@/app/actions/auth";

export function RegisterScreen() {
  const dark = useDark();
  const T = useT();
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    registerPlayer,
    undefined,
  );
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(true);
  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;

  return (
    <div className={`relative grid min-h-screen min-w-full grid-cols-1 font-sans lg:grid-cols-2 ${T.page}`}>
      {/* Brand panel — photo */}
      <div className="relative hidden overflow-hidden border-r border-ink-800 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://live.staticflickr.com/8286/7794221892_2db05a6c93_b.jpg" alt="" width={900} height={800} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/70 via-ink-950/25 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-btn bg-brand-400 text-[14px] font-extrabold text-ink-950">SV</span>
            <span className="text-[16px] font-bold tracking-tight text-ink-50">Sport<span className="text-brand-400">Visa</span></span>
          </Link>
          <div>
            <div className="mb-8 inline-flex items-center gap-4 rounded-card border border-ink-700 bg-ink-900/90 p-4 shadow-float backdrop-blur">
              <MatchRing score={92} size={54} />
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-ink-400">შენი საუკეთესო თავსებადობა</div>
                <div className="text-[15px] font-bold text-ink-50">დინამო თბილისი</div>
                <div className="text-[12px] text-ink-400">ეროვნული ლიგა · U-21</div>
              </div>
            </div>
            <h2 className="max-w-md font-display text-[34px] font-extrabold leading-tight tracking-tight text-ink-50">
              შემოუერთდი <span className="text-brand-400">2,400+</span> მოთამაშეს, ვინც უკვე ეძებს კლუბს.
            </h2>
            <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-ink-300">
              შექმენი პროფილი და ალგორითმი მაშინვე გაჩვენებს იმ კლუბებს, რომლებსაც შენი პოზიცია სჭირდებათ.
            </p>
          </div>
          <div className="flex gap-8 border-t border-ink-800 pt-6">
            {[["42", "პარტნიორი კლუბი"], ["180+", "ღია სინჯი"], ["უფასო", "რეგისტრაცია"]].map(([v, l]) => (
              <div key={l}><div className="font-mono text-[20px] font-bold tabular-nums text-ink-50">{v}</div><div className="text-[12px] text-ink-400">{l}</div></div>
            ))}
          </div>
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
          <h1 className={`font-display text-[28px] font-extrabold tracking-tight ${T.h}`}>შექმენი ანგარიში</h1>
          <p className={`mt-1.5 text-[14px] ${T.muted}`}>დაიწყე უფასოდ — მოთამაშის პროფილი წუთებში.</p>

          <form action={formAction} className="mt-8 space-y-4">
            {state?.error && (
              <div className="rounded-field border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-[13px] text-danger-300">
                {state.error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>სახელი</span><input name="firstName" required className={inputCls} placeholder="გიორგი" /></label>
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>გვარი</span><input name="lastName" required className={inputCls} placeholder="მაისურაძე" /></label>
            </div>
            <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ელ. ფოსტა</span><input name="email" type="email" required className={inputCls} placeholder="you@sportvisa.ge" /></label>
            <label className="block">
              <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>პაროლი</span>
              <div className="relative">
                <input name="password" type={show ? "text" : "password"} required className={`${inputCls} pr-11`} placeholder="მინ. 6 სიმბოლო" />
                <button type="button" onClick={() => setShow(!show)} className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-btn p-1.5 ${dark ? "text-ink-400 hover:text-ink-100" : "text-ink-400 hover:text-ink-900"}`}>{Ic.eye("h-4 w-4")}</button>
              </div>
            </label>

            <button type="button" onClick={() => setAgree(!agree)} className="flex items-start gap-2.5 text-left">
              <span className={`mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors ${agree ? "border-brand-400 bg-brand-400 text-ink-950" : dark ? "border-ink-600" : "border-ink-300"}`}>{agree && Ic.check("h-3 w-3")}</span>
              <span className={`text-[12.5px] leading-relaxed ${T.muted}`}>ვეთანხმები <span className={T.brand}>მომსახურების პირობებსა</span> და <span className={T.brand}>კონფიდენციალურობის პოლიტიკას</span>.</span>
            </button>

            <button type="submit" disabled={!agree || isPending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-400 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 disabled:opacity-40 disabled:pointer-events-none">
              {isPending ? "იქმნება..." : <>რეგისტრაცია {Ic.arrow("h-4 w-4")}</>}
            </button>
          </form>

          <p className={`mt-6 text-center text-[13.5px] ${T.muted}`}>
            უკვე გაქვს ანგარიში? <Link href="/login" className={`font-semibold ${T.brand}`}>შესვლა</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
