"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("banca_admin_token");
    if (token) {
      router.push("/admin");
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-3 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Redirecting to HR Admin Portal...</p>
      </div>
    </div>
  );
}
