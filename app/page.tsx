"use client";

import { useState } from "react";
import Link from "next/link";
import { useDark, useT } from "@/components/ui/theme";
import { Logo, ThemeToggle, MatchRing } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";

const STEPS = [
  { n: "01", t: "დარეგისტრირდი", d: "შექმენი ანგარიში წუთებში — უფასოდ, ელ. ფოსტით." },
  { n: "02", t: "შეავსე პროფილი", d: "პოზიცია, ასაკი, ქალაქი, დონე და ვიდეო-მასალა." },
  { n: "03", t: "ნახე თავსებადობა", d: "ალგორითმი მაშინვე გაჩვენებს შენზე მორგებულ კლუბებს." },
  { n: "04", t: "გააგზავნე განაცხადი", d: "დარეგისტრირდი ღია სინჯზე — კლუბი ნახავს შენს პროფილს." },
];
const WEIGHTS = [
  { l: "პოზიციის დამთხვევა", v: 40, w: "w-full" },
  { l: "ასაკობრივი ჯგუფი", v: 25, w: "w-[62%]" },
  { l: "ქალაქის დამთხვევა", v: 20, w: "w-[50%]" },
  { l: "დონე ↔ ლიგა", v: 15, w: "w-[38%]" },
];
const FAQ = [
  { q: "ვინ ქმნის კლუბის ანგარიშს?", a: "კლუბის ანგარიშებს ქმნის Sport Visa-ს ადმინისტრაცია. კლუბი შემდეგ შედის სისტემაში და აქვეყნებს ღია სინჯებს." },
  { q: "როგორ ითვლება თავსებადობა?", a: "ალგორითმი აჯამებს პოზიციის, ასაკობრივი ჯგუფის, ქალაქისა და დონე↔ლიგის შესაბამისობას და გამოსახავს პროცენტულად." },
  { q: "სჭირდება თუ არა კლუბის დადასტურება განაცხადზე?", a: "არა. განაცხადის გაგზავნისთანავე კლუბი ხედავს შენს პროფილს რეგისტრირებულ აპლიკანტთა სიაში." },
];

