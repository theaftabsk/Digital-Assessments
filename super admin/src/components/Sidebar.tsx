"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  KeyRound,
  ChevronsUpDown,
  LogOut,
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
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Customers",
      href: "/tenants",
      icon: Building2,
    },
    {
      label: "Audit Ledger",
      href: "/ledger",
      icon: Receipt,
    },
    {
      label: "Security & Keys",
      href: "/profile",
      icon: KeyRound,
    },
  ];

  return (
    <aside className="w-[235px] bg-[#FAFAFA] border-r border-neutral-200/80 flex flex-col justify-between shrink-0 min-h-screen font-sans text-neutral-900 select-none">
      {/* Top Workspace Selector */}
      <div>
        <div className="p-3.5 border-b border-neutral-200/70 flex items-center justify-between hover:bg-neutral-100/70 transition cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
              G
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-neutral-900 truncate leading-tight">GreatCampus</p>
              <p className="text-[11px] text-neutral-400 font-medium leading-none mt-0.5">Super Admin</p>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition ${
                  isActive
                    ? "bg-neutral-200/80 text-neutral-900 font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-medium"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-neutral-900" : "text-neutral-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User Row */}
      <div className="p-3 border-t border-neutral-200/70 flex items-center justify-between bg-[#FAFAFA]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center shrink-0">
            SA
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-neutral-800 truncate">
              superadmin@greatcampus
            </p>
            <p className="text-[10px] text-neutral-400 font-medium leading-none">Root Authority</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
