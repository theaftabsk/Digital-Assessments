"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  BookOpen,
  Mail,
  Settings as SettingsIcon,
  LogOut,
  Building2,
  ShieldCheck,
  Briefcase,
  Archive,
  Terminal,
  RotateCcw,
  Coins,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [userName, setUserName] = useState<string>("HR Administrator");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("banca_admin_token");
    const userStr = localStorage.getItem("banca_admin_user");

    if (!token && pathname !== "/admin/login") {
      setIsAuthenticated(false);
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setUserRole(u.role || "ADMIN");
          setUserName(u.name || "HR Administrator");
        } catch {
          // ignore
        }
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("banca_admin_token");
    localStorage.removeItem("banca_admin_user");
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="font-semibold text-xs text-zinc-500 tracking-tight">Verifying Session...</p>
        </div>
      </div>
    );
  }

  const isVendor = userRole === "VENDOR";

  const navItems = isVendor
    ? [
        {
          href: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/admin/assessments",
          label: "Assessments",
          icon: FileText,
        },
        {
          href: "/admin/candidates",
          label: "Candidates",
          icon: UserCheck,
        },
        {
          href: "/admin/emails",
          label: "Invitations",
          icon: Mail,
        },
      ]
    : [
        {
          href: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/admin/assessments",
          label: "Assessments",
          icon: FileText,
        },
        {
          href: "/admin/candidates",
          label: "Candidates",
          icon: UserCheck,
        },
        {
          href: "/admin/vendors",
          label: "Vendors",
          icon: Building2,
        },
        {
          href: "/admin/api-logs",
          label: "Vendor API Logs",
          icon: Terminal,
        },
        {
          href: "/admin/candidate-logs",
          label: "Lifecycle Logs",
          icon: RotateCcw,
        },
        {
          href: "/admin/logs",
          label: "Credits History",
          icon: Coins,
        },
        {
          href: "/admin/emails",
          label: "Email Audit",
          icon: Mail,
        },
        {
          href: "/admin/questions",
          label: "Question Bank",
          icon: BookOpen,
        },
        {
          href: "/admin/archive",
          label: "Archive & Bin",
          icon: Archive,
        },
        {
          href: "/admin/settings",
          label: "Settings",
          icon: SettingsIcon,
        },
      ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* Fixed Apple Liquid Glass Header */}
      <Navbar
        onMobileSidebarToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        isCollapsed={isCollapsed}
      />

      <div className="flex-1 flex w-full relative">
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs lg:hidden transition-opacity"
          ></div>
        )}

        {/* Dedicated Fixed Left Sidebar */}
        <aside
          className={`fixed top-16 left-0 bottom-0 z-40 bg-white/80 backdrop-blur-2xl border-r border-black/[0.06] flex flex-col justify-between overflow-y-auto shrink-0 transition-all duration-300 ${
            isCollapsed ? "lg:w-20 w-64" : "w-64"
          } ${mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className={isCollapsed ? "p-3 space-y-3" : "p-4 space-y-4"}>
            {/* Minimalist User Pill */}
            {!isCollapsed ? (
              <div className="p-3 rounded-2xl bg-black/[0.03] border border-black/[0.05] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                  {isVendor ? <Briefcase size={14} /> : <ShieldCheck size={14} />}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 truncate">
                    {isVendor ? "Vendor Account" : "HR Administrator"}
                  </p>
                  <p className="text-xs font-black text-black truncate tracking-tight">{userName}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-9 h-9 rounded-xl bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-black">
                  {isVendor ? <Briefcase size={16} /> : <ShieldCheck size={16} />}
                </div>
              </div>
            )}

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full rounded-2xl text-left text-xs font-bold transition-all flex items-center ${
                      isCollapsed ? "p-3 justify-center" : "px-3.5 py-2.5 gap-3"
                    } ${
                      isActive
                        ? "bg-black text-white shadow-sm font-black"
                        : "text-zinc-600 hover:text-black hover:bg-black/[0.04]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-zinc-500"}`} />
                    {!isCollapsed && <span className="tracking-tight">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Controls: Collapse Toggle & Sign Out */}
          <div className={`border-t border-black/[0.06] space-y-2 ${isCollapsed ? "p-3" : "p-4"}`}>
            {/* Collapse Toggle Button (at bottom of sidebar as per specification) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className={`hidden lg:flex items-center text-zinc-500 hover:text-black hover:bg-black/[0.04] rounded-2xl transition font-bold text-xs cursor-pointer w-full ${
                isCollapsed ? "p-3 justify-center" : "px-3.5 py-2.5 gap-3"
              }`}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 shrink-0" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 shrink-0" />
                  <span className="tracking-tight">Collapse Sidebar</span>
                </>
              )}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className={`w-full rounded-2xl border border-black/[0.06] bg-white/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-zinc-600 transition-colors font-bold text-xs flex items-center cursor-pointer ${
                isCollapsed ? "p-3 justify-center" : "px-3.5 py-2.5 justify-center gap-2"
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="tracking-tight">Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main
          className={`flex-1 pt-16 min-h-screen w-full transition-all duration-300 ${
            isCollapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
        >
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
