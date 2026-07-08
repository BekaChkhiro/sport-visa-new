"use client";

import { useState, type ReactNode } from "react";
import { useDark, useT } from "@/components/ui/theme";
import { Ic } from "@/components/ui/icons";
import { PlayerHeader } from "@/components/app/PlayerHeader";

type Notif = { id: string; type: string; title: string; body: string; time: string; unread: boolean; action: boolean };

const DATA: { g: string; items: Notif[] }[] = [
  { g: "დღეს", items: [
    { id: "n1", type: "invite", title: "დინამო თბილისი გიწვევს სინჯზე", body: "თავდამსხმელების სელექცია — U-21 · 8 ივლისი", time: "18 წთ წინ", unread: true, action: true },
    { id: "n2", type: "view", title: "საბურთალომ ნახა შენი პროფილი", body: "ნახევარმცველების ღია სინჯზე შენი განაცხადი განიხილეს", time: "2 სთ წინ", unread: true, action: true },
    { id: "n3", type: "match", title: "3 ახალი სინჯი შენს პროფილს ერგება", body: "საშუალო თავსებადობა 74% · ნახე რეკომენდაციები", time: "4 სთ წინ", unread: true, action: true },
  ]},
  { g: "ამ კვირაში", items: [
    { id: "n4", type: "remind", title: "სინჯამდე დარჩა 2 დღე", body: "დინამო თბილისი · 8 ივლისი, 11:00 · მ. მესხის სტ.", time: "გუშინ", unread: false, action: true },
    { id: "n5", type: "view", title: "დინამო ბათუმმა ნახა შენი პროფილი", body: "ახალგაზრდული შემადგენლობა U-19", time: "3 დღის წინ", unread: false, action: false },
  ]},
  { g: "ადრე", items: [
    { id: "n6", type: "match", title: "შენი პროფილი 4-მა კლუბმა ნახა", body: "ბოლო კვირის შეჯამება", time: "1 კვირის წინ", unread: false, action: false },
  ]},
];

export function PlayerNotificationsScreen({ email }: { email: string }) {
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
      invite: [Ic.trophy, dark ? "bg-brand-500/15 text-brand-300" : "bg-brand-500/15 text-brand-700"],
      view: [Ic.eye, dark ? "bg-accent-500/15 text-accent-300" : "bg-accent-500/15 text-accent-700"],
      match: [Ic.bolt, dark ? "bg-iris-500/15 text-iris-300" : "bg-iris-500/15 text-iris-700"],
      remind: [Ic.calendar, dark ? "bg-warning-500/15 text-warning-300" : "bg-warning-500/15 text-warning-700"],
    };
    return m[t] ?? [Ic.bell, T.square];
  };

  const groups = DATA.map((g) => ({ ...g, items: g.items.filter((n) => tab === "ყველა" || isUnread(n)) })).filter((g) => g.items.length > 0);

  return (
    <div className={`min-h-screen min-w-full font-sans ${T.page}`}>
      <PlayerHeader name="შეტყობინებები" email={email} />

      <main className="mx-auto max-w-[860px] px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`font-display text-[26px] font-extrabold tracking-tight ${T.h}`}>შეტყობინებები</h1>
            <p className={`mt-1 text-[14px] ${T.muted}`}>{totalUnread > 0 ? `${totalUnread} წაუკითხავი შეტყობინება` : "ყველა შეტყობინება წაკითხულია"}</p>
          </div>
          <button type="button" onClick={() => setAllRead(true)} disabled={totalUnread === 0} className={`inline-flex h-9 items-center gap-2 rounded-btn border px-3.5 text-[13px] font-medium transition-colors ${dark ? "border-ink-700 text-ink-200 hover:bg-ink-800" : "border-ink-200 text-ink-700 hover:bg-ink-100"} disabled:opacity-40 disabled:pointer-events-none`}>{Ic.check("h-4 w-4")} ყველას წაკითხვა</button>
        </div>

        <div className="mb-5 flex items-center">
          <div className={`flex gap-1 rounded-pill border p-1 ${dark ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"}`}>
            {["ყველა", "წაუკითხავი"].map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-[13px] font-medium transition-colors ${tab === t ? "bg-brand-400 text-ink-950" : T.navIdle}`}>
                {t}{t === "წაუკითხავი" && totalUnread > 0 && <span className={`font-mono tabular-nums ${tab === t ? "text-ink-950/70" : T.faint}`}>{totalUnread}</span>}
              </button>
            ))}
          </div>
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
                      <div className={`mt-1.5 flex items-center gap-3 text-[12px] ${T.faint}`}>
                        <span>{n.time}</span>
                        {n.action && <span className={`font-medium ${T.brand}`}>ნახვა →</span>}
                      </div>
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
            <p className={`mt-1 text-[13px] ${T.muted}`}>ყველაფერს გაეცანი — გენიალურია.</p>
          </div>
        )}
      </main>
    </div>
  );
}
