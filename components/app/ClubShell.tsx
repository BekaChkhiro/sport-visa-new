"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { ThemeToggle } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { logout } from "@/app/actions/auth";

const NAV = [
  { href: "/club", label: "მთავარი", icon: Ic.building },
  { href: "/club/trials", label: "ჩემი სინჯები", icon: Ic.calendar },
  { href: "/club/applicants", label: "აპლიკანტები", icon: Ic.users },
  { href: "/club/profile", label: "კლუბის პროფილი", icon: Ic.shield },
  { href: "/club/settings", label: "პარამეტრები", icon: Ic.gear },
];

export function ClubShell({
  clubName,
  league,
  email,
  title,
  subtitle,
  actions,
  children,
}: {
  clubName: string;
  league: string;
  email: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const dark = useDark();
  const T = useT();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const badge = clubName.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");

  function isActive(href: string) {
    if (href === "/club") return pathname === "/club";
    return pathname.startsWith(href);
  }

  return (
    <div className={`flex min-h-screen min-w-full font-sans ${T.page}`}>
      {/* Sidebar */}
      <aside className={`hidden shrink-0 flex-col border-r p-4 transition-[width] duration-200 lg:flex ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-white"} ${collapsed ? "w-[76px]" : "w-60"}`}>
        <Link href="/club" className={`flex items-center gap-2 px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-btn bg-brand-400 text-[14px] font-extrabold text-ink-950">SV</span>
          {!collapsed && <span className={`text-[15px] font-bold tracking-tight ${T.h}`}>Sport<span className={T.brand}>Visa</span></span>}
        </Link>
        <div className={`mt-3 flex items-center gap-3 rounded-card border p-3 ${T.card} ${collapsed ? "justify-center" : ""}`}>
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-btn bg-brand-500/15 font-display text-[13px] font-bold ${T.brand2}`}>{badge}</div>
          {!collapsed && <div className="min-w-0"><div className={`truncate text-[13.5px] font-semibold ${T.h}`}>{clubName}</div><div className={`text-[11.5px] ${T.muted}`}>{league}</div></div>}
        </div>
        <nav className="mt-4 space-y-1">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} title={collapsed ? n.label : undefined} className={`flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13.5px] font-medium transition-colors ${collapsed ? "justify-center px-0" : ""} ${active ? T.navActive : dark ? "text-ink-400 hover:bg-ink-900 hover:text-ink-100" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900"}`}>
                <span className={active ? T.brand : ""}>{n.icon("h-[18px] w-[18px]")}</span>{!collapsed && n.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" onClick={() => setCollapsed((v) => !v)} className={`mt-auto mb-2 flex items-center gap-2 rounded-btn px-3 py-2.5 text-[12.5px] font-medium transition-colors ${dark ? "text-ink-400 hover:bg-ink-900 hover:text-ink-100" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900"} ${collapsed ? "justify-center px-0" : ""}`}>
          {Ic.chevron(`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`)}{!collapsed && "ჩაკეცვა"}
        </button>
        <div className="relative">
          {acctOpen && !collapsed && (
            <div className={`absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-card border py-1 shadow-pop ${T.card}`}>
              <Link href="/club/settings" className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium ${dark ? "text-ink-200 hover:bg-ink-800" : "text-ink-700 hover:bg-ink-100"}`}>{Ic.gear("h-4 w-4")}პარამეტრები</Link>
              <form action={logout}><button type="submit" className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium hover:bg-danger-500/10 ${dark ? "text-danger-400" : "text-danger-600"}`}>{Ic.logout("h-4 w-4")}გასვლა</button></form>
            </div>
          )}
          <button type="button" onClick={() => setAcctOpen((v) => !v)} className={`flex w-full items-center gap-3 rounded-card border p-3 text-left transition-colors ${T.card} ${dark ? "hover:bg-ink-900" : "hover:bg-ink-50"} ${collapsed ? "justify-center" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/80?img=33" alt="" className="h-[34px] w-[34px] shrink-0 rounded-full object-cover" />
            {!collapsed && <><div className="min-w-0 flex-1"><div className={`truncate text-[12.5px] font-medium ${T.t1}`}>კლუბის მენეჯერი</div><div className={`truncate text-[11px] ${T.muted}`}>{email}</div></div>{Ic.chevron(`h-3.5 w-3.5 shrink-0 ${T.faint} transition-transform ${acctOpen ? "-rotate-90" : "rotate-90"}`)}</>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <header className={`flex h-16 items-center justify-between border-b px-6 ${T.border}`}>
          <div>
            <h1 className={`font-display text-[20px] font-bold tracking-tight ${T.h}`}>{title}</h1>
            {subtitle && <p className={`text-[12.5px] ${T.muted}`}>{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle bordered={false} />
            {actions}
          </div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
