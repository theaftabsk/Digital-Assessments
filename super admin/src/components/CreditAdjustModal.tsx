"use client";

import { useState } from "react";
import { X, Sliders, AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface CreditAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: string;
    name: string;
    creditLimit: number;
    usedCredit: number;
    remainingCredit: number;
  } | null;
  onSuccess: () => void;
}

export default function CreditAdjustModal({
  isOpen,
  onClose,
  tenant,
  onSuccess,
}: CreditAdjustModalProps) {
  const [newLimit, setNewLimit] = useState<number>(tenant ? tenant.creditLimit : 500);
  const [reason, setReason] = useState<string>("Executive Quota Revision");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !tenant) return null;

  const used = tenant.usedCredit;
  const isBelowUsed = newLimit < used;
  const diff = newLimit - tenant.creditLimit;
  const newRemaining = Math.max(0, newLimit - used);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBelowUsed) {
      setError(`Cannot reduce credit limit below ${used} used credits.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenant.id}/credits/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newLimit: Number(newLimit),
          adminName: "Super Admin",
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || "Failed to adjust credit limit.");
      }
    } catch {
      setError("Network error while communicating with server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Top Title & Close */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Adjust Credit Limit</h3>
              <p className="text-xs text-slate-500 font-medium">Tenant: <strong className="text-indigo-600">{tenant.name}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5 relative z-10">
          {/* Current State Info Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px]">Current Total Limit</span>
              <strong className="text-slate-900 text-sm font-mono">{tenant.creditLimit.toLocaleString()}</strong>
            </div>
            <div className="text-center">
              <span className="text-slate-500 block text-[11px]">Already Consumed</span>
              <strong className="text-amber-600 text-sm font-mono">{tenant.usedCredit.toLocaleString()} Used</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">Current Balance</span>
              <strong className="text-blue-600 text-sm font-mono">{tenant.remainingCredit.toLocaleString()} Left</strong>
            </div>
          </div>

          {/* New Limit Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Credit Limit * (Minimum: {used})
            </label>
            <div className="relative">
              <input
                type="number"
                min={used}
                required
                value={newLimit}
                onChange={(e) => setNewLimit(parseInt(e.target.value) || 0)}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-lg font-black focus:outline-none ${
                  isBelowUsed
                    ? "border-rose-300 text-rose-600 focus:ring-1 focus:ring-rose-500 bg-rose-50/40"
                    : "border-slate-200 text-slate-900 focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
                }`}
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">Credits</span>
            </div>
          </div>

          {/* Real-Time Safety Warning Alert */}
          {isBelowUsed ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                Safety Rule Violation: Cannot set limit lower than {used} used credits! (Attempting {newLimit})
              </span>
            </div>
          ) : (
            /* Calculation Preview */
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>Adjustment Delta:</span>
                <span className={`font-mono font-bold ${diff >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                  {diff >= 0 ? `+${diff}` : diff} Credits
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Consumed Exam Credits:</span>
                <span className="font-mono text-slate-800 font-bold">{used.toLocaleString()} (Preserved)</span>
              </div>
              <div className="pt-2 border-t border-indigo-100 flex items-center justify-between font-black text-indigo-700">
                <span>New Remaining Available Credits:</span>
                <span className="font-mono text-sm font-black">{newRemaining.toLocaleString()} Credits</span>
              </div>
            </div>
          )}

          {/* Reason / Memo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Adjustment Reason / Memo
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Contract Amendment / Budget Reallocation"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isBelowUsed}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs transition shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Adjusting..." : "Confirm Adjustment"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