export default function Landing() {
  const dark = useDark();
  const T = useT();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={`min-w-full font-sans ${T.page}`}>
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {["როგორ მუშაობს", "კლუბებისთვის"].map((l) => (
              <button key={l} type="button" className={`rounded-btn px-3 py-2 text-[13.5px] font-medium transition-colors ${T.navIdle}`}>{l}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className={`rounded-btn px-4 py-2 text-[13.5px] font-medium transition-colors ${dark ? "text-ink-200 hover:bg-ink-800" : "text-ink-700 hover:bg-ink-100"}`}>შესვლა</Link>
            <Link href="/register" className="rounded-btn bg-brand-400 px-4 py-2 text-[13.5px] font-semibold text-ink-950 transition-colors hover:bg-brand-300">რეგისტრაცია</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`relative overflow-hidden border-b ${T.border}`}>
        <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-6 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className={`inline-flex items-center gap-2 rounded-pill border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[12px] font-medium ${T.brand2}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />ქართული ფეხბურთის სკაუტინგ-პლატფორმა
            </span>
            <h1 className={`mt-5 font-display text-[52px] font-extrabold leading-[1.02] tracking-tight ${T.h}`}>
              იპოვე შენი კლუბი.<br /><span className={T.brand}>შენ ითამაშე</span>, დანარჩენს ჩვენ მოვაგვარებთ.
            </h1>
            <p className={`mt-5 max-w-md text-[16px] leading-relaxed ${T.t3}`}>
              შეავსე პროფილი და ჭკვიანი ალგორითმი მაშინვე დაგაკავშირებს იმ კლუბებთან, რომლებსაც სწორედ შენი პოზიცია და დონე სჭირდებათ — ღია სინჯებით.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-btn bg-brand-400 px-6 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500">
                დაიწყე უფასოდ {Ic.arrow("h-4 w-4")}
              </Link>
              <button type="button" className={`inline-flex h-12 items-center gap-2 rounded-btn border px-5 text-[15px] font-medium transition-colors ${dark ? "border-ink-700 text-ink-100 hover:bg-ink-800" : "border-ink-300 text-ink-800 hover:bg-ink-100"}`}>
                {Ic.play(`h-4 w-4 ${T.brand}`)} როგორ მუშაობს
              </button>
            </div>
            <div className={`mt-10 flex flex-wrap gap-8 border-t pt-6 ${T.border}`}>
              {[["2,400+", "რეგისტრირებული მოთამაშე"], ["42", "პარტნიორი კლუბი"], ["180+", "ჩატარებული სინჯი"]].map(([v, l]) => (
                <div key={l}>
                  <div className={`font-mono text-[26px] font-bold tabular-nums ${T.h}`}>{v}</div>
                  <div className={`mt-0.5 text-[12.5px] ${T.muted}`}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className={`relative overflow-hidden rounded-card border ${T.border}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://live.staticflickr.com/8286/7794221892_2db05a6c93_b.jpg" alt="ფეხბურთელი მოედანზე" width={900} height={640} className="h-[440px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-5 flex items-center gap-4 rounded-card border border-ink-700 bg-ink-900/95 p-4 shadow-float backdrop-blur">
              <MatchRing score={92} size={60} />
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-ink-400">შენი საუკეთესო თავსებადობა</div>
                <div className="text-[15px] font-bold text-ink-50">დინამო თბილისი</div>
                <div className="text-[12px] text-ink-400">ეროვნული ლიგა · U-21</div>
              </div>
            </div>
            <div className="absolute -right-3 top-6 rounded-card border border-brand-500/30 bg-brand-500/15 px-3 py-2 text-[12px] font-medium text-brand-200 shadow-pop backdrop-blur">
              +3 ახალი სინჯი
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`border-b ${T.border}`}>
        <div className="mx-auto max-w-[1180px] px-6 py-20">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className={`text-[13px] font-semibold uppercase tracking-wider ${T.brand}`}>როგორ მუშაობს</span>
              <h2 className={`mt-2 font-display text-[34px] font-extrabold tracking-tight ${T.h}`}>მოთამაშედან სინჯამდე — ოთხ ნაბიჯში</h2>
            </div>
            <p className={`max-w-sm text-[14.5px] ${T.muted}`}>დარეგისტრირება უფასოა. პროფილის შევსებისთანავე ხედავ შენზე მორგებულ ღია სინჯებს.</p>
          </div>
          <div className={`grid grid-cols-1 gap-px overflow-hidden rounded-card border sm:grid-cols-2 lg:grid-cols-4 ${dark ? "border-ink-800 bg-ink-800" : "border-ink-200 bg-ink-200"}`}>
            {STEPS.map((s) => (
              <div key={s.n} className={`group p-7 transition-colors ${dark ? "bg-ink-950 hover:bg-ink-900" : "bg-ink-50 hover:bg-white"}`}>
                <div className={`font-mono text-[34px] font-bold transition-colors group-hover:text-brand-500 ${dark ? "text-ink-700" : "text-ink-300"}`}>{s.n}</div>
                <div className={`mt-4 text-[16px] font-bold ${T.h}`}>{s.t}</div>
                <p className={`mt-1.5 text-[13.5px] leading-relaxed ${T.muted}`}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Match algorithm */}
      <section className={`border-b ${T.border}`}>
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <span className={`inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider ${T.brand}`}>{Ic.target("h-4 w-4")}თავსებადობის ალგორითმი</span>
            <h2 className={`mt-3 font-display text-[34px] font-extrabold leading-tight tracking-tight ${T.h}`}>შემთხვევითობის გარეშე. მხოლოდ შესაბამისობა.</h2>
            <p className={`mt-4 max-w-md text-[15px] leading-relaxed ${T.t3}`}>
              ყოველი კლუბისთვის ვითვლით ცალკე ქულას შენი პროფილის მიხედვით. მაღალი პროცენტი ნიშნავს, რომ კლუბს ზუსტად შენნაირი მოთამაშე ეძებს.
            </p>
            <ul className="mt-6 space-y-2.5">
              {["მხოლოდ ღია სინჯების მქონე კლუბები", "დახარისხება თავსებადობით", "რეალურ დროში განახლება"].map((f) => (
                <li key={f} className={`flex items-center gap-2.5 text-[14px] ${T.t2}`}>
                  <span className={`grid h-5 w-5 place-items-center rounded-full bg-brand-500/20 ${T.brand2}`}>{Ic.check("h-3 w-3")}</span>{f}
                </li>
              ))}
            </ul>
          </div>
          <div className={`rounded-card border p-8 ${T.card}`}>
            <div className="mb-6 flex items-center gap-5">
              <MatchRing score={92} size={92} />
              <div>
                <div className={`text-[15px] font-bold ${T.h}`}>დინამო თბილისი</div>
                <div className={`text-[13px] ${T.muted}`}>თავდამსხმელი · თბილისი · U-21</div>
                <div className={`mt-1 text-[12px] font-medium ${T.brand}`}>მაღალი თავსებადობა</div>
              </div>
            </div>
            <div className="space-y-4">
              {WEIGHTS.map((wt) => (
                <div key={wt.l}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]"><span className={T.t3}>{wt.l}</span><span className={`font-mono font-semibold tabular-nums ${T.t2}`}>+{wt.v}</span></div>
                  <div className={`h-2 overflow-hidden rounded-pill ${T.track}`}><div className={`h-full ${wt.w} rounded-pill bg-brand-400`} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clubs band */}
      <section className={`border-b ${T.soft}`}>
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-6 px-6 py-14">
          <div>
            <h3 className={`font-display text-[26px] font-extrabold tracking-tight ${T.h}`}>კლუბი ხარ და მოთამაშეს ეძებ?</h3>
            <p className={`mt-2 max-w-md text-[14.5px] ${T.t3}`}>გამოაქვეყნე ღია სინჯი და მიიღე მორგებული აპლიკანტების სია — თავსებადობით დახარისხებული.</p>
          </div>
          <button type="button" className={`inline-flex h-12 items-center gap-2 rounded-btn border border-brand-500/60 px-6 text-[15px] font-semibold transition-colors hover:bg-brand-500/10 ${T.brand2}`}>
            დაუკავშირდი გუნდს {Ic.arrow("h-4 w-4")}
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className={`border-b ${T.border}`}>
        <div className="mx-auto max-w-[820px] px-6 py-20">
          <h2 className={`mb-8 text-center font-display text-[30px] font-extrabold tracking-tight ${T.h}`}>ხშირად დასმული კითხვები</h2>
          <div className={`divide-y overflow-hidden rounded-card border ${dark ? "divide-ink-800 border-ink-800" : "divide-ink-200 border-ink-200"}`}>
            {FAQ.map((item, i) => (
              <div key={i} className={dark ? "bg-ink-900/40" : "bg-ink-100/50"}>
                <button type="button" onClick={() => setOpen(open === i ? null : i)} className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${dark ? "hover:bg-ink-900" : "hover:bg-ink-100"}`}>
                  <span className={`text-[15px] font-semibold ${T.h}`}>{item.q}</span>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${dark ? "border-ink-700 text-ink-300" : "border-ink-300 text-ink-500"}`}>{open === i ? Ic.minus("h-4 w-4") : Ic.plus("h-4 w-4")}</span>
                </button>
                {open === i && <p className={`px-5 pb-5 text-[14px] leading-relaxed ${T.t3}`}>{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-[1180px] px-6 py-24 text-center">
          <h2 className={`mx-auto max-w-2xl font-display text-[40px] font-extrabold leading-[1.05] tracking-tight ${T.h}`}>შენი შემდეგი კლუბი ერთ განაცხადს გაშორებს.</h2>
          <p className={`mx-auto mt-4 max-w-md text-[16px] ${T.t3}`}>დარეგისტრირდი დღესვე და ნახე, რომელი კლუბები ეძებენ სწორედ შენ.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-btn bg-brand-400 px-7 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 active:bg-brand-500">
              შექმენი პროფილი {Ic.arrow("h-4 w-4")}
            </Link>
            <Link href="/login" className={`inline-flex h-12 items-center rounded-btn border px-6 text-[15px] font-medium transition-colors ${dark ? "border-ink-700 text-ink-100 hover:bg-ink-800" : "border-ink-300 text-ink-800 hover:bg-ink-100"}`}>უკვე გაქვს ანგარიში?</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${T.border}`}>
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-8">
          <Logo />
          <div className={`flex flex-wrap gap-6 text-[13px] ${T.muted}`}>
            {["როგორ მუშაობს", "კლუბებისთვის", "კონფიდენციალურობა", "კონტაქტი"].map((l) => (
              <button key={l} type="button" className={`transition-colors ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>{l}</button>
            ))}
          </div>
          <span className={`text-[12.5px] ${T.faint}`}>© 2026 Sport Visa</span>
        </div>
      </footer>
    </div>
  );
}
