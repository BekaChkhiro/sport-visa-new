"use client";

import { useState } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { ThemeToggle } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";

export default function ResetPasswordPage() {
  const dark = useDark();
  const T = useT();
  const [show, setShow] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [done, setDone] = useState(false);
  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;

  const rules = [
    { ok: pw.length >= 8, t: "მინიმუმ 8 სიმბოლო" },
    { ok: /[A-Z]/.test(pw) && /[a-z]/.test(pw), t: "დიდი და პატარა ასო" },
    { ok: /[0-9]/.test(pw), t: "მინიმუმ ერთი ციფრი" },
  ];
  const strength = rules.filter((r) => r.ok).length;
  const match = pw.length > 0 && pw === pw2;
  const canSubmit = strength === 3 && match;
  const bar = ["w-0", "w-1/3", "w-2/3", "w-full"][strength];
  const barColor = strength <= 1 ? "bg-danger-400" : strength === 2 ? "bg-warning-400" : "bg-brand-400";

  return (
    <div className={`relative grid min-h-screen min-w-full grid-cols-1 font-sans lg:grid-cols-2 ${T.page}`}>
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-ink-800 bg-ink-950 lg:block">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-brand-500/12 blur-[110px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-btn bg-brand-400 text-[14px] font-extrabold text-ink-950">SV</span>
            <span className="text-[16px] font-bold tracking-tight text-ink-50">Sport<span className="text-brand-400">Visa</span></span>
          </Link>
          <div>
            <div className="mb-6 grid h-12 w-12 place-items-center rounded-card bg-brand-500/15 text-brand-300">{Ic.shield("h-6 w-6")}</div>
            <h2 className="max-w-md font-display text-[34px] font-extrabold leading-[1.1] tracking-tight text-ink-50">დააყენე ახალი პაროლი და დაბრუნდი მოედანზე.</h2>
            <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-ink-300">აირჩიე ძლიერი პაროლი, რომ შენი პროფილი და განაცხადები დაცული იყოს.</p>
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

          {!done ? (
            <>
              <h1 className={`font-display text-[28px] font-extrabold tracking-tight ${T.h}`}>ახალი პაროლი</h1>
              <p className={`mt-1.5 text-[14px] ${T.muted}`}>დააყენე ახალი პაროლი შენი ანგარიშისთვის.</p>

              <div className="mt-8 space-y-4">
                <label className="block">
                  <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ახალი პაროლი</span>
                  <div className="relative">
                    <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} className={`${inputCls} pr-11`} placeholder="მინ. 8 სიმბოლო" />
                    <button type="button" onClick={() => setShow(!show)} className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-btn p-1.5 ${dark ? "text-ink-400 hover:text-ink-100" : "text-ink-400 hover:text-ink-900"}`}>{Ic.eye("h-4 w-4")}</button>
                  </div>
                  {pw.length > 0 && (
                    <div className="mt-2.5">
                      <div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}><div className={`h-full ${bar} rounded-pill transition-all ${barColor}`} /></div>
                      <div className="mt-2 space-y-1">
                        {rules.map((r) => (
                          <div key={r.t} className={`flex items-center gap-1.5 text-[12px] ${r.ok ? T.brand : T.faint}`}>
                            <span className={`grid h-3.5 w-3.5 place-items-center rounded-full ${r.ok ? "bg-brand-400 text-ink-950" : `border ${dark ? "border-ink-600" : "border-ink-300"}`}`}>{r.ok && Ic.check("h-2.5 w-2.5")}</span>{r.t}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </label>
                <label className="block">
                  <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>გაიმეორე პაროლი</span>
                  <input type={show ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} className={`${inputCls} ${pw2.length > 0 && !match ? "border-danger-500/60" : ""}`} placeholder="ხელახლა" />
                  {pw2.length > 0 && !match && <span className="mt-1 block text-xs text-danger-500">პაროლები არ ემთხვევა</span>}
                </label>

                <button type="button" disabled={!canSubmit} onClick={() => setDone(true)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-400 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500 disabled:opacity-40 disabled:pointer-events-none">
                  პაროლის განახლება {Ic.arrow("h-4 w-4")}
                </button>
              </div>
              <p className={`mt-6 text-center text-[13.5px] ${T.muted}`}>გაგახსენდა პაროლი? <Link href="/login" className={`font-semibold ${T.brand}`}>შესვლა</Link></p>
            </>
          ) : (
            <div className="text-center">
              <div className={`mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full ${dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700"}`}>{Ic.check("h-7 w-7")}</div>
              <h1 className={`font-display text-[26px] font-extrabold tracking-tight ${T.h}`}>პაროლი განახლდა</h1>
              <p className={`mx-auto mt-2 max-w-xs text-[14px] leading-relaxed ${T.muted}`}>შენი პაროლი წარმატებით შეიცვალა. ახლა შეგიძლია ახალი პაროლით შეხვიდე.</p>
              <Link href="/login" className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-400 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300">შესვლა {Ic.arrow("h-4 w-4")}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
