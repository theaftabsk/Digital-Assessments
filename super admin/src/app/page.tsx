"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("superadmin");
  const [password, setPassword] = useState("SuperAdmin@2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pass: password }),
      });

      const data = await res.json();
      if (data.success) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("super_admin_token", data.token);
          localStorage.setItem("super_admin_token", data.token);
        }
        router.push("/tenants");
      } else {
        setError(data.message || "Invalid Super Admin credentials.");
      }
    } catch {
      setError("Network error connecting to backend API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-neutral-900 flex items-center justify-center p-4 relative font-sans selection:bg-black selection:text-white">
      <div className="max-w-[400px] w-full space-y-6">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-black text-white text-base font-bold shadow-md shadow-black/10">
            G
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            GreatCampus
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Super Admin Console & Tenant Authority
          </p>
        </div>

        {/* Login Surface Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-neutral-200/80 rounded-2xl p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-sm font-semibold text-neutral-900">Sign In</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-medium border border-neutral-200/60">
              <ShieldCheck className="w-3 h-3 text-neutral-700" />
              Root Authority
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-9 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl pl-9 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                  placeholder="superadmin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl pl-9 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 mt-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-3 border-t border-neutral-100 text-center text-[11px] text-neutral-400 font-medium">
            Multi-Tenant Exam Credit & Proctoring System
          </div>
        </div>
      </div>
    </div>
  );
}
