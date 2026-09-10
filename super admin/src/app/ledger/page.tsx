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
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Super Admin Console</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-extrabold text-blue-600">Credit Audit Ledger</span>
          </div>

          <button
            onClick={fetchTenantsAndLedger}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer border border-slate-200 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </header>

        <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Title & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Credit Audit & Transaction Ledger</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Immutable record of every allocation (+), exam consumption (-), and limit adjustment.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Tenant Dropdown */}
              <select
                value={selectedTenantId}
                onChange={(e) => {
                  setSelectedTenantId(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-blue-600 focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                {tenants.map((t) => (
                  <option key={t.tenant.id} value={t.tenant.id}>
                    {t.tenant.name}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                <option value="ALL">All Event Types</option>
                <option value="DEDUCTION">Exam Starts (-1 Deductions)</option>
                <option value="ALLOCATION">Top-up Allocations (+)</option>
                <option value="ADJUSTMENT">Limit Adjustments</option>
              </select>
            </div>
          </div>

          {/* Ledger Table Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 text-center">Type</th>
                    <th className="py-3 px-4 text-center">Credit Change</th>
                    <th className="py-3 px-4">Transaction Memo / Description</th>
                    <th className="py-3 px-4 text-center">Balance After</th>
                    <th className="py-3 px-4 text-right">Initiator</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {histories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-bold text-xs">
                        No credit ledger history found for this selection.
                      </td>
                    </tr>
                  ) : (
                    histories.map((h) => {
                      const isDeduction = h.type === "DEDUCTION" || h.amount < 0;
                      const isAllocation = h.type === "ALLOCATION" || h.amount > 0;

                      return (
                        <tr key={h.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {new Date(h.createdAt).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                h.type === "ALLOCATION"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  : h.type === "DEDUCTION"
                                  ? "bg-amber-50 border-amber-200 text-amber-800"
                                  : "bg-indigo-50 border-indigo-200 text-indigo-700"
                              }`}
                            >
                              {h.type === "DEDUCTION" ? "Exam Start" : h.type}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono text-xs font-black">
                            <span
                              className={`inline-flex items-center gap-0.5 ${
                                isDeduction ? "text-amber-600" : "text-emerald-600"
                              }`}
                            >
                              {h.amount > 0 ? `+${h.amount}` : h.amount}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-900 font-bold">
                            {h.description}
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                            {h.balanceAfter.toLocaleString()} Left
                          </td>

                          <td className="py-3.5 px-4 text-right text-slate-500 text-[11px] font-semibold">
                            {h.adminName || "System"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalRecords > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 font-bold">
                <div>
                  Showing {histories.length} of {totalRecords} credit transactions
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-blue-600 font-mono font-black shadow-2xs">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
