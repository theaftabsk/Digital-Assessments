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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
                  {tenant.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-[10px] font-mono">
                  {tenant.slug}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Manage organization administrator credentials & security keys
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS NOTIFICATION FOR NEW PASSWORD / CREDENTIAL */}
          {resetSuccessData && (
            <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800 shadow-lg space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-white" />
                  Credentials Ready to Share
                </span>
                <button
                  onClick={() => setResetSuccessData(null)}
                  className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                <div className="bg-neutral-800 p-2.5 rounded-lg border border-neutral-700">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-0.5">Username</span>
                  <span className="font-medium text-white">{resetSuccessData.username}</span>
                </div>
                <div className="bg-neutral-800 p-2.5 rounded-lg border border-neutral-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-0.5">New Password</span>
                    <span className="font-medium text-white">{resetSuccessData.newPassword}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(resetSuccessData.newPassword, "resetPass")}
                    className="p-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-neutral-200 transition cursor-pointer text-[11px] flex items-center gap-1"
                  >
                    {copiedField === "resetPass" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "resetPass" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESET PASSWORD CONFIRMATION MODAL / PANEL */}
          {resetTargetAdmin && (
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-neutral-700" />
                  <span className="text-xs font-semibold text-neutral-900">
                    Reset Password for {resetTargetAdmin.name} ({resetTargetAdmin.username})
                  </span>
                </div>
                <button
                  onClick={() => setResetTargetAdmin(null)}
                  className="text-neutral-500 hover:text-neutral-900 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-neutral-700">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomResetPassword(generateRandomPassword())}
                    className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Generate Key
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate secure password"
                  value={customResetPassword}
                  onChange={(e) => setCustomResetPassword(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResetTargetAdmin(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium text-xs hover:bg-white cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleResetPassword}
                  className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
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
            <form onSubmit={handleCreateAdmin} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-neutral-700" />
                  Issue New Administrator Credential
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HR Executive"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Username / Login ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hr_recruiter"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPassword(generateRandomPassword());
                        setShowNewPassword(true);
                      }}
                      className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Auto-Key
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Blank for auto-generated key"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
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
                  className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? "Issuing..." : "Issue Credentials"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">
                Assigned Organization Administrators ({admins.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Issue Additional Admin</span>
              </button>
            </div>
          )}

          {/* ADMINS LIST TABLE */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-neutral-500">Loading credentials...</span>
              </div>
            ) : admins.length === 0 ? (
              <div className="py-10 text-center text-xs text-neutral-400">
                No administrators found under this tenant.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[10px] font-semibold uppercase text-neutral-500 tracking-wider">
                    <th className="py-2.5 px-3.5">Admin Name / ID</th>
                    <th className="py-2.5 px-3.5 text-center">Role</th>
                    <th className="py-2.5 px-3.5 text-center">Created</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-neutral-900 text-xs">{adm.name}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{adm.username}</div>
                      </td>

                      <td className="py-2.5 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-medium uppercase border border-neutral-200">
                          {adm.role}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-center text-neutral-400 text-[11px]">
                        {new Date(adm.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setResetTargetAdmin(adm);
                            setCustomResetPassword("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium text-[11px] border border-neutral-200 transition cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <KeyRound className="w-3 h-3 text-neutral-600" />
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
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
