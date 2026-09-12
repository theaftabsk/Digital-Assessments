"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import CreditAllocateModal from "@/components/CreditAllocateModal";
import CreditAdjustModal from "@/components/CreditAdjustModal";
import TenantAdminsModal from "@/components/TenantAdminsModal";
import WhiteLabelModal from "@/components/WhiteLabelModal";
import {
  Building2,
  Users,
  Coins,
  Download,
  Trash2,
  Power,
  RotateCcw,
  Palette,
  KeyRound,
  CheckCircle2,
  PlayCircle,
  Layers,
  ArrowLeft,
  Plus,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.id as string;

  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "credits" | "admins" | "settings">("overview");

  // Modals state
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isWhiteLabelOpen, setIsWhiteLabelOpen] = useState(false);
  const [isAdminsOpen, setIsAdminsOpen] = useState(false);

  // Status toggle
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Purge & Delete
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purging, setPurging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTenantDetails = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenantId}`);
      const data = await res.json();
      if (data.success) {
        setDetailData(data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantDetails();
  }, [tenantId]);

  const handleToggleStatus = async () => {
    if (!detailData?.tenant) return;
    const nextStatus = detailData.tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setIsTogglingStatus(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTenantDetails();
      }
    } catch {
      /* silent */
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDownloadExcel = () => {
    const baseUrl = getApiBaseUrl();
    window.open(`${baseUrl}/api/v1/super-admin/tenants/${tenantId}/export-data`, "_blank");
  };

  const handleConfirmPurge = async () => {
    setPurging(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenantId}/purge-data`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setShowPurgeConfirm(false);
        fetchTenantDetails();
      }
    } catch {
      /* silent */
    } finally {
      setPurging(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenantId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/tenants");
      }
    } catch {
      /* silent */
    } finally {
      setDeleting(false);
    }
  };

  const tenant = detailData?.tenant;
  const credit = detailData?.credit || {
    creditLimit: tenant?.creditLimit || 500,
    usedCredit: tenant?.usedCredit || 0,
    remainingCredit: Math.max(0, (tenant?.creditLimit || 500) - (tenant?.usedCredit || 0)),
  };
  const metrics = detailData?.metrics || {
    totalAssessments: 0,
    totalCandidates: 0,
    examAttempts: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
  };
  const assessments = detailData?.assessments || [];
  const creditHistories = detailData?.recentCreditHistory || [];
  const admins = detailData?.admins || [];

  const isSuspended = tenant?.status === "SUSPENDED";

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-neutral-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Minimal Navigation Bar */}
        <header className="h-14 px-8 flex items-center justify-between border-b border-neutral-200/70 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-neutral-400">Super Admin Console</span>
            <span className="text-neutral-300">/</span>
            <Link href="/tenants" className="text-neutral-500 hover:text-neutral-900 transition">
              Customers
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-semibold">{tenant?.name || "Customer Detail"}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition">Docs</a>
            <a href="#" className="hover:text-neutral-900 transition">Need help?</a>
            <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center">
              SA
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Back & Actions Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/tenants"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all customers</span>
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={fetchTenantDetails}
                title="Refresh customer data"
                className="h-9 w-9 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-black" : ""}`} />
              </button>

              <button
                onClick={() => setIsAllocateOpen(true)}
                className="h-9 px-3.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-98"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Allocate Credits</span>
              </button>

              <button
                onClick={() => setIsAdjustOpen(true)}
                className="h-9 px-3.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Limit</span>
              </button>

              <button
                onClick={() => setIsWhiteLabelOpen(true)}
                className="h-9 px-3.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>White-Label</span>
              </button>

              <button
                onClick={handleDownloadExcel}
                className="h-9 px-3.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data</span>
              </button>

              <button
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
                className="h-9 px-3.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isSuspended ? "Reactivate" : "Suspend"}</span>
              </button>
            </div>
          </div>

          {/* Customer Organization Hero Card */}
          <div className="border border-neutral-200/80 rounded-2xl bg-white p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {tenant?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tenant.logoUrl}
                    alt={tenant.name}
                    className="w-12 h-12 object-contain rounded-2xl border border-neutral-200 p-1 bg-white shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-black text-white font-bold flex items-center justify-center text-base shadow-2xs shrink-0">
                    {tenant?.name
                      ?.split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "GC"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                      {tenant?.name || "Loading organization..."}
                    </h1>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isSuspended
                          ? "bg-neutral-200 text-neutral-600"
                          : "bg-neutral-100 text-neutral-800 border border-neutral-200/80"
                      }`}
                    >
                      {isSuspended ? "Suspended" : "Active Account"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    /{tenant?.slug} • Added on {tenant?.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              {/* Credit Status Pill */}
              <div className="text-right sm:border-l sm:border-neutral-100 sm:pl-6">
                <span className="text-xs text-neutral-400 font-medium block">Credit Balance</span>
                <span className="text-xl font-bold font-mono text-neutral-900">
                  {credit.remainingCredit} <span className="text-xs text-neutral-400 font-normal">/ {credit.creditLimit}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 6 Telemetry Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Credit Limit</span>
              <strong className="text-lg font-bold font-mono text-neutral-900 block">{credit.creditLimit}</strong>
              <span className="text-[10px] text-neutral-400">Total Allocated</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Credits Used</span>
              <strong className="text-lg font-bold font-mono text-neutral-900 block">{credit.usedCredit}</strong>
              <span className="text-[10px] text-neutral-400">Exam Starts</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Assessments</span>
              <strong className="text-lg font-bold font-mono text-neutral-900 block">{metrics.totalAssessments}</strong>
              <span className="text-[10px] text-neutral-400">Templates</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Candidates</span>
              <strong className="text-lg font-bold font-mono text-neutral-900 block">{metrics.totalCandidates}</strong>
              <span className="text-[10px] text-neutral-400">Enrolled Total</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Completed</span>
              <strong className="text-lg font-bold font-mono text-neutral-900 block">{metrics.completed}</strong>
              <span className="text-[10px] text-neutral-400">Finished Tests</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">In Progress</span>
              <strong className="text-lg font-bold font-mono text-neutral-900 block">{metrics.inProgress}</strong>
              <span className="text-[10px] text-neutral-400">Active Now</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-neutral-200/70 flex items-center gap-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 border-b-2 transition cursor-pointer ${
                activeTab === "overview"
                  ? "border-black text-neutral-900 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Assessments & Activity ({assessments.length})
            </button>
            <button
              onClick={() => setActiveTab("credits")}
              className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "credits"
                  ? "border-black text-neutral-900 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span>Credit Ledger History</span>
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-100 text-[10px] text-neutral-600 font-mono">
                {creditHistories.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("admins")}
              className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "admins"
                  ? "border-black text-neutral-900 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span>Administrator Accounts</span>
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-100 text-[10px] text-neutral-600 font-mono">
                {admins.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-3 border-b-2 transition cursor-pointer ${
                activeTab === "settings"
                  ? "border-black text-neutral-900 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Settings & Danger Zone
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs overflow-hidden">
                <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Assessments Created by Customer
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    {assessments.length} total assessment{assessments.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="divide-y divide-neutral-100 text-xs">
                  {assessments.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400 font-medium text-xs">
                      No assessments created yet by this customer organization.
                    </div>
                  ) : (
                    assessments.map((a: any) => (
                      <div key={a.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-neutral-50/60 transition">
                        <div>
                          <p className="font-semibold text-neutral-900 text-sm">{a.name}</p>
                          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            /{a.slug} • {a.durationMins} Mins • Created {new Date(a.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 font-mono text-xs font-semibold">
                          {a._count?.candidates || 0} candidates
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "credits" && (
            <div className="space-y-4">
              <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs overflow-hidden">
                <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200/60 flex items-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <span className="w-36">Date & Time</span>
                  <span className="w-28 text-center">Event Type</span>
                  <span className="w-24 text-center">Credit Change</span>
                  <span className="flex-1">Transaction Memo</span>
                  <span className="w-28 text-right">Balance After</span>
                </div>

                <div className="divide-y divide-neutral-100 text-xs">
                  {creditHistories.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400 font-medium text-xs">
                      No credit transactions recorded yet for this organization.
                    </div>
                  ) : (
                    creditHistories.map((h: any) => {
                      const isDeduction = h.type === "DEDUCTION" || h.amount < 0;
                      return (
                        <div key={h.id} className="px-5 py-3.5 flex items-center hover:bg-neutral-50/60 transition text-neutral-700">
                          <span className="w-36 font-mono text-[11px] text-neutral-400">
                            {new Date(h.createdAt).toLocaleDateString()} {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <div className="w-28 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                h.type === "DEDUCTION"
                                  ? "bg-black text-white"
                                  : "bg-neutral-100 text-neutral-800 border border-neutral-200/80"
                              }`}
                            >
                              {h.type === "DEDUCTION" ? "Exam Start" : h.type}
                            </span>
                          </div>

                          <span className="w-24 text-center font-mono font-bold text-neutral-900">
                            {h.amount > 0 ? `+${h.amount}` : h.amount}
                          </span>

                          <span className="flex-1 text-neutral-900 font-medium truncate pr-2">
                            {h.description}
                          </span>

                          <span className="w-28 text-right font-mono font-semibold text-neutral-900">
                            {h.balanceAfter} Left
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "admins" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700">Organization Admins</span>
                <button
                  onClick={() => setIsAdminsOpen(true)}
                  className="h-8 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Admin</span>
                </button>
              </div>

              <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs overflow-hidden">
                <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200/60 flex items-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <span className="flex-1">Admin User</span>
                  <span className="w-32 text-center">Role</span>
                  <span className="w-36 text-right">Created</span>
                </div>

                <div className="divide-y divide-neutral-100 text-xs">
                  {admins.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400 font-medium text-xs">
                      No admin users found for this organization.
                    </div>
                  ) : (
                    admins.map((adm: any) => (
                      <div key={adm.id} className="px-5 py-3.5 flex items-center hover:bg-neutral-50/60 transition">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-semibold text-neutral-900 text-sm truncate">{adm.name || adm.username}</p>
                          <p className="text-[11px] text-neutral-400 font-mono truncate">{adm.username}</p>
                        </div>

                        <div className="w-32 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/80">
                            {adm.role || "ADMIN"}
                          </span>
                        </div>

                        <span className="w-36 text-right text-[11px] text-neutral-400 font-mono">
                          {new Date(adm.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="border border-neutral-200/80 rounded-2xl bg-neutral-50/70 p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Danger Zone</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Critical operations that alter or erase customer records.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200/80">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-900">Purge Candidate Test Data</h4>
                      <p className="text-[11px] text-neutral-400">
                        Wipes all candidate test records, exam attempts, answers, and proctoring logs. Resets used credits to 0.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPurgeConfirm(true)}
                      className="h-9 px-4 rounded-xl border border-neutral-200/80 hover:bg-neutral-100 text-neutral-700 text-xs font-medium transition cursor-pointer"
                    >
                      Purge Data
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200/80">
                    <div>
                      <h4 className="text-xs font-semibold text-red-600">Delete Customer Account</h4>
                      <p className="text-[11px] text-neutral-400">
                        Permanently removes this tenant, all assessments, and associated logins.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition cursor-pointer shadow-xs"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {tenant && (
        <>
          <CreditAllocateModal
            isOpen={isAllocateOpen}
            tenant={{
              id: tenant.id,
              name: tenant.name,
              creditLimit: credit.creditLimit,
              usedCredit: credit.usedCredit,
              remainingCredit: credit.remainingCredit,
            }}
            onClose={() => setIsAllocateOpen(false)}
            onSuccess={fetchTenantDetails}
          />

          <CreditAdjustModal
            isOpen={isAdjustOpen}
            tenant={{
              id: tenant.id,
              name: tenant.name,
              creditLimit: credit.creditLimit,
              usedCredit: credit.usedCredit,
              remainingCredit: credit.remainingCredit,
            }}
            onClose={() => setIsAdjustOpen(false)}
            onSuccess={fetchTenantDetails}
          />

          <WhiteLabelModal
            isOpen={isWhiteLabelOpen}
            tenant={tenant}
            onClose={() => setIsWhiteLabelOpen(false)}
            onSuccess={fetchTenantDetails}
          />

          <TenantAdminsModal
            isOpen={isAdminsOpen}
            tenant={tenant}
            onClose={() => setIsAdminsOpen(false)}
          />
        </>
      )}

      {/* Purge Modal */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200/80 space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Purge Candidate Test Data?</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                This will wipe all candidate test attempts and proctoring logs for <strong>{tenant?.name}</strong>. Used credits will be reset to 0. Organization logins remain active.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                disabled={purging}
                className="h-9 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurge}
                disabled={purging}
                className="h-9 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer"
              >
                {purging ? "Purging..." : "Confirm Purge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200/80 space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Permanently Delete Customer?</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Are you sure you want to completely delete <strong>{tenant?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="h-9 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition cursor-pointer"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
