"use client";

import { useState } from "react";
import { useDark, useT } from "@/components/ui/theme";
import { InitialsAvatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";

export type AdminUser = { n: number; name: string; email: string; role: string; tone: string; you: boolean };

const SUBTABS = ["ზოგადი", "match-ალგორითმი", "ადმინები"];

export function AdminSettingsContent({ admins }: { admins: AdminUser[] }) {
  const dark = useDark();
  const T = useT();
  const [sub, setSub] = useState("match-ალგორითმი");
  const [w, setW] = useState({ pos: 40, age: 25, city: 20, level: 15 });
  const total = w.pos + w.age + w.city + w.level;
  const inputCls = `w-full h-11 rounded-field border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ${T.input}`;
  const bump = (k: keyof typeof w, d: number) => setW((s) => ({ ...s, [k]: Math.max(0, Math.min(100, s[k] + d)) }));
  const stepBtn = dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100";
  const WROWS: [keyof typeof w, string, string][] = [
    ["pos", "პოზიციის დამთხვევა", "თუ მოთამაშის პოზიცია ემთხვევა კლუბის საჭიროებას"],
    ["age", "ასაკობრივი ჯგუფი", "ასაკი ხვდება სინჯის ასაკობრივ ჯგუფში"],
    ["city", "ქალაქის დამთხვევა", "მოთამაშე და კლუბი ერთ ქალაქშია"],
    ["level", "დონე ↔ ლიგა", "მოთამაშის დონე შეესაბამება კლუბის ლიგას"],
  ];
  const roleBadge = (t: string) => t === "iris"
    ? (dark ? "bg-iris-500/12 text-iris-300 border-iris-500/25" : "bg-iris-500/12 text-iris-700 border-iris-500/25")
    : (dark ? "bg-accent-500/12 text-accent-300 border-accent-500/25" : "bg-accent-500/12 text-accent-700 border-accent-500/25");

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
        {sub === "ზოგადი" && (
          <div className={`rounded-card border p-6 ${T.card}`}>
            <h3 className={`text-[15px] font-bold ${T.h}`}>პლატფორმის მონაცემები</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>პლატფორმის სახელი</span><input className={inputCls} defaultValue="Sport Visa" /></label>
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>ენა</span>
                <div className="relative"><select className={`${inputCls} appearance-none pr-10`}><option className={dark ? "bg-ink-900" : "bg-white"}>ქართული</option><option className={dark ? "bg-ink-900" : "bg-white"}>English</option></select><span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${T.muted}`}>{Ic.chevronDown("h-4 w-4")}</span></div>
              </label>
              <label className="block"><span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>დროის სარტყელი</span><input className={inputCls} defaultValue="GMT+4 (თბილისი)" /></label>
            </div>
            <div className="mt-4 flex justify-end"><button type="button" className="inline-flex h-10 items-center rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">შენახვა</button></div>
          </div>
        )}

        {sub === "match-ალგორითმი" && (
          <div className="space-y-5">
            <div className={`flex items-start gap-2.5 rounded-card border p-4 ${dark ? "border-info-500/25 bg-info-500/8 text-info-200" : "border-info-500/25 bg-info-500/8 text-info-700"}`}>
              <span className="mt-0.5">{Ic.bolt("h-4 w-4")}</span>
              <span className="text-[12.5px]">ეს წონები განსაზღვრავს, როგორ ითვლება მოთამაშესა და კლუბს შორის თავსებადობის პროცენტი. ჯამი უნდა იყოს 100.</span>
            </div>
            <div className={`rounded-card border ${T.card}`}>
              {WROWS.map(([k, l, d], i) => (
                <div key={k} className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? `border-t ${T.rowBorder}` : ""}`}>
                  <div className="min-w-0 flex-1"><div className={`text-[14px] font-medium ${T.h}`}>{l}</div><div className={`mt-0.5 text-[12.5px] ${T.muted}`}>{d}</div></div>
                  <div className="hidden w-28 sm:block"><div className={`h-1.5 overflow-hidden rounded-pill ${T.track}`}><div className="h-full rounded-pill bg-brand-400" style={{ width: `${w[k]}%` }} /></div></div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => bump(k, -5)} className={`grid h-8 w-8 place-items-center rounded-btn border transition-colors ${stepBtn}`}>{Ic.minus("h-4 w-4")}</button>
                    <span className={`w-10 text-center font-mono text-[15px] font-bold tabular-nums ${T.h}`}>{w[k]}</span>
                    <button type="button" onClick={() => bump(k, 5)} className={`grid h-8 w-8 place-items-center rounded-btn border transition-colors ${stepBtn}`}>{Ic.plus("h-4 w-4")}</button>
                  </div>
                </div>
              ))}
              <div className={`flex items-center justify-between border-t px-6 py-4 ${T.border}`}>
                <span className={`text-[13px] font-semibold ${T.h}`}>ჯამი</span>
                <span className={`inline-flex items-center gap-2 font-mono text-[16px] font-bold tabular-nums ${total === 100 ? T.brand : dark ? "text-danger-300" : "text-danger-600"}`}>{total === 100 && Ic.check("h-4 w-4")}{total}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setW({ pos: 40, age: 25, city: 20, level: 15 })} className={`text-[13px] font-medium ${T.muted} ${dark ? "hover:text-ink-100" : "hover:text-ink-900"}`}>ნაგულისხმევზე დაბრუნება</button>
              <button type="button" disabled={total !== 100} className="inline-flex h-10 items-center rounded-btn bg-brand-400 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-40 disabled:pointer-events-none">წონების შენახვა</button>
            </div>
          </div>
        )}

        {sub === "ადმინები" && (
          <div className={`rounded-card border ${T.card}`}>
            <div className={`flex items-center justify-between border-b px-6 py-4 ${T.border}`}>
              <div><h3 className={`text-[15px] font-bold ${T.h}`}>ადმინისტრატორები</h3><p className={`mt-0.5 text-[12.5px] ${T.muted}`}>{admins.length} ადმინი პლატფორმის მართვაზე წვდომით</p></div>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">{Ic.plus("h-4 w-4")} ადმინის დამატება</button>
            </div>
            {admins.map((a, i) => (
              <div key={a.email} className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? `border-t ${T.rowBorder}` : ""}`}>
                <InitialsAvatar name={a.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className={`truncate text-[14px] font-medium ${T.h}`}>{a.name}</span>{a.you && <span className={`rounded-pill px-1.5 py-0.5 text-[10px] font-semibold ${dark ? "bg-ink-800 text-ink-300" : "bg-ink-100 text-ink-600"}`}>შენ</span>}</div>
                  <div className={`truncate text-[12.5px] ${T.muted}`}>{a.email}</div>
                </div>
                <span className={`hidden items-center whitespace-nowrap rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold sm:inline-flex ${roleBadge(a.tone)}`}>{a.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
