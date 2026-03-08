"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STARTUP_NAV = [
  { href: "/dashboard", icon: "◈", label: "Dashboard" },
  { href: "/matches", icon: "⬡", label: "Fund Matches" },
  { href: "/pipeline", icon: "◇", label: "My Pipeline" },
  { href: "/pitch", icon: "▷", label: "Submit Pitch" },
  { href: "/profile", icon: "○", label: "Startup Profile" },
];

const VC_NAV = [
  { href: "/vc/inbox", icon: "◈", label: "Deal Inbox" },
  { href: "/vc/browse", icon: "⬡", label: "Browse Startups" },
  { href: "/vc/portfolio", icon: "◇", label: "Portfolio" },
  { href: "/vc/thesis", icon: "◈", label: "Fund Thesis" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside className="w-[220px] flex-shrink-0 bg-vb-navy border-r border-vb-border flex flex-col py-6 overflow-y-auto">
      {/* General */}
      <div className="mb-7">
        <div className="font-mono text-[9px] font-medium tracking-[2px] text-vb-muted uppercase px-5 mb-1.5">
          General
        </div>
        <Link
          href="/"
          className="sidebar-item"
        >
          <span className="text-[15px]">⌂</span> Home
        </Link>
      </div>

      {/* Startup View */}
      <div className="mb-7">
        <div className="font-mono text-[9px] font-medium tracking-[2px] text-vb-muted uppercase px-5 mb-1.5">
          Startup View
        </div>
        {STARTUP_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}
          >
            <span className="text-[15px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* VC View */}
      <div className="mb-7">
        <div className="font-mono text-[9px] font-medium tracking-[2px] text-vb-muted uppercase px-5 mb-1.5">
          VC View
        </div>
        {VC_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}
          >
            <span className="text-[15px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
