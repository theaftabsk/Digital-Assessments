"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Coins, ShieldCheck, User } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface NavbarProps {
  onMobileSidebarToggle?: () => void;
  isCollapsed?: boolean;
}

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/assessments": "Exams & Assessments",
  "/admin/candidates": "Candidate Evaluation",
  "/admin/vendors": "Vendors Management",
  "/admin/api-logs": "Vendor API Logs",
  "/admin/candidate-logs": "Candidate Lifecycle Logs",
  "/admin/logs": "Exam Credits History",
  "/admin/emails": "Email Audit & Invites",
  "/admin/questions": "Question Bank CMS",
  "/admin/settings": "System Settings",
  "/admin/archive": "Archive & Recycle Bin",
};

export default function Navbar({ onMobileSidebarToggle }: NavbarProps) {
  const pathname = usePathname();
  const currentTitle = pageTitles[pathname] || "Dashboard";

  const [tenantName, setTenantName] = useState<string>("GreatCampus");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("HR Administrator");
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("banca_admin_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        const name = u.tenant?.name || u.tenantName || "GreatCampus";
        setTenantName(name);
        setLogoUrl(u.tenant?.logoUrl || null);
        setUserName(u.name || "HR Administrator");
        setUserRole(u.role || "ADMIN");
      }
    } catch {
      /* ignore */
    }

    // Fetch credits quota from /api/v1/credits/quota
    const fetchQuota = async () => {
      const token = localStorage.getItem("banca_admin_token");
      if (!token) return;
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/v1/credits/quota`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.credit) {
          setRemainingCredits(data.credit.remainingCredit);
        }
      } catch {
        /* ignore */
      }
    };

    fetchQuota();
  }, []);

  const monogram = tenantName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GC";

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.02)] transition-all">
      <div className="w-full h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        
        {/* Left: Organization Branding & Active Page Apple Pill */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          {/* Mobile Menu Button */}
          {onMobileSidebarToggle && (
            <button
              onClick={onMobileSidebarToggle}
              className="lg:hidden p-2 rounded-xl text-black hover:bg-black/[0.05] transition-colors"
              title="Toggle Navigation Menu"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Org Logo / Monogram */}
          <Link href="/admin" className="flex items-center space-x-2.5 group shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={tenantName}
                className="h-8 w-auto max-w-[130px] object-contain rounded-lg border border-black/[0.06] p-0.5 group-hover:opacity-90 transition"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-black text-white font-black flex items-center justify-center text-xs tracking-tight shadow-sm shadow-black/10 group-hover:scale-[1.02] transition-transform">
                {monogram}
              </div>
            )}

            <span className="text-sm font-black text-black tracking-tight group-hover:opacity-80 transition">
              {tenantName}
            </span>
          </Link>
          
          {/* Apple Liquid Glass Active Page Pill */}
          <div className="hidden md:flex items-center pl-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] border border-black/[0.06] text-black text-xs font-bold tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span>{currentTitle}</span>
            </div>
          </div>
        </div>

        {/* Right side: Workspace, Live Credits & Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Dedicated Workspace Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.06] text-zinc-700 text-[11px] font-bold tracking-tight">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span>Dedicated Workspace</span>
          </div>

          {/* Credits Ledger Pill */}
          {remainingCredits !== null && (
            <Link
              href="/admin/logs"
              title="View Exam Credits & Consumption Ledger"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] text-black text-xs font-bold tracking-tight transition cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-black" />
              <span>{remainingCredits.toLocaleString()} Credits</span>
            </Link>
          )}

          {/* Apple User Profile Avatar & Role */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-black/[0.06]">
            <div className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center tracking-tight shadow-sm">
              {userInitials}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-black text-black tracking-tight leading-none truncate max-w-[120px]">
                {userName}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 tracking-tight leading-tight mt-0.5">
                {userRole === "VENDOR" ? "Vendor Partner" : "System Admin"}
              </span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
