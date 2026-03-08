"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserType = "startup" | "vc";

function SignupForm() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as UserType) ?? "startup";

  const [userType, setUserType] = useState<UserType>(initialType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, user_type: userType },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const handleOAuth = async (provider: "google" | "linkedin_oidc") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { user_type: userType },
      },
    });
  };

  if (success) {
    return (
      <div className="text-center max-w-sm mx-auto">
        <div className="text-5xl mb-5">📬</div>
        <h2 className="font-display text-[32px] tracking-[1px] mb-3">Check Your Inbox</h2>
        <p className="text-vb-text-secondary leading-[1.6] mb-6">
          We sent a confirmation link to <strong className="text-vb-text">{email}</strong>. Click it to activate your account and start matching.
        </p>
        <Link href="/login" className="text-vb-blue hover:underline text-[14px]">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px] mx-auto">
      <Link href="/" className="flex items-center gap-2 font-display text-[26px] tracking-[2px] text-vb-text mb-8 justify-center no-underline">
        <span className="w-2 h-2 rounded-full bg-vb-amber animate-vb-pulse" />
        <span>Venture</span><span className="text-vb-blue">Bridge</span>
      </Link>

      <div className="bg-vb-panel border border-vb-border rounded-xl p-8">
        <h1 className="font-display text-[28px] tracking-[1px] mb-6 text-center">Create Your Account</h1>

        {/* User type toggle */}
        <div className="flex gap-0 mb-6 bg-vb-navy rounded-md p-1">
          {(["startup", "vc"] as UserType[]).map((type) => (
            <button
              key={type}
              onClick={() => setUserType(type)}
              className={`flex-1 py-2 text-center rounded text-[14px] font-semibold transition-all ${
                userType === type
                  ? type === "startup"
                    ? "bg-vb-blue text-white"
                    : "bg-vb-amber text-vb-black"
                  : "text-vb-muted"
              }`}
            >
              {type === "startup" ? "🚀 Startup" : "🏦 Investor"}
            </button>
          ))}
        </div>

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

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="vb-label">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder={userType === "startup" ? "Jane Founder" : "John Investor"}
              className="vb-input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="vb-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={userType === "startup" ? "founder@startup.com" : "partner@fund.vc"}
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
              minLength={8}
              placeholder="Min. 8 characters"
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
            className={`w-full py-3 font-semibold rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1 ${
              userType === "startup"
                ? "bg-vb-blue text-white hover:bg-vb-blue-bright"
                : "bg-vb-amber text-vb-black hover:bg-amber-400"
            }`}
          >
            {loading ? "Creating account..." : `Sign Up as ${userType === "startup" ? "Startup" : "Investor"} →`}
          </button>
        </form>

        <p className="text-center text-[13px] text-vb-muted mt-4 leading-[1.5]">
          By signing up you agree to our{" "}
          <a href="#" className="text-vb-blue hover:underline">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="text-vb-blue hover:underline">Privacy Policy</a>.
        </p>
        <p className="text-center text-[14px] text-vb-text-secondary mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-vb-blue hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-vb-black flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-vb-muted font-mono text-sm">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
