"use client";

import { useState } from "react";
import { X, ArrowRight, Coins } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface CreditAllocateModalProps {
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

export default function CreditAllocateModal({
  isOpen,
  onClose,
  tenant,
  onSuccess,
}: CreditAllocateModalProps) {
  const [amount, setAmount] = useState<number>(500);
  const [notes, setNotes] = useState<string>("Quarterly Top-up Allocation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !tenant) return null;

  const newTotalLimit = tenant.creditLimit + (amount || 0);
  const newRemaining = tenant.remainingCredit + (amount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("Please enter a valid credit amount greater than 0.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenant.id}/credits/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          adminName: "Super Admin",
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || "Failed to allocate credits.");
      }
    } catch {
      setError("Network error while connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 250, 500, 1000, 2500];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black tracking-tight">Allocate Credits</h3>
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
          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Quick Presets (+Credits)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    amount === val
                      ? "bg-black text-white"
                      : "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200"
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Credits to Allocate *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-base font-bold text-black focus:outline-none focus:border-black"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-zinc-400">Credits</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Allocation Memo
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Quarterly allocation"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-medium text-black focus:outline-none focus:border-black"
            />
          </div>

          {/* Calculation Preview */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-500 font-medium">
              <span>Current Limit & Balance:</span>
              <span className="font-mono font-bold text-zinc-900">
                {tenant.creditLimit.toLocaleString()} ({tenant.remainingCredit.toLocaleString()} left)
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-800 font-bold">
              <span>Allocation Added:</span>
              <span className="font-mono text-sm font-bold text-black">+{amount.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between font-bold text-black">
              <span>New Limit & Balance:</span>
              <span className="font-mono text-sm">
                {newTotalLimit.toLocaleString()} ({newRemaining.toLocaleString()} left)
              </span>
            </div>
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
              disabled={loading || amount <= 0}
              className="px-4 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Allocating..." : "Confirm Allocation"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
