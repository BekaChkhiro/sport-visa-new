"use client";

import { useState, type ReactNode } from "react";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";

type Notif = { id: string; type: string; title: string; body: string; time: string; unread: boolean; action: boolean };

const DATA: { g: string; items: Notif[] }[] = [
  { g: "დღეს", items: [
    { id: "c1", type: "apply", title: "ლუკა ბერიძემ გააგზავნა განაცხადი", body: "თავდამსხმელების სელექცია — U-21 · თავსებადობა 92%", time: "18 წთ წინ", unread: true, action: true },
    { id: "c2", type: "apply", title: "ნიკა კვარაცხელია დარეგისტრირდა", body: "ნახევარმცველების ღია სინჯი · თავსებადობა 88%", time: "1 სთ წინ", unread: true, action: true },
    { id: "c3", type: "remind", title: "„მცველი / მეკარე\" სინჯამდე დარჩა 2 დღე", body: "19 ივლისი, 10:00 · რამაზ შენგელიას სტადიონი", time: "3 სთ წინ", unread: true, action: true },
  ]},
  { g: "ამ კვირაში", items: [
    { id: "c4", type: "withdraw", title: "სანდრო აბაშიძემ გააუქმა განაცხადი", body: "თავდამსხმელების სელექცია — U-21", time: "გუშინ", unread: false, action: false },
    { id: "c5", type: "admin", title: "ადმინმა დაამატა ახალი გუნდის წევრი", body: "ნინო სკაუტი დაემატა კლუბს როლით „სკაუტი\"", time: "3 დღის წინ", unread: false, action: false },
  ]},
];

export function ClubNotificationsContent() {
  const dark = useDark();
  const T = useT();
  const [tab, setTab] = useState("ყველა");
  const [read, setRead] = useState<string[]>([]);
  const [allRead, setAllRead] = useState(false);

  const isUnread = (n: Notif) => n.unread && !read.includes(n.id) && !allRead;
  const totalUnread = DATA.flatMap((g) => g.items).filter(isUnread).length;
  const unreadBg = dark ? "bg-brand-500/[0.06]" : "bg-brand-500/[0.05]";
  const iconFor = (t: string): [(c: string) => ReactNode, string] => {
    const m: Record<string, [(c: string) => ReactNode, string]> = {
      apply: [Ic.users, dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700"],
      remind: [Ic.calendar, dark ? "bg-warning-500/15 text-warning-300" : "bg-warning-500/15 text-warning-700"],
      withdraw: [Ic.close, dark ? "bg-ink-800 text-ink-300" : "bg-ink-100 text-ink-600"],
      admin: [Ic.shield, dark ? "bg-iris-500/15 text-iris-300" : "bg-iris-500/15 text-iris-700"],
    };
    return m[t] ?? [Ic.bell, T.square];
  };
  const groups = DATA.map((g) => ({ ...g, items: g.items.filter((n) => tab === "ყველა" || isUnread(n)) })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <div className={`flex gap-1 rounded-pill border p-1 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"}`}>
          {["ყველა", "წაუკითხავი"].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-[13px] font-medium transition-colors ${tab === t ? "bg-brand-400 text-ink-950" : T.navIdle}`}>
              {t}{t === "წაუკითხავი" && totalUnread > 0 && <span className={`font-mono tabular-nums ${tab === t ? "text-ink-950/70" : T.faint}`}>{totalUnread}</span>}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setAllRead(true)} disabled={totalUnread === 0} className={`inline-flex h-9 items-center gap-2 rounded-btn border px-3.5 text-[13px] font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"} disabled:opacity-40 disabled:pointer-events-none`}>{Ic.check("h-4 w-4")} ყველას წაკითხვა</button>
      </div>

      {groups.map((g) => (
        <div key={g.g} className="mb-6">
          <div className={`mb-2 text-[12px] font-semibold uppercase tracking-wider ${T.faint}`}>{g.g}</div>
          <div className={`divide-y overflow-hidden rounded-card border ${dark ? "divide-ink-800/60 border-ink-800" : "divide-ink-100 border-ink-200"}`}>
            {g.items.map((n) => {
              const [icon, cls] = iconFor(n.type);
              const un = isUnread(n);
              return (
                <button key={n.id} type="button" onClick={() => setRead((r) => [...new Set([...r, n.id])])} className={`flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors ${un ? unreadBg : dark ? "bg-ink-900" : "bg-white"} ${dark ? "hover:bg-ink-900/60" : "hover:bg-ink-50"}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-btn ${cls}`}>{icon("h-5 w-5")}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[14px] font-semibold ${T.h}`}>{n.title}</div>
                    <div className={`mt-0.5 text-[13px] ${T.t3}`}>{n.body}</div>
                    <div className={`mt-1.5 flex items-center gap-3 text-[12px] ${T.faint}`}><span>{n.time}</span>{n.action && <span className={`font-medium ${T.brand}`}>ნახვა →</span>}</div>
                  </div>
                  {un && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className={`grid place-items-center rounded-card border border-dashed px-6 py-16 text-center ${dark ? "border-ink-700" : "border-ink-300"}`}>
          <div className={`mb-3 grid h-12 w-12 place-items-center rounded-full ${dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700"}`}>{Ic.check("h-6 w-6")}</div>
          <div className={`text-[14px] font-semibold ${T.h}`}>წაუკითხავი შეტყობინება არ არის</div>
          <p className={`mt-1 text-[13px] ${T.muted}`}>ყველაფერს გაეცანი.</p>
        </div>
      )}
    </div>
  );
}
