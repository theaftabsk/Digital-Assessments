"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Receipt,
  Search,
  Filter,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

export default function SuperAdminLedgerPage() {
  const [histories, setHistories] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchTenantsAndLedger = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const tenRes = await fetch(`${baseUrl}/api/v1/super-admin/tenants`);
      const tenData = await tenRes.json();
      if (tenData.success && tenData.tenants.length > 0) {
        setTenants(tenData.tenants);
        const currentTenantId = selectedTenantId || tenData.tenants[0].tenant.id;
        setSelectedTenantId(currentTenantId);

        const ledRes = await fetch(
          `${baseUrl}/api/v1/super-admin/tenants/${currentTenantId}/credit-history?page=${page}&limit=25${
            filterType !== "ALL" ? `&type=${filterType}` : ""
          }`
        );
        const ledData = await ledRes.json();
        if (ledData.success) {
          setHistories(ledData.histories || []);
          setTotalPages(ledData.totalPages || 1);
          setTotalRecords(ledData.total || 0);
        }
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantsAndLedger();
  }, [selectedTenantId, filterType, page]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-neutral-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Minimal Navigation Bar */}
        <header className="h-14 px-8 flex items-center justify-between border-b border-neutral-200/70 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-neutral-400">Super Admin Console</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-semibold">Audit Ledger</span>
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
          {/* Main Title & Action Button Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Audit Ledger
              </h1>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                Immutable audit record of credit allocations (+), exam launches (-), and limit adjustments.
              </p>
            </div>

            <button
              onClick={fetchTenantsAndLedger}
              title="Refresh ledger"
              className="h-9 w-9 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition flex items-center justify-center cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-black" : ""}`} />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Tenant Filter Dropdown */}
            <div className="relative flex-1 min-w-[200px]">
              <select
                value={selectedTenantId}
                onChange={(e) => {
                  setSelectedTenantId(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 px-3.5 pr-8 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl text-xs font-semibold text-neutral-900 cursor-pointer appearance-none focus:outline-none transition shadow-2xs"
              >
                {tenants.map((t) => (
                  <option key={t.tenant.id} value={t.tenant.id}>
                    {t.tenant.name} (/{t.tenant.slug})
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3.5 pr-8 bg-neutral-100/80 border border-neutral-200/60 focus:border-neutral-300 focus:bg-white rounded-xl text-xs font-medium text-neutral-700 hover:text-neutral-900 cursor-pointer appearance-none focus:outline-none transition shadow-2xs"
              >
                <option value="ALL">All Event Types</option>
                <option value="DEDUCTION">Exam Starts (-1 Deductions)</option>
                <option value="ALLOCATION">Top-up Allocations (+)</option>
                <option value="ADJUSTMENT">Limit Adjustments</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
            </div>
          </div>

          {/* Ledger Table Container Card */}
          <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs overflow-visible">
            {/* Header Bar */}
            <div className="bg-neutral-50/90 rounded-t-2xl px-5 py-3 border-b border-neutral-200/60 flex items-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <span className="w-36">Date & Time</span>
              <span className="w-28 text-center">Event Type</span>
              <span className="w-24 text-center">Change</span>
              <span className="flex-1 min-w-[200px]">Memo / Description</span>
              <span className="w-28 text-center">Balance</span>
              <span className="w-28 text-right">Initiator</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-neutral-100/80 text-xs">
              {histories.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 font-medium text-xs">
                  {loading ? "Loading audit ledger..." : "No credit ledger history found for this selection."}
                </div>
              ) : (
                histories.map((h) => {
                  const isDeduction = h.type === "DEDUCTION" || h.amount < 0;
                  const isAllocation = h.type === "ALLOCATION" || h.amount > 0;

                  return (
                    <div
                      key={h.id}
                      className="px-5 py-3.5 flex items-center hover:bg-neutral-50/60 transition group relative text-neutral-700"
                    >
                      {/* Date & Time */}
                      <span className="w-36 font-mono text-[11px] text-neutral-500">
                        {new Date(h.createdAt).toLocaleDateString()} {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Type Badge */}
                      <div className="w-28 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            h.type === "DEDUCTION"
                              ? "bg-black text-white"
                              : h.type === "ALLOCATION"
                              ? "bg-neutral-100 text-neutral-900 border border-neutral-300 font-bold"
                              : "bg-neutral-100 text-neutral-700 border border-neutral-200/70"
                          }`}
                        >
                          {h.type === "DEDUCTION" ? "Exam Start" : h.type}
                        </span>
                      </div>

                      {/* Credit Change */}
                      <span className="w-24 text-center font-mono font-bold text-neutral-900">
                        {h.amount > 0 ? `+${h.amount}` : h.amount}
                      </span>

                      {/* Transaction Memo */}
                      <span className="flex-1 min-w-[200px] font-medium text-neutral-900 truncate pr-2">
                        {h.description}
                      </span>

                      {/* Balance After */}
                      <span className="w-28 text-center font-mono font-medium text-neutral-700">
                        <strong className="text-neutral-900 font-semibold">{h.balanceAfter.toLocaleString()}</strong>
                        <span className="text-[10px] text-neutral-400 font-normal"> Left</span>
                      </span>

                      {/* Initiator */}
                      <span className="w-28 text-right text-[11px] text-neutral-500 font-medium truncate">
                        {h.adminName || "System"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="px-5 py-3 bg-neutral-50/50 border-t border-neutral-100/80 flex items-center justify-between text-xs text-neutral-400 font-medium">
              <span>
                Showing {histories.length} of {totalRecords} records
              </span>

              {totalRecords > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded-lg border border-neutral-200 bg-white text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="px-2 py-0.5 text-neutral-700 font-mono text-[11px] font-medium">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1 rounded-lg border border-neutral-200 bg-white text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
