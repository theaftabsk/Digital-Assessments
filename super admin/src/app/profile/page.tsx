"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

export default function SuperAdminProfilePage() {
  const [username, setUsername] = useState("superadmin");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username.trim()) {
      setErrorMsg("Username cannot be empty.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("New Password and Confirm Password do not match.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    setSaving(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/auth/update-credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Super Admin credentials updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(data.message || "Failed to update credentials.");
      }
    } catch {
      setErrorMsg("Network error connecting to backend server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-neutral-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Minimal Navigation Bar */}
        <header className="h-14 px-8 flex items-center justify-between border-b border-neutral-200/70 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-neutral-400">Super Admin Console</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-semibold">Security & Keys</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition">Docs</a>
            <a href="#" className="hover:text-neutral-900 transition">Need help?</a>
            <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center">
              SA
            </div>
          </div>
        </header>

        <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Security & Credentials
            </h1>
            <p className="text-xs text-neutral-500 font-normal mt-0.5">
              Manage master credentials, username, and authentication keys for the Super Admin Root Console.
            </p>
          </div>

          <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-3 pb-5 border-b border-neutral-100">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 border border-neutral-200/60 shadow-2xs">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Change Master Credentials</h3>
                <p className="text-xs text-neutral-400">Update root login handle and password</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Super Admin Username *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-9 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl pl-9 pr-4 text-xs font-medium text-neutral-900 focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Current Password (Optional for first change)
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full h-9 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl pl-9 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>

              {/* New Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full h-9 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl pl-9 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full h-9 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl pl-9 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-black text-white text-xs font-medium flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-5 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving Credentials..." : "Save Credentials"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
