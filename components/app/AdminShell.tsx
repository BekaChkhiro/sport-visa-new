"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDark, useT } from "@/components/ui/theme";
import { ThemeToggle } from "@/components/ui/kit";
import { Ic } from "@/components/ui/icons";
import { logout } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "მიმოხილვა", icon: Ic.menu },
  { href: "/admin/clubs", label: "კლუბები", icon: Ic.shield },
  { href: "/admin/players", label: "მოთამაშეები", icon: Ic.user },
  { href: "/admin/trials", label: "სინჯები", icon: Ic.calendar },
  { href: "/admin/moderation", label: "მოდერაცია", icon: Ic.flag },
  { href: "/admin/settings", label: "პარამეტრები", icon: Ic.gear },
];

export function AdminShell({
  email,
  title,
  subtitle,
  actions,
  moderationCount = 0,
  children,
}: {
  email: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  moderationCount?: number;
  children: React.ReactNode;
}) {
  const dark = useDark();
  const T = useT();
  const pathname = usePathname();
  const [acctOpen, setAcctOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className={`flex min-h-screen min-w-full font-sans ${T.page}`}>
      {/* Sidebar */}
      <aside className={`hidden w-60 shrink-0 flex-col border-r p-4 lg:flex lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${dark ? "border-ink-800 bg-ink-950" : "border-ink-200 bg-white"}`}>
        <Link href="/admin" className="flex items-center gap-2 px-2 py-2">
          <span className="grid h-7 w-7 place-items-center rounded-btn bg-brand-400 text-[14px] font-extrabold text-ink-950">SV</span>
          <span className={`text-[15px] font-bold tracking-tight ${T.h}`}>Sport<span className={T.brand}>Visa</span></span>
        </Link>
        <div className={`mt-3 flex items-center gap-3 rounded-card border p-3 ${T.card}`}>
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-btn ${dark ? "bg-iris-500/15 text-iris-300" : "bg-iris-500/15 text-iris-700"}`}>{Ic.shield("h-4 w-4")}</div>
          <div className="min-w-0"><div className={`truncate text-[13.5px] font-semibold ${T.h}`}>ადმინ პანელი</div><div className={`text-[11.5px] ${T.muted}`}>Sport Visa</div></div>
        </div>
        <nav className="mt-4 space-y-1">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} className={`flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13.5px] font-medium transition-colors ${active ? T.navActive : dark ? "text-ink-400 hover:bg-ink-900 hover:text-ink-100" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900"}`}>
                <span className={active ? T.brand : ""}>{n.icon("h-[18px] w-[18px]")}</span>
                <span className="flex-1 text-left">{n.label}</span>
                {n.href === "/admin/moderation" && moderationCount > 0 && <span className={`rounded-pill px-1.5 py-0.5 text-[10px] font-bold ${dark ? "bg-warning-500/20 text-warning-300" : "bg-warning-500/20 text-warning-700"}`}>{moderationCount}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="relative mt-auto">
          {acctOpen && (
            <div className={`absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-card border py-1 shadow-pop ${T.card}`}>
              <Link href="/admin/settings" className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium ${dark ? "text-ink-200 hover:bg-ink-800" : "text-ink-700 hover:bg-ink-100"}`}>{Ic.gear("h-4 w-4")}პარამეტრები</Link>
              <form action={logout}><button type="submit" className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium hover:bg-danger-500/10 ${dark ? "text-danger-400" : "text-danger-600"}`}>{Ic.logout("h-4 w-4")}გასვლა</button></form>
            </div>
          )}
          <button type="button" onClick={() => setAcctOpen((v) => !v)} className={`flex w-full items-center gap-3 rounded-card border p-3 text-left transition-colors ${T.card} ${dark ? "hover:bg-ink-900" : "hover:bg-ink-50"}`}>
            <span className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full font-display text-[13px] font-bold ${dark ? "bg-iris-500/15 text-iris-300" : "bg-iris-500/15 text-iris-700"}`}>{(email[0] ?? "A").toUpperCase()}</span>
            <div className="min-w-0 flex-1"><div className={`truncate text-[12.5px] font-medium ${T.t1}`}>ადმინისტრატორი</div><div className={`truncate text-[11px] ${T.muted}`}>{email}</div></div>
            {Ic.chevron(`h-3.5 w-3.5 shrink-0 ${T.faint} transition-transform ${acctOpen ? "-rotate-90" : "rotate-90"}`)}
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
