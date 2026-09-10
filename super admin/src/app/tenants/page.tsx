"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CreditAllocateModal from "@/components/CreditAllocateModal";
import CreditAdjustModal from "@/components/CreditAdjustModal";
import CreateTenantModal from "@/components/CreateTenantModal";
import TenantAdminsModal from "@/components/TenantAdminsModal";
import WhiteLabelModal from "@/components/WhiteLabelModal";
import {
  Building2,
  Coins,
  Plus,
  Sliders,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Users,
  ShieldCheck,
  Power,
  KeyRound,
  ExternalLink,
  Palette,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTenantForAdmins, setSelectedTenantForAdmins] = useState<any>(null);
  const [selectedTenantForWhiteLabel, setSelectedTenantForWhiteLabel] = useState<any>(null);
  const [selectedTenantForAllocate, setSelectedTenantForAllocate] = useState<any>(null);
  const [selectedTenantForAdjust, setSelectedTenantForAdjust] = useState<any>(null);

  // Status toggle loading
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants`);
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setTogglingId(tenantId);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTenants();
      }
    } catch {
      /* silent */
    } finally {
      setTogglingId(null);
    }
  };

  const filteredTenants = tenants.filter((t) =>
    t.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Super Admin Console</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-extrabold text-blue-600">Client Organizations & SaaS Quotas</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Organization</span>
            </button>

            <button
              onClick={fetchTenants}
              title="Refresh Tenants List"
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer border border-slate-200 shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Client Organization & Admin Credentials Engine
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Provision client tenants, issue administrator access keys, manage quotas, and toggle real-time suspension.
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search organization / slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Tenants Table Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Organization & Slug</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Admins</th>
                    <th className="py-3 px-4 text-center">Total Limit</th>
                    <th className="py-3 px-4 text-center">Used</th>
                    <th className="py-3 px-4 text-center">Remaining</th>
                    <th className="py-3 px-4 text-center">Exams</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-400 font-medium">
                        {loading ? "Loading client organizations..." : "No client organizations found. Click '+ Create Organization' to provision one."}
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => {
                      const remaining = t.credit.remainingCredit;
                      const used = t.credit.usedCredit;
                      const limit = t.credit.creditLimit;
                      const isSuspended = t.tenant.status === "SUSPENDED";
                      const adminsCount = t.admins ? t.admins.length : 0;

                      return (
                        <tr
                          key={t.tenant.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isSuspended ? "bg-rose-50/30" : ""
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {t.tenant.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={t.tenant.logoUrl}
                                  alt={t.tenant.name}
                                  className="w-10 h-10 object-contain rounded-xl border border-slate-200 p-0.5 shrink-0 bg-white shadow-2xs"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-xs shrink-0 shadow-2xs"
                                  style={{ backgroundColor: t.tenant.primaryColor || "#003F72" }}
                                >
                                  {t.tenant.name
                                    .split(" ")
                                    .map((w: string) => w[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase() || "CL"}
                                </div>
                              )}
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                  <span>{t.tenant.name}</span>
                                  {isSuspended && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                                      SUSPENDED
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-blue-600 font-bold font-mono">
                                  {t.tenant.slug}
                                </div>
                                {t.tenant.portalTitle && (
                                  <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                    {t.tenant.portalTitle}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(t.tenant.id, t.tenant.status)}
                              disabled={togglingId === t.tenant.id}
                              title={`Click to ${isSuspended ? "Activate" : "Suspend"} Organization`}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition cursor-pointer border ${
                                isSuspended
                                  ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {isSuspended ? (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-500" />
                                  <span>Suspended</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Active</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Admins Count & Manage */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setSelectedTenantForAdmins(t.tenant)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 transition cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>{adminsCount} Admin{adminsCount !== 1 ? "s" : ""}</span>
                            </button>
                          </td>

                          <td className="py-4 px-4 text-center font-mono text-sm font-black text-slate-900">
                            {limit.toLocaleString()}
                          </td>

                          <td className="py-4 px-4 text-center font-mono text-sm font-black text-amber-600">
                            {used.toLocaleString()}
                          </td>

                          <td className="py-4 px-4 text-center font-mono text-sm font-black text-emerald-600">
                            {remaining.toLocaleString()}
                          </td>

                          <td className="py-4 px-4 text-center font-bold text-slate-900">
                            {t.metrics.totalAssessments} exams
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedTenantForWhiteLabel(t.tenant)}
                                title="Configure White-Label Branding (Logo, Title, Theme Color)"
                                className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs border border-purple-200 transition flex items-center gap-1 cursor-pointer"
                              >
                                <Palette className="w-3.5 h-3.5" />
                                <span>Branding</span>
                              </button>

                              <button
                                onClick={() => setSelectedTenantForAdmins(t.tenant)}
                                title="Manage Admin Logins & Passwords"
                                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                                <span>Keys</span>
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedTenantForAllocate({
                                    id: t.tenant.id,
                                    name: t.tenant.name,
                                    creditLimit: limit,
                                    usedCredit: used,
                                    remainingCredit: remaining,
                                  })
                                }
                                title="Allocate More Exam Credits"
                                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Credits</span>
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedTenantForAdjust({
                                    id: t.tenant.id,
                                    name: t.tenant.name,
                                    creditLimit: limit,
                                    usedCredit: used,
                                    remainingCredit: remaining,
                                  })
                                }
                                title="Adjust Quota Limit"
                                className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateTenantModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTenants}
      />

      <WhiteLabelModal
        isOpen={!!selectedTenantForWhiteLabel}
        tenant={selectedTenantForWhiteLabel}
        onClose={() => setSelectedTenantForWhiteLabel(null)}
        onSuccess={fetchTenants}
      />

      <TenantAdminsModal
        isOpen={!!selectedTenantForAdmins}
        tenant={selectedTenantForAdmins}
        onClose={() => setSelectedTenantForAdmins(null)}
      />

      <CreditAllocateModal
        isOpen={!!selectedTenantForAllocate}
        tenant={selectedTenantForAllocate}
        onClose={() => setSelectedTenantForAllocate(null)}
        onSuccess={fetchTenants}
      />

      <CreditAdjustModal
        isOpen={!!selectedTenantForAdjust}
        tenant={selectedTenantForAdjust}
        onClose={() => setSelectedTenantForAdjust(null)}
        onSuccess={fetchTenants}
      />
    </div>
  );
}
