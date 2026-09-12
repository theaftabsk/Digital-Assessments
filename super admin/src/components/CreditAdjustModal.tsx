"use client";

import { useState } from "react";
import { X, Sliders, ShieldAlert, ArrowRight } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black tracking-tight">Adjust Credit Limit</h3>
              <p className="text-xs text-zinc-500 font-medium">
                Organization: <strong className="text-black font-semibold">{tenant.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Current State Info Banner */}
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Current Limit</span>
              <strong className="text-black text-sm font-mono font-bold">{tenant.creditLimit.toLocaleString()}</strong>
            </div>
            <div className="text-center">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Consumed</span>
              <strong className="text-zinc-600 text-sm font-mono font-bold">{tenant.usedCredit.toLocaleString()}</strong>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Balance</span>
              <strong className="text-black text-sm font-mono font-bold">{tenant.remainingCredit.toLocaleString()}</strong>
            </div>
          </div>

          {/* New Limit Input */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              New Credit Limit * (Minimum: {used})
            </label>
            <div className="relative">
              <input
                type="number"
                min={used}
                required
                value={newLimit}
                onChange={(e) => setNewLimit(parseInt(e.target.value) || 0)}
                className={`w-full bg-white border rounded-lg px-3.5 py-2 text-base font-bold text-black focus:outline-none ${
                  isBelowUsed
                    ? "border-red-500 text-red-600"
                    : "border-zinc-200 focus:border-black"
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-zinc-400">Credits</span>
            </div>
          </div>

          {/* Safety Rule Warning */}
          {isBelowUsed ? (
            <div className="p-2.5 rounded-lg bg-zinc-100 border border-zinc-300 text-black text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>
                Cannot set limit lower than {used} used credits.
              </span>
            </div>
          ) : (
            /* Calculation Preview */
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500 font-medium">
                <span>Adjustment Delta:</span>
                <span className="font-mono font-bold text-black">
                  {diff >= 0 ? `+${diff}` : diff} Credits
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 font-medium">
                <span>Consumed (Preserved):</span>
                <span className="font-mono text-zinc-700 font-semibold">{used.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between font-bold text-black">
                <span>New Balance:</span>
                <span className="font-mono text-sm">{newRemaining.toLocaleString()} Credits</span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Adjustment Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Contract revision"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-medium text-black focus:outline-none focus:border-black"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-zinc-100 border border-zinc-300 text-black text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-600 hover:text-black hover:bg-zinc-100 border border-zinc-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isBelowUsed}
              className="px-4 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Adjusting..." : "Confirm Adjustment"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
