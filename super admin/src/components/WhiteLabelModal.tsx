"use client";

import { useState, useEffect } from "react";
import {
  X,
  Palette,
  Image as ImageIcon,
  Building2,
  CheckCircle2,
  Sparkles,
  Save,
  Globe,
  ExternalLink,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface WhiteLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    portalTitle?: string | null;
    primaryColor?: string | null;
  } | null;
  onSuccess: () => void;
}

export default function WhiteLabelModal({
  isOpen,
  onClose,
  tenant,
  onSuccess,
}: WhiteLabelModalProps) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [portalTitle, setPortalTitle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#003F72");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || "");
      setLogoUrl(tenant.logoUrl || "");
      setPortalTitle(tenant.portalTitle || `${tenant.name} Assessment Portal`);
      setPrimaryColor(tenant.primaryColor || "#003F72");
      setSuccessMsg(null);
      setError(null);
    }
  }, [tenant]);

  if (!isOpen || !tenant) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Company / Organization Name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants/${tenant.id}/white-label`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          logoUrl: logoUrl.trim() || null,
          portalTitle: portalTitle.trim() || `${name.trim()} Assessment Portal`,
          primaryColor: primaryColor.trim() || "#003F72",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("White-label branding updated successfully!");
        onSuccess();
        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      } else {
        setError(data.message || "Failed to update white-label branding.");
      }
    } catch {
      setError("Network error communicating with backend API.");
    } finally {
      setLoading(false);
    }
  };

  const monogram = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CL";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 ring-4 ring-purple-100">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                White-Label Customization
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Configure brand identity for <strong className="text-purple-700">{tenant.name}</strong> ({tenant.slug})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LIVE PREVIEW CARD */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 flex items-center justify-between">
              <span>Live Portal Header Preview</span>
              <span className="text-purple-600 font-bold">Client View</span>
            </div>
            <div className="p-4 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={name}
                    className="h-9 w-auto max-w-[130px] object-contain rounded-lg border border-slate-200 p-0.5"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-xl text-white font-black flex items-center justify-center text-xs shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {monogram}
                  </div>
                )}
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {portalTitle || `${name} Assessment Portal`}
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: primaryColor }}>
                    {name || "Company Name"}
                  </div>
                </div>
              </div>

              <div
                className="px-3 py-1 rounded-full text-white text-[11px] font-extrabold shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Proctored Session
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company / Organization Display Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tata AIG Insurance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Brand Logo URL (PNG / SVG / WebP)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://company.com/assets/logo.png"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                {logoUrl && (
                  <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter an image URL or leave blank to display an automated modern monogram badge.
              </p>
            </div>

            {/* Custom Portal Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Custom Portal Title (Candidate & Admin Header)
              </label>
              <input
                type="text"
                value={portalTitle}
                onChange={(e) => setPortalTitle(e.target.value)}
                placeholder="e.g. Tata AIG Talent Assessment Portal"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>

            {/* Brand Theme Color */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Brand Theme Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-200 p-0.5 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#003F72"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              {/* Preset Swatches */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {[
                  { name: "Navy", hex: "#003F72" },
                  { name: "Royal Blue", hex: "#2563EB" },
                  { name: "Emerald", hex: "#059669" },
                  { name: "Purple", hex: "#7C3AED" },
                  { name: "Deep Slate", hex: "#0F172A" },
                  { name: "Crimson", hex: "#DC2626" },
                ].map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => setPrimaryColor(swatch.hex)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold border transition cursor-pointer hover:scale-105"
                    style={{
                      backgroundColor: primaryColor === swatch.hex ? swatch.hex : "#F8FAFC",
                      color: primaryColor === swatch.hex ? "#FFFFFF" : "#334155",
                      borderColor: primaryColor === swatch.hex ? swatch.hex : "#E2E8F0",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: swatch.hex }} />
                    <span>{swatch.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Branding...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Apply White-Label Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
