"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { Logo, ThemeToggle, Avatar } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { logout } from "@/app/actions/auth";

const NAV = [
  { href: "/dashboard", label: "სინჯები" },
  { href: "/applications", label: "ჩემი განაცხადები" },
  { href: "/profile", label: "ჩემი პროფილი" },
];

const NOTIFS: [string, string, boolean][] = [
  ["დინამო თბილისიმ თქვენი განაცხადი განიხილა — მიწვეული ხართ სინჯზე", "2 საათის წინ", true],
  ["ახალი სინჯი დაემატა შენს პოზიციაზე — საბურთალო, ნახევარმცველი", "5 საათის წინ", true],
  ["დღეს 17:00-ზე გელოდებათ სასინჯი ვარჯიში — ტორპედო ქუთაისი", "გუშინ", true],
  ["თქვენი პროფილი დაათვალიერა 4-მა კლუბმა ამ კვირაში", "3 დღის წინ", false],
];

export function PlayerHeader({
  name,
  subtitle,
  email,
  avatarN = 12,
}: {
  name: string;
  subtitle?: string;
  email?: string;
  avatarN?: number;
}) {
  const dark = useDark();
  const T = useT();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur ${T.header}`}>
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} className={`rounded-btn px-3 py-2 text-sm font-medium transition-colors ${active ? T.navActive : T.navIdle}`}>
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative">
            <button type="button" onClick={() => setNotifOpen((v) => !v)} className={`relative grid h-9 w-9 place-items-center rounded-btn ${T.iconBtnFlat}`}>
              {Ic.bell("h-[18px] w-[18px]")}
              <span className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${dark ? "bg-brand-400" : "bg-brand-500"}`} />
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className={`absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-card border p-1.5 shadow-pop ${T.card}`}>
                  <div className={`flex items-center justify-between border-b px-3 py-2.5 ${T.border}`}>
                    <p className={`text-[13px] font-semibold ${T.h}`}>შეტყობინებები</p>
                    <span className="rounded-pill border border-brand-500/25 bg-brand-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-300">3 ახალი</span>
                  </div>
                  <div className="py-1">
                    {NOTIFS.map(([txt, ts, unread], i) => (
                      <div key={i} className={`flex gap-2.5 rounded-btn px-3 py-2.5 ${T.hoverBg} ${unread ? "" : "opacity-60"}`}>
                        <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${unread ? (dark ? "bg-brand-400" : "bg-brand-500") : (dark ? "bg-ink-700" : "bg-ink-300")}`} />
                        <div>
                          <p className={`text-[13px] ${unread ? T.t2 : T.t3}`}>{txt}</p>
                          <p className={`mt-0.5 text-[11.5px] ${T.faint}`}>{ts}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/notifications" onClick={() => setNotifOpen(false)} className={`block border-t px-3 py-2.5 text-center text-[13px] font-medium ${T.border} ${T.brand}`}>ყველა შეტყობინება →</Link>
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((v) => !v)} className={`flex items-center gap-2 rounded-btn px-1.5 py-1 transition-colors ${T.hoverBg}`}>
              <span className={`hidden text-[13px] ${T.muted} sm:inline`}>{name}</span>
              <Avatar n={avatarN} size={34} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className={`absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-card border p-1.5 shadow-pop ${T.card}`}>
                  <div className={`border-b px-3 py-2.5 ${T.border}`}>
                    <p className={`text-[13px] font-semibold ${T.h}`}>{name}</p>
                    {subtitle && <p className={`mt-0.5 text-[12px] ${T.muted}`}>{subtitle}</p>}
                  </div>
                  <div className="py-1">
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className={`flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-left text-[13px] font-medium ${T.t2} ${T.hoverBg}`}>
                      {Ic.user(`h-[16px] w-[16px] ${T.faint}`)}ჩემი პროფილი
                    </Link>
                    <Link href="/player-settings" onClick={() => setMenuOpen(false)} className={`flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-left text-[13px] font-medium ${T.t2} ${T.hoverBg}`}>
                      {Ic.gear(`h-[16px] w-[16px] ${T.faint}`)}პარამეტრები
                    </Link>
                  </div>
                  <div className={`border-t pt-1 ${T.border}`}>
                    <form action={logout}>
                      <button type="submit" className={`flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-left text-[13px] font-semibold hover:bg-danger-500/10 ${dark ? "text-danger-400" : "text-danger-600"}`}>
                        {Ic.logout("h-[16px] w-[16px]")}გასვლა
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
