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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
                White-Label Customization
              </h2>
              <p className="text-xs text-neutral-500">
                Configure brand identity for <strong className="text-neutral-900 font-medium">{tenant.name}</strong> ({tenant.slug})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LIVE PREVIEW CARD */}
          <div className="rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div className="bg-neutral-50 px-3 py-1.5 border-b border-neutral-200 text-[10px] font-semibold uppercase text-neutral-500 flex items-center justify-between">
              <span>Live Portal Header Preview</span>
              <span className="text-neutral-600 font-medium">Client View</span>
            </div>
            <div className="p-3.5 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={name}
                    className="h-8 w-auto max-w-[120px] object-contain rounded-lg border border-neutral-200 p-0.5"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {monogram}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-neutral-900 leading-tight">
                    {portalTitle || `${name} Assessment Portal`}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-medium">
                    {name || "Company Name"}
                  </div>
                </div>
              </div>

              <div
                className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Proctored Session
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Company / Organization Display Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tata AIG Insurance"
                  className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                />
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Company Brand Logo URL (PNG / SVG / WebP)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <ImageIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://company.com/assets/logo.png"
                    className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                  />
                </div>
                {logoUrl && (
                  <div className="w-9 h-9 rounded-lg border border-neutral-200 bg-white p-1 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Enter an image URL or leave blank to display an automated modern monogram badge.
              </p>
            </div>

            {/* Custom Portal Title */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Custom Portal Title (Candidate & Admin Header)
              </label>
              <input
                type="text"
                value={portalTitle}
                onChange={(e) => setPortalTitle(e.target.value)}
                placeholder="e.g. Tata AIG Talent Assessment Portal"
                className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
              />
            </div>

            {/* Brand Theme Color */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Primary Brand Theme Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-neutral-200 p-0.5 cursor-pointer bg-white shrink-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#003F72"
                  className="flex-1 bg-neutral-50/60 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                />
              </div>

              {/* Preset Swatches */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] text-neutral-400">Presets:</span>
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
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      primaryColor === swatch.hex
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: swatch.hex }} />
                    <span>{swatch.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-neutral-200 text-neutral-700 font-medium text-xs hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
