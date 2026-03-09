import { Navbar } from "@/components/nav/Navbar";
import { Sidebar } from "@/components/nav/Sidebar";
import { UserProvider } from "@/components/providers/UserProvider";
import type { UserContextValue } from "@/components/providers/UserProvider";

const FALLBACK: UserContextValue = {
  userId: "",
  email: "",
  fullName: null,
  userType: "startup",
  companyName: null,
  stage: null,
  primarySector: null,
  fundName: null,
  fundSize: null,
  hqCity: null,
  displayName: "My Company",
  displaySubtitle: "Seed Stage",
};

async function fetchUserProfile(): Promise<UserContextValue> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "your-anon-key-here"
  ) {
    return FALLBACK;
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return FALLBACK;

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type, full_name")
      .eq("id", user.id)
      .single();

    if (!profile) return { ...FALLBACK, userId: user.id, email: user.email ?? "" };

    const base = {
      userId: user.id,
      email: profile.email ?? "",
      fullName: profile.full_name ?? null,
      userType: profile.user_type as "startup" | "vc",
    };

    if (profile.user_type === "startup") {
      const { data: sp } = await supabase
        .from("startup_profiles")
        .select("company_name, current_stage, primary_sector")
        .eq("user_id", user.id)
        .single();

      const name = sp?.company_name ?? profile.full_name ?? "My Startup";
      const sub =
        [sp?.current_stage, sp?.primary_sector]
          .filter(Boolean)
          .map((s) => s!.replace(/-/g, " "))
          .join(" · ") || "Seed Stage";

      return {
        ...FALLBACK,
        ...base,
        companyName: sp?.company_name ?? null,
        stage: sp?.current_stage ?? null,
        primarySector: sp?.primary_sector ?? null,
        displayName: name,
        displaySubtitle: sub,
      };
    } else {
      const { data: vp } = await supabase
        .from("vc_profiles")
        .select("fund_name, fund_size, hq_city")
        .eq("user_id", user.id)
        .single();

      const name = vp?.fund_name ?? profile.full_name ?? "My Fund";
      const sub =
        [vp?.fund_size, vp?.hq_city].filter(Boolean).join(" · ") ||
        "Venture Capital";

      return {
        ...FALLBACK,
        ...base,
        fundName: vp?.fund_name ?? null,
        fundSize: vp?.fund_size ?? null,
        hqCity: vp?.hq_city ?? null,
        displayName: name,
        displaySubtitle: sub,
      };
    }
  } catch {
    return FALLBACK;
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await fetchUserProfile();

  return (
    <UserProvider value={userProfile}>
      <Navbar />
      <div className="flex h-screen pt-[60px]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-vb-black">{children}</main>
      </div>
    </UserProvider>
  );
}
