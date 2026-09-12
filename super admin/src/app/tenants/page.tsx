"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import CreditAllocateModal from "@/components/CreditAllocateModal";
import CreditAdjustModal from "@/components/CreditAdjustModal";
import CreateTenantModal from "@/components/CreateTenantModal";
import TenantAdminsModal from "@/components/TenantAdminsModal";
import WhiteLabelModal from "@/components/WhiteLabelModal";
import CustomerDetailDrawer from "@/components/CustomerDetailDrawer";
import {
  Building2,
  Plus,
  Sliders,
  RefreshCw,
  Search,
  Users,
  Power,
  KeyRound,
  Download,
  RotateCcw,
  Palette,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Coins,
  Check,
  CodeXml,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");

  // Active dropdown row ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Modals & Drawer state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTenantForAdmins, setSelectedTenantForAdmins] = useState<any>(null);
  const [selectedTenantForWhiteLabel, setSelectedTenantForWhiteLabel] = useState<any>(null);
  const [selectedTenantForAllocate, setSelectedTenantForAllocate] = useState<any>(null);
  const [selectedTenantForAdjust, setSelectedTenantForAdjust] = useState<any>(null);
  const [selectedTenantForDrawer, setSelectedTenantForDrawer] = useState<any>(null);

  // Purge & Delete Target
  const [purgeTarget, setPurgeTarget] = useState<any>(null);
  const [purging, setPurging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      setActiveMenuId(null);
    }
  };

  const handleDownloadExcel = (tenantId: string) => {
    const baseUrl = getApiBaseUrl();
    window.open(`${baseUrl}/api/v1/super-admin/tenants/${tenantId}/export-data`, "_blank");
    setActiveMenuId(null);
  };

  const handleConfirmPurge = async () => {
    if (!purgeTarget) return;
    setPurging(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${purgeTarget.id}/purge-data`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setPurgeTarget(null);
        fetchTenants();
      }
    } catch {
      /* silent */
    } finally {
      setPurging(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchTenants();
      }
    } catch {
      /* silent */
    } finally {
      setDeleting(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || t.tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-neutral-900">
      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Minimal Navigation Bar */}
        <header className="h-14 px-8 flex items-center justify-between border-b border-neutral-200/70 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-neutral-400">Super Admin Console</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-semibold">Customers</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition">Docs</a>
            <a href="#" className="hover:text-neutral-900 transition">Need help?</a>
            <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center">
              SA
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Main Title & Action Button Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Customers
              </h1>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                Manage customer organizations, quota limits, exam credits, and white-label settings.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="h-9 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add customer</span>
              </button>

              <button
                onClick={fetchTenants}
                title="Refresh customer list"
                className="h-9 w-9 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-black" : ""}`} />
              </button>
            </div>
          </div>

          {/* Filter Bar (Search + Dropdowns + Export) */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl pl-9 pr-3 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition shadow-2xs"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-9 px-3 pr-8 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl text-xs font-medium text-neutral-700 hover:text-neutral-900 cursor-pointer appearance-none focus:outline-none transition shadow-2xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick Export button */}
            <button
              onClick={() => {
                if (tenants.length > 0) handleDownloadExcel(tenants[0].tenant.id);
              }}
              title="Download Data Report (Excel)"
              className="h-9 w-9 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900 transition flex items-center justify-center cursor-pointer shadow-2xs border border-neutral-200/60"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table Container Card */}
          <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs overflow-visible">
            {/* Header Bar */}
            <div className="bg-neutral-50/90 rounded-t-2xl px-5 py-3 border-b border-neutral-200/60 flex items-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <span className="flex-1 min-w-[220px]">Customer Organization</span>
              <span className="w-28 text-center">Status</span>
              <span className="w-40 text-center">Credits (Used / Bal)</span>
              <span className="w-32 text-center">Candidates</span>
              <span className="w-16 text-right">Actions</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-neutral-100/80">
              {filteredTenants.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 font-medium text-xs">
                  {loading ? "Loading customers..." : "No customer accounts found."}
                </div>
              ) : (
                filteredTenants.map((t) => {
                  const remaining = t.credit.remainingCredit;
                  const used = t.credit.usedCredit;
                  const limit = t.credit.creditLimit;
                  const isSuspended = t.tenant.status === "SUSPENDED";
                  const isMenuOpen = activeMenuId === t.tenant.id;

                  return (
                    <div
                      key={t.tenant.id}
                      onClick={() => setSelectedTenantForDrawer(t)}
                      className="px-5 py-3.5 flex items-center hover:bg-neutral-50/80 transition group relative cursor-pointer"
                    >
                      {/* Name Column */}
                      <div className="flex-1 min-w-[220px] flex items-center gap-3 pr-2">
                        {t.tenant.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.tenant.logoUrl}
                            alt={t.tenant.name}
                            className="w-9 h-9 object-contain rounded-xl border border-neutral-200 p-0.5 bg-white shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-700 font-bold flex items-center justify-center text-xs shrink-0 border border-neutral-200/60 shadow-2xs">
                            <Building2 className="w-4 h-4 text-neutral-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-900 text-sm group-hover:underline truncate block">
                            {t.tenant.name}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono block mt-0.5">
                            /{t.tenant.slug}
                          </span>
                        </div>
                      </div>

                      {/* Status Column */}
                      <div className="w-28 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            isSuspended
                              ? "bg-neutral-200 text-neutral-600"
                              : "bg-neutral-100 text-neutral-800 border border-neutral-200/60"
                          }`}
                        >
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </div>

                      {/* Credit Quota Column */}
                      <div className="w-40 text-center font-mono">
                        <span className="text-xs sm:text-[13px] font-bold text-neutral-900">{used}</span>
                        <span className="text-[11px] text-neutral-400 font-normal"> / {remaining} left</span>
                      </div>

                      {/* Candidates Count */}
                      <div className="w-32 text-center text-neutral-600">
                        <span className="text-xs sm:text-[13px] font-semibold text-neutral-900">
                          {t.metrics.totalCandidates}
                        </span>
                        <span className="text-[11px] text-neutral-400"> enrolled</span>
                      </div>

                      {/* Three-dots Menu Trigger */}
                      <div className="w-16 flex items-center justify-end relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : t.tenant.id);
                          }}
                          className="h-8 w-8 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 flex items-center justify-center transition cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-10 z-50 w-56 bg-white rounded-xl shadow-xl border border-neutral-200/90 p-1 text-xs space-y-0.5 animate-in fade-in zoom-in-95"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTenantForDrawer(t);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition text-left cursor-pointer font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-neutral-400" />
                              <span>View details</span>
                            </button>

                            <Link
                              href={`/tenants/${t.tenant.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition text-left cursor-pointer font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Open full page</span>
                            </Link>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTenantForAdmins(t.tenant);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition text-left cursor-pointer font-medium"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Manage admins</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTenantForAllocate({
                                  id: t.tenant.id,
                                  name: t.tenant.name,
                                  creditLimit: limit,
                                  usedCredit: used,
                                  remainingCredit: remaining,
                                });
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition text-left cursor-pointer font-medium"
                            >
                              <Plus className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Allocate credits</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTenantForAdjust({
                                  id: t.tenant.id,
                                  name: t.tenant.name,
                                  creditLimit: limit,
                                  usedCredit: used,
                                  remainingCredit: remaining,
                                });
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition text-left cursor-pointer font-medium"
                            >
                              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Adjust limit</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTenantForWhiteLabel(t.tenant);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition text-left cursor-pointer font-medium"
                            >
                              <Palette className="w-3.5 h-3.5 text-neutral-400" />
                              <span>White-label branding</span>
                            </button>

                            <button
                              onClick={() => handleDownloadExcel(t.tenant.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition text-left cursor-pointer font-medium"
                            >
                              <Download className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Export data</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatus(t.tenant.id, t.tenant.status)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition text-left cursor-pointer font-medium"
                            >
                              <Power className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{isSuspended ? "Reactivate customer" : "Suspend customer"}</span>
                            </button>

                            <button
                              onClick={() => {
                                setPurgeTarget(t.tenant);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition text-left cursor-pointer font-medium"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Purge test data</span>
                            </button>

                            {/* Divider before danger zone */}
                            <div className="border-t border-neutral-100 my-1" />

                            <button
                              onClick={() => {
                                setDeleteTarget(t.tenant);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition text-left cursor-pointer font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete customer</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination / Count Footer */}
            <div className="px-5 py-3 bg-neutral-50/50 border-t border-neutral-100/80 flex items-center justify-between text-xs text-neutral-400 font-medium">
              <span>
                Showing {filteredTenants.length} customer{filteredTenants.length === 1 ? "" : "s"}
              </span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </main>

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        isOpen={!!selectedTenantForDrawer}
        tenant={selectedTenantForDrawer}
        onClose={() => setSelectedTenantForDrawer(null)}
        onRefresh={fetchTenants}
        onOpenWhiteLabel={(t) => setSelectedTenantForWhiteLabel(t)}
        onOpenAdmins={(t) => setSelectedTenantForAdmins(t)}
        onOpenAllocate={(t) => setSelectedTenantForAllocate(t)}
        onOpenAdjust={(t) => setSelectedTenantForAdjust(t)}
      />

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTenants}
      />

      {/* White-Label Branding Modal */}
      <WhiteLabelModal
        isOpen={!!selectedTenantForWhiteLabel}
        tenant={selectedTenantForWhiteLabel}
        onClose={() => setSelectedTenantForWhiteLabel(null)}
        onSuccess={fetchTenants}
      />

      {/* Tenant Admins Modal */}
      <TenantAdminsModal
        isOpen={!!selectedTenantForAdmins}
        tenant={selectedTenantForAdmins}
        onClose={() => setSelectedTenantForAdmins(null)}
      />

      {/* Allocate Credits Modal */}
      <CreditAllocateModal
        isOpen={!!selectedTenantForAllocate}
        tenant={selectedTenantForAllocate}
        onClose={() => setSelectedTenantForAllocate(null)}
        onSuccess={fetchTenants}
      />

      {/* Adjust Limit Modal */}
      <CreditAdjustModal
        isOpen={!!selectedTenantForAdjust}
        tenant={selectedTenantForAdjust}
        onClose={() => setSelectedTenantForAdjust(null)}
        onSuccess={fetchTenants}
      />

      {/* Purge Confirmation Modal */}
      {purgeTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-200/80 space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Purge All Candidate Test Data?</h3>
              <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                This will permanently delete all candidate test records, exam attempts, answers, and proctoring logs for <strong>{purgeTarget.name}</strong>. Used credits will be reset to 0. Organization and admin logins will remain intact.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPurgeTarget(null)}
                disabled={purging}
                className="h-10 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurge}
                disabled={purging}
                className="h-10 px-5 rounded-xl bg-black hover:bg-neutral-800 text-white text-sm font-medium transition cursor-pointer"
              >
                {purging ? "Purging..." : "Confirm purge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-200/80 space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Delete Customer Account?</h3>
              <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                Are you sure you want to completely delete <strong>{deleteTarget.name}</strong>? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="h-10 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition cursor-pointer"
              >
                {deleting ? "Deleting..." : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
