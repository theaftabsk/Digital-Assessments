"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  ShieldCheck,
  LogOut,
  Coins,
  ChevronRight,
  KeyRound,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("super_admin_token");
      localStorage.removeItem("super_admin_token");
      router.push("/");
    }
  };

  const navItems = [
    {
      label: "Dashboard Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Tenants & Credits",
      href: "/tenants",
      icon: Building2,
    },
    {
      label: "Credit Audit Ledger",
      href: "/ledger",
      icon: Receipt,
    },
    {
      label: "Profile & Security",
      href: "/profile",
      icon: KeyRound,
    },
  ];

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen shadow-2xs">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              SUPER ADMIN
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Tenant Credit Engine</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3.5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Root Authority Active</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">1 Exam Start = 1 Credit Rule Enforced</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
