"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleOAuth = async (provider: "google" | "linkedin_oidc") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  };

  return (
    <div className="min-h-screen bg-vb-black flex items-center justify-center px-4">
      {/* Logo */}
      <div className="w-full max-w-[440px]">
        <Link href="/" className="flex items-center gap-2 font-display text-[26px] tracking-[2px] text-vb-text mb-8 justify-center no-underline">
          <span className="w-2 h-2 rounded-full bg-vb-amber animate-vb-pulse" />
          <span>Venture</span><span className="text-vb-blue">Bridge</span>
        </Link>

        <div className="bg-vb-panel border border-vb-border rounded-xl p-8">
          <h1 className="font-display text-[28px] tracking-[1px] mb-6 text-center">Welcome Back</h1>

          {/* OAuth */}
          <div className="flex gap-2.5 mb-4">
            <button
              onClick={() => handleOAuth("google")}
              className="flex-1 py-2.5 bg-vb-navy border border-vb-border rounded-md text-[13px] font-semibold text-vb-text flex items-center justify-center gap-2 hover:border-vb-blue transition-colors"
            >
              <span className="font-bold text-[15px] text-[#4285f4]">G</span> Google
            </button>
            <button
              onClick={() => handleOAuth("linkedin_oidc")}
              className="flex-1 py-2.5 bg-vb-navy border border-vb-border rounded-md text-[13px] font-semibold text-vb-text flex items-center justify-center gap-2 hover:border-vb-blue transition-colors"
            >
              <span className="text-[14px]">in</span> LinkedIn
            </button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-vb-border" />
            <span className="text-[12px] text-vb-muted">or continue with email</span>
            <div className="flex-1 h-px bg-vb-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="founder@company.com"
                className="vb-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="vb-input"
              />
            </div>

            {error && (
              <div className="text-[13px] text-vb-red bg-vb-red/10 border border-vb-red/20 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-vb-blue text-white font-semibold rounded-md hover:bg-vb-blue-bright transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Signing in..." : "Log In →"}
            </button>
          </form>

          <p className="text-center text-[14px] text-vb-text-secondary mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-vb-blue hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
