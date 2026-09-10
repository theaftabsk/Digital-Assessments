"use client";

import { useState, useEffect } from "react";
import {
  X,
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
}

interface TenantAdminsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
}

export default function TenantAdminsModal({
  isOpen,
  onClose,
  tenant,
}: TenantAdminsModalProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-views / Actions
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("ADMIN");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Reset Password Modal / Dialog
  const [resetTargetAdmin, setResetTargetAdmin] = useState<AdminUser | null>(null);
  const [customResetPassword, setCustomResetPassword] = useState("");
  const [resetSuccessData, setResetSuccessData] = useState<{
    username: string;
    newPassword: string;
  } | null>(null);

  // Copied state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchAdmins = async () => {
    if (!tenant) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenant.id}/admins`);
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins || []);
      } else {
        setError(data.message || "Failed to load admin accounts.");
      }
    } catch {
      setError("Network error fetching administrators.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && tenant) {
      fetchAdmins();
      setShowAddForm(false);
      setResetTargetAdmin(null);
      setResetSuccessData(null);
    }
  }, [isOpen, tenant]);

  if (!isOpen || !tenant) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 14; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setActionLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenant.id}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          name: newName.trim() || undefined,
          password: newPassword.trim() || undefined,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResetSuccessData({
          username: data.admin.username,
          newPassword: data.admin.initialPassword,
        });
        setShowAddForm(false);
        setNewUsername("");
        setNewName("");
        setNewPassword("");
        fetchAdmins();
      } else {
        setError(data.message || "Failed to create administrator account.");
      }
    } catch {
      setError("Network error creating administrator.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTargetAdmin) return;
    setActionLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(
        `${baseUrl}/api/v1/super-admin/admins/${resetTargetAdmin.id}/reset-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newPassword: customResetPassword.trim() || undefined,
          }),
        },
      );

      const data = await res.json();
      if (data.success) {
        setResetSuccessData({
          username: data.username,
          newPassword: data.newPassword,
        });
        setResetTargetAdmin(null);
        setCustomResetPassword("");
      } else {
        setError(data.message || "Failed to reset administrator password.");
      }
    } catch {
      setError("Network error resetting password.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {tenant.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                  {tenant.slug}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Manage organization administrator credentials & security keys
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS NOTIFICATION FOR NEW PASSWORD / CREDENTIAL */}
          {resetSuccessData && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Credentials Ready to Share
                </span>
                <button
                  onClick={() => setResetSuccessData(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Username</span>
                  <span className="font-bold text-white">{resetSuccessData.username}</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">New Password</span>
                    <span className="font-bold text-amber-300">{resetSuccessData.newPassword}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(resetSuccessData.newPassword, "resetPass")}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition cursor-pointer text-[11px] flex items-center gap-1"
                  >
                    {copiedField === "resetPass" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "resetPass" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESET PASSWORD CONFIRMATION MODAL / PANEL */}
          {resetTargetAdmin && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-amber-900">
                    Reset Password for {resetTargetAdmin.name} ({resetTargetAdmin.username})
                  </span>
                </div>
                <button
                  onClick={() => setResetTargetAdmin(null)}
                  className="text-amber-700 hover:text-amber-900 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomResetPassword(generateRandomPassword())}
                    className="text-[11px] font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate Key
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate secure password"
                  value={customResetPassword}
                  onChange={(e) => setCustomResetPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetTargetAdmin(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleResetPassword}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <span>Resetting...</span>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Confirm Password Reset</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SUB-FORM: ADD NEW ADMIN */}
          {showAddForm ? (
            <form onSubmit={handleCreateAdmin} className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/70 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  Issue New Administrator Credential
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HR Executive"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Username / Login ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hr_recruiter"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPassword(generateRandomPassword());
                        setShowNewPassword(true);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Auto-Key
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Blank for auto-generated key"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="ADMIN">Full Administrator</option>
                    <option value="RECRUITER">Recruiter / Examiner</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? "Issuing..." : "Issue Credentials"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Assigned Organization Administrators ({admins.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Issue Additional Admin</span>
              </button>
            </div>
          )}

          {/* ADMINS LIST TABLE */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-medium">Loading credentials...</span>
              </div>
            ) : admins.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 font-medium">
                No administrators found under this tenant.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Admin Name / ID</th>
                    <th className="py-3 px-4 text-center">Role</th>
                    <th className="py-3 px-4 text-center">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-xs">{adm.name}</div>
                        <div className="text-[11px] text-blue-600 font-bold font-mono">{adm.username}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                          {adm.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                        {new Date(adm.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setResetTargetAdmin(adm);
                            setCustomResetPassword("");
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-[11px] border border-amber-200 transition cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          <span>Reset Password</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
