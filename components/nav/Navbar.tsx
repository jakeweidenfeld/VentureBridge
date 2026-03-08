"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/components/providers/UserProvider";
import { createClient } from "@/lib/supabase/client";

const STARTUP_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/matches", label: "Matches" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/profile", label: "Profile" },
];

const VC_LINKS = [
  { href: "/vc/inbox", label: "Deal Inbox" },
  { href: "/vc/browse", label: "Browse" },
  { href: "/vc/portfolio", label: "Portfolio" },
  { href: "/vc/thesis", label: "Thesis" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear local profile caches
    try {
      localStorage.removeItem("vb_startup_profile");
      localStorage.removeItem("vb_vc_thesis");
    } catch {}
    router.push("/login");
  }
  const isVC = user.userType === "vc";
  const links = isVC ? VC_LINKS : STARTUP_LINKS;
  const hasRealName =
    user.displayName !== "My Company" && user.displayName !== "My Fund";

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-10 h-[60px] bg-vb-black/92 backdrop-blur-[12px] border-b border-vb-border">
      <Link
        href="/"
        className="flex items-center gap-2 font-display text-[26px] tracking-[2px] text-vb-text no-underline"
      >
        <span className="w-2 h-2 rounded-full bg-vb-amber animate-vb-pulse" />
        <span>Venture</span>
        <span className="text-vb-blue">Bridge</span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="px-[18px] py-[7px] rounded text-[13px] text-vb-muted hover:text-vb-text hover:border-vb-border border border-transparent transition-all font-medium"
        >
          ← Home
        </Link>

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-[18px] py-[7px] rounded text-[13px] font-medium border border-transparent transition-all ${
              pathname.startsWith(link.href)
                ? "text-vb-text border-vb-border bg-vb-panel"
                : "text-vb-muted hover:text-vb-text hover:border-vb-border"
            }`}
          >
            {link.label}
          </Link>
        ))}

        {!isVC && (
          <Link
            href="/pitch"
            className="px-[18px] py-[7px] rounded text-[13px] bg-vb-blue text-white hover:bg-vb-blue-bright transition-colors font-medium"
          >
            + New Pitch
          </Link>
        )}

        {/* User identity chip — only shown when name is real */}
        {hasRealName && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[12px] font-mono font-medium ml-1 ${
              isVC
                ? "bg-vb-amber/10 border-vb-amber/25 text-vb-amber"
                : "bg-vb-blue/10 border-vb-blue/25 text-vb-blue-bright"
            }`}
          >
            <span>{isVC ? "🏦" : "🚀"}</span>
            {user.displayName}
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="px-[18px] py-[7px] rounded text-[13px] font-medium border border-transparent text-vb-muted hover:text-red-400 hover:border-red-500/30 transition-all ml-1"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
