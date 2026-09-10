"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, Coins, Building2, ShieldCheck } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface NavbarProps {
  onMobileSidebarToggle?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/assessments": "Exams & Assessments",
  "/admin/candidates": "Candidate Evaluation",
  "/admin/candidate-logs": "Candidate Lifecycle Logs",
  "/admin/logs": "Exam Credits History",
  "/admin/emails": "Email Audit & Invites",
  "/admin/questions": "Question Bank CMS",
  "/admin/settings": "System Settings",
  "/admin/archive": "Archive & Recycle Bin",
};

export default function Navbar({ onMobileSidebarToggle, isCollapsed, onToggleCollapse }: NavbarProps) {
  const pathname = usePathname();
  const currentTitle = pageTitles[pathname] || "HR Admin Portal";

  const [tenantName, setTenantName] = useState<string>("Client Organization");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [portalTitle, setPortalTitle] = useState<string>("Assessment Portal");
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("banca_admin_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        const name = u.tenant?.name || u.tenantName || "Client Organization";
        setTenantName(name);
        setLogoUrl(u.tenant?.logoUrl || null);
        setPortalTitle(u.tenant?.portalTitle || `${name} Assessment Portal`);
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
    .toUpperCase() || "CO";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="w-full h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Dynamic Client Logo / Monogram & Portal Title */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          {onMobileSidebarToggle && (
            <button
              onClick={onMobileSidebarToggle}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Toggle Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Sidebar Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5 text-blue-600" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          )}

          <Link href="/admin" className="flex items-center space-x-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={tenantName}
                className="h-9 w-auto max-w-[140px] object-contain rounded-lg border border-slate-200/80 p-0.5"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md shadow-blue-500/25 ring-2 ring-blue-100">
                {monogram}
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                {portalTitle}
              </span>
              <span className="text-[10px] font-bold text-blue-600">
                {tenantName}
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex border-l border-slate-200 pl-3">
            <span className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              {currentTitle}
            </span>
          </div>
        </div>

        {/* Right side: White-Label Verified Badge & Live Exam Credits */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-extrabold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dedicated Workspace</span>
          </div>

          {remainingCredits !== null && (
            <Link
              href="/admin/logs"
              title="View Exam Credits & Consumption Ledger"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-extrabold transition cursor-pointer shadow-2xs ${
                remainingCredits <= 10
                  ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                  : remainingCredits <= 50
                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>{remainingCredits.toLocaleString()} Credits</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
