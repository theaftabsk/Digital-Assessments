"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Building2,
  Users,
  Coins,
  Download,
  Trash2,
  Power,
  RotateCcw,
  Palette,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  Sliders,
  FileCheck,
  PlayCircle,
  Hourglass,
  Layers,
  Calendar,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface CustomerDetailDrawerProps {
  tenant: any | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onOpenWhiteLabel: (tenant: any) => void;
  onOpenAdmins: (tenant: any) => void;
  onOpenAllocate: (tenant: any) => void;
  onOpenAdjust: (tenant: any) => void;
}

export default function CustomerDetailDrawer({
  tenant,
  isOpen,
  onClose,
  onRefresh,
  onOpenWhiteLabel,
  onOpenAdmins,
  onOpenAllocate,
  onOpenAdjust,
}: CustomerDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "credits" | "admins" | "controls">("overview");
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Status toggle
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Purge state
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeSuccessMessage, setPurgeSuccessMessage] = useState<string | null>(null);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const tenantObj = tenant?.tenant || tenant;
  const tenantId = tenantObj?.id;

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
    if (isOpen && tenantId) {
      fetchTenantDetails();
    } else {
      setDetailData(null);
    }
  }, [isOpen, tenantId]);

  if (!isOpen || !tenantObj) return null;

  const currentTenant = detailData?.tenant || tenantObj;
  const credit = detailData?.credit || tenant?.credit || {
    creditLimit: currentTenant.creditLimit || 500,
    usedCredit: currentTenant.usedCredit || 0,
    remainingCredit: Math.max(0, (currentTenant.creditLimit || 500) - (currentTenant.usedCredit || 0)),
  };
  const metrics = detailData?.metrics || tenant?.metrics || {
    totalAssessments: 0,
    totalCandidates: 0,
    examAttempts: credit.usedCredit || 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
  };
  const admins = detailData?.admins || tenant?.admins || [];
  const assessments = detailData?.assessments || [];
  const creditHistories = detailData?.recentCreditHistory || [];

  const isSuspended = currentTenant.status === "SUSPENDED";
  const creditLimit = credit.creditLimit ?? 0;
  const usedCredit = credit.usedCredit ?? 0;
  const remaining = Math.max(0, creditLimit - usedCredit);

  const handleToggleStatus = async () => {
    const nextStatus = isSuspended ? "ACTIVE" : "SUSPENDED";
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
        onRefresh();
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

  const handlePurgeData = async () => {
    setPurging(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenantId}/purge-data`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setPurgeSuccessMessage(data.message || "Candidate test data wiped cleanly.");
        setShowPurgeConfirm(false);
        onRefresh();
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
        setShowDeleteConfirm(false);
        onRefresh();
        onClose();
      }
    } catch {
      /* silent */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-all duration-300">
      {/* Slide-over Container */}
      <div className="w-full max-w-2xl sm:max-w-3xl bg-[#FDFDFD] h-full shadow-2xl flex flex-col overflow-hidden border-l border-neutral-200/80 animate-in slide-in-from-right duration-300">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-white border-b border-neutral-200/70 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {currentTenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTenant.logoUrl}
                alt={currentTenant.name}
                className="w-10 h-10 object-contain rounded-xl border border-neutral-200 p-0.5 bg-white shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                {currentTenant.name
                  ?.split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "GC"}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 truncate">
                  {currentTenant.name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    isSuspended
                      ? "bg-neutral-200 text-neutral-600"
                      : "bg-neutral-100 text-neutral-800 border border-neutral-200/80"
                  }`}
                >
                  {isSuspended ? "Suspended" : "Active"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">/{currentTenant.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/tenants/${tenantId}`}
              title="Open dedicated full page"
              className="h-8 px-2.5 rounded-lg border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={fetchTenantDetails}
              title="Refresh Data"
              className="p-1.5 rounded-lg border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-black" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-white border-b border-neutral-200/70 flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition cursor-pointer ${
              activeTab === "overview"
                ? "border-black text-neutral-900 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Overview & Telemetry
          </button>
          <button
            onClick={() => setActiveTab("credits")}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "credits"
                ? "border-black text-neutral-900 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>Credit Ledger & Top-ups</span>
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
            <span>Customer Admins</span>
            <span className="px-1.5 py-0.2 rounded-full bg-neutral-100 text-[10px] text-neutral-600 font-mono">
              {admins.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("controls")}
            className={`py-3 border-b-2 transition cursor-pointer ${
              activeTab === "controls"
                ? "border-black text-neutral-900 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Controls & Settings
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {purgeSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-black text-white text-xs font-medium flex items-center justify-between shadow-xs">
              <span>{purgeSuccessMessage}</span>
              <button
                onClick={() => setPurgeSuccessMessage(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW & TELEMETRY */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Credit Status Banner */}
              <div className="border border-neutral-200/80 rounded-2xl bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-900">Credit Balance & Quota Usage</span>
                  <span className="font-mono text-neutral-500">
                    {usedCredit} used of {creditLimit} allocated
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-500"
                    style={{
                      width: `${creditLimit > 0 ? Math.min(100, Math.round((usedCredit / creditLimit) * 100)) : 0}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Total Limit</span>
                    <strong className="text-base font-bold font-mono text-neutral-900 block mt-0.5">
                      {creditLimit.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-neutral-400 font-medium">Allocated Starts</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Used Credits</span>
                    <strong className="text-base font-bold font-mono text-neutral-900 block mt-0.5">
                      {usedCredit.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-neutral-400 font-medium">Exam Launches</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Remaining</span>
                    <strong className="text-base font-bold font-mono text-neutral-900 block mt-0.5">
                      {remaining.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-neutral-400 font-medium">Available</span>
                  </div>
                </div>
              </div>

              {/* Exam & Candidate Metrics Grid */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Live Exam & Candidate Telemetry
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Assessments */}
                  <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Assessments</span>
                    </div>
                    <strong className="text-xl font-bold text-neutral-900 block font-mono">
                      {metrics.totalAssessments}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">Created Templates</span>
                  </div>

                  {/* Candidates */}
                  <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>Candidates</span>
                    </div>
                    <strong className="text-xl font-bold text-neutral-900 block font-mono">
                      {metrics.totalCandidates}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">Registered Total</span>
                  </div>

                  {/* Completed */}
                  <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </div>
                    <strong className="text-xl font-bold text-neutral-900 block font-mono">
                      {metrics.completed}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">Finished Exams</span>
                  </div>

                  {/* In Progress */}
                  <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>In Progress</span>
                    </div>
                    <strong className="text-xl font-bold text-neutral-900 block font-mono">
                      {metrics.inProgress}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">Active Right Now</span>
                  </div>
                </div>
              </div>

              {/* Assessments List Table */}
              <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs overflow-hidden">
                <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-900">Organization Assessments</span>
                  <span className="text-[11px] text-neutral-400">
                    {assessments.length} assessment{assessments.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="divide-y divide-neutral-100 text-xs">
                  {assessments.length === 0 ? (
                    <div className="py-8 text-center text-neutral-400 font-medium text-xs">
                      No assessments created yet by this customer.
                    </div>
                  ) : (
                    assessments.map((a: any) => (
                      <div key={a.id} className="px-5 py-3 flex items-center justify-between hover:bg-neutral-50/60 transition">
                        <div>
                          <p className="font-semibold text-neutral-900">{a.name}</p>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {a.durationMins} mins • {new Date(a.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 font-mono text-xs font-medium">
                          {a._count?.candidates || 0} candidates
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREDIT LEDGER & HISTORY */}
          {activeTab === "credits" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Credit History & Top-up Transactions
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Every credit allocation (+), candidate launch (-), and quota adjustment.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAllocate(currentTenant)}
                    className="h-8 px-3 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Top-up</span>
                  </button>

                  <button
                    onClick={() => onOpenAdjust(currentTenant)}
                    className="h-8 px-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Adjust</span>
                  </button>
                </div>
              </div>

              {/* History Table */}
              <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs overflow-hidden">
                <div className="bg-neutral-50 px-5 py-2.5 border-b border-neutral-200/60 flex items-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <span className="w-32">Date</span>
                  <span className="w-24 text-center">Type</span>
                  <span className="w-20 text-center">Change</span>
                  <span className="flex-1">Description</span>
                  <span className="w-20 text-right">Balance</span>
                </div>

                <div className="divide-y divide-neutral-100 text-xs">
                  {creditHistories.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400 font-medium text-xs">
                      No credit transactions recorded for this organization yet.
                    </div>
                  ) : (
                    creditHistories.map((h: any) => {
                      const isDeduction = h.type === "DEDUCTION" || h.amount < 0;
                      return (
                        <div key={h.id} className="px-5 py-3 flex items-center hover:bg-neutral-50/60 transition">
                          <span className="w-32 font-mono text-[11px] text-neutral-400">
                            {new Date(h.createdAt).toLocaleDateString()}
                          </span>

                          <div className="w-24 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                h.type === "DEDUCTION"
                                  ? "bg-black text-white"
                                  : "bg-neutral-100 text-neutral-800 border border-neutral-200/60"
                              }`}
                            >
                              {h.type === "DEDUCTION" ? "Exam" : h.type}
                            </span>
                          </div>

                          <span className="w-20 text-center font-mono font-bold text-neutral-900">
                            {h.amount > 0 ? `+${h.amount}` : h.amount}
                          </span>

                          <span className="flex-1 text-neutral-800 font-medium truncate pr-2">
                            {h.description}
                          </span>

                          <span className="w-20 text-right font-mono font-semibold text-neutral-900">
                            {h.balanceAfter}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADMINS & TEAM */}
          {activeTab === "admins" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Administrator Accounts
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Authorized staff with login access to this customer portal.
                  </p>
                </div>

                <button
                  onClick={() => onOpenAdmins(currentTenant)}
                  className="h-8 px-3 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Admin</span>
                </button>
              </div>

              <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs overflow-hidden">
                <div className="bg-neutral-50 px-5 py-2.5 border-b border-neutral-200/60 flex items-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <span className="flex-1">Admin User</span>
                  <span className="w-28 text-center">Role</span>
                  <span className="w-32 text-right">Created</span>
                </div>

                <div className="divide-y divide-neutral-100 text-xs">
                  {admins.length === 0 ? (
                    <div className="py-8 text-center text-neutral-400 font-medium text-xs">
                      No admin users configured for this organization.
                    </div>
                  ) : (
                    admins.map((adm: any) => (
                      <div key={adm.id} className="px-5 py-3 flex items-center hover:bg-neutral-50/60 transition">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-semibold text-neutral-900 truncate">{adm.name || adm.username}</p>
                          <p className="text-[11px] text-neutral-400 font-mono truncate">{adm.username}</p>
                        </div>

                        <div className="w-28 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                            {adm.role || "ADMIN"}
                          </span>
                        </div>

                        <span className="w-32 text-right text-[11px] text-neutral-400 font-mono">
                          {new Date(adm.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTROLS & DANGER ZONE */}
          {activeTab === "controls" && (
            <div className="space-y-6">
              {/* Operations Panel */}
              <div className="border border-neutral-200/80 rounded-2xl bg-white p-5 shadow-2xs space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Operations & Branding
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onOpenAllocate(currentTenant)}
                    className="h-10 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-medium transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Allocate Credits (+Top-up)</span>
                  </button>

                  <button
                    onClick={() => onOpenAdjust(currentTenant)}
                    className="h-10 px-4 rounded-xl bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200/80 text-xs font-medium transition flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Adjust Credit Quota Limit</span>
                  </button>

                  <button
                    onClick={() => onOpenWhiteLabel(currentTenant)}
                    className="h-10 px-4 rounded-xl bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200/80 text-xs font-medium transition flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Edit White-Label & Logo</span>
                  </button>

                  <button
                    onClick={handleDownloadExcel}
                    className="h-10 px-4 rounded-xl bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200/80 text-xs font-medium transition flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Data (Excel)</span>
                  </button>

                  <button
                    onClick={handleToggleStatus}
                    disabled={isTogglingStatus}
                    className="h-10 px-4 rounded-xl bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200/80 text-xs font-medium transition flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Power className="w-4 h-4" />
                    <span>{isSuspended ? "Reactivate Organization" : "Suspend Organization"}</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-neutral-200/80 rounded-2xl bg-neutral-50/70 p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Danger Zone
                </h3>

                <div className="space-y-3">
                  {/* Purge Data */}
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-neutral-200/70">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-900">Purge Candidate Test Records</h4>
                      <p className="text-[11px] text-neutral-400">
                        Wipes all test attempts and proctoring logs. Resets used credits to 0.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPurgeConfirm(true)}
                      className="h-8 px-3 rounded-lg border border-neutral-200/80 hover:bg-neutral-100 text-neutral-700 text-xs font-medium transition cursor-pointer"
                    >
                      Purge Data
                    </button>
                  </div>

                  {/* Delete Customer */}
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-neutral-200/70">
                    <div>
                      <h4 className="text-xs font-semibold text-red-600">Permanently Delete Customer</h4>
                      <p className="text-[11px] text-neutral-400">
                        Completely deletes this customer organization, assessments, and all associated accounts.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition cursor-pointer shadow-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purge Confirmation Modal */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200/80 space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Purge Candidate Test Data?</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                This will wipe all candidate test attempts and proctoring logs for <strong>{currentTenant.name}</strong>. Used credits will be reset to 0. Organization logins remain active.
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
                onClick={handlePurgeData}
                disabled={purging}
                className="h-9 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer"
              >
                {purging ? "Purging..." : "Confirm Purge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200/80 space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Permanently Delete Customer?</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Are you sure you want to completely delete <strong>{currentTenant.name}</strong>? This action cannot be undone.
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
