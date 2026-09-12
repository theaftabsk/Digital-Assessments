"use client";

import { useState } from "react";
import {
  X,
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  Coins,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTenantModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTenantModalProps) {
  // Form Inputs
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creditLimit, setCreditLimit] = useState(500);
  const [logoUrl, setLogoUrl] = useState("");
  const [portalTitle, setPortalTitle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#003F72");
  const [adminName, setAdminName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRole, setAdminRole] = useState("ADMIN");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success Created State
  const [createdDetails, setCreatedDetails] = useState<{
    tenantName: string;
    slug: string;
    username: string;
    password: string;
    creditLimit: number;
    adminRole: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto slug generator from name
  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(autoSlug);
    if (!portalTitle || portalTitle.endsWith("Assessment Portal")) {
      setPortalTitle(val ? `${val} Assessment Portal` : "");
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 14; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminPassword(pass);
    setShowPassword(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAllCredentials = () => {
    if (!createdDetails) return;
    const adminPortalUrl = typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3000/admin/login`
      : "https://admin.greatcampus.in/admin/login";

    const text = `===========================================
🎉 ASSESSMENT PORTAL - CLIENT ACCESS CREDENTIALS
===========================================
🏢 Organization: ${createdDetails.tenantName} (${createdDetails.slug})
🔗 Admin Portal URL: ${adminPortalUrl}

👤 Admin Username: ${createdDetails.username}
🔑 Password: ${createdDetails.password}
🛡️ Role: ${createdDetails.adminRole}
🪙 Allocated Exam Credits: ${createdDetails.creditLimit.toLocaleString()}

👉 You can now sign in to configure assessments, invite candidates, and monitor real-time AI-proctored exams.
===========================================`;

    copyToClipboard(text, "all");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the organization name.");
      return;
    }
    if (!adminUsername.trim()) {
      setError("Please enter an admin username/email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/super-admin/tenants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          logoUrl: logoUrl.trim() || undefined,
          portalTitle: portalTitle.trim() || undefined,
          primaryColor: primaryColor.trim() || undefined,
          creditLimit: Number(creditLimit) || 500,
          adminName: adminName.trim() || undefined,
          adminUsername: adminUsername.trim(),
          adminPassword: adminPassword.trim() || undefined,
          adminRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedDetails({
          tenantName: data.tenant.name,
          slug: data.tenant.slug,
          username: data.admin.username,
          password: data.admin.initialPassword,
          creditLimit: data.tenant.creditLimit,
          adminRole: data.admin.role,
        });
        onSuccess();
      } else {
        setError(data.message || "Failed to create client organization.");
      }
    } catch {
      setError("Network error connecting to backend API.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreatedDetails(null);
    setName("");
    setSlug("");
    setLogoUrl("");
    setPortalTitle("");
    setPrimaryColor("#003F72");
    setAdminUsername("");
    setAdminPassword("");
    setAdminName("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
                {createdDetails ? "Credentials Issued" : "Create Client Organization"}
              </h2>
              <p className="text-xs text-neutral-500">
                {createdDetails
                  ? "Copy and deliver login credentials to the client"
                  : "Provision a new multi-tenant organization & issue Admin credentials"}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
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

          {/* VIEW A: SUCCESS CREDENTIALS READY CARD */}
          {createdDetails ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 text-neutral-900 font-semibold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                  Client Organization & Admin Account Activated!
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  The initial password is shown below. For security, it is stored as an encrypted bcrypt hash in the database and will not be displayed again.
                </p>
              </div>

              {/* Credentials Box */}
              <div className="bg-neutral-900 text-neutral-100 rounded-xl p-4 space-y-3 font-mono text-xs border border-neutral-800">
                {/* Org & Portal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Organization</span>
                    <div className="text-white font-semibold text-xs">{createdDetails.tenantName}</div>
                    <span className="text-neutral-400 text-[11px]">slug: {createdDetails.slug}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Quota Limit</span>
                    <div className="text-white font-semibold text-xs">
                      {createdDetails.creditLimit.toLocaleString()} Credits
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="flex items-center justify-between bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700/60">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-0.5">Admin Username / ID</span>
                    <span className="text-white font-medium">{createdDetails.username}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdDetails.username, "user")}
                    className="p-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-neutral-200 transition cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    {copiedField === "user" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "user" ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Password */}
                <div className="flex items-center justify-between bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700/60">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-0.5">Generated Admin Password</span>
                    <span className="text-white font-medium text-xs">
                      {createdDetails.password}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdDetails.password, "pass")}
                    className="p-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-neutral-200 transition cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    {copiedField === "pass" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "pass" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2 px-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium text-xs transition cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={copyAllCredentials}
                  className="py-2 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copiedField === "all" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Credentials!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Credentials Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* VIEW B: CREATE FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* SECTION 1: ORGANIZATION DETAILS */}
              <div>
                <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 mb-3">
                  <Building2 className="w-3.5 h-3.5 text-neutral-600" />
                  1. Organization Profile
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata AIG Insurance"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Unique Identifier / Slug *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. tata-aig"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 font-mono transition"
                    />
                  </div>
                </div>

                {/* Quota limit input */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Initial Exam Credit Quota *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Coins className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        min="1"
                        required
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(Number(e.target.value))}
                        className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-neutral-900 font-mono focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[100, 500, 1000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCreditLimit(preset)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                            creditLimit === preset
                              ? "bg-black text-white border-black"
                              : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Each launched candidate exam consumes 1 exam credit.
                  </p>
                </div>
              </div>

              {/* SECTION 2: ADMINISTRATOR CREDENTIALS */}
              <div className="border-t border-neutral-100 pt-3.5">
                <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                  2. Primary Administrator Credentials
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Admin Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. HR Talent Acquisition Lead"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Username / Login ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. tata_hr or hr@tata.com"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Access Role
                      </label>
                      <select
                        value={adminRole}
                        onChange={(e) => setAdminRole(e.target.value)}
                        className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                      >
                        <option value="ADMIN">Full Administrator</option>
                        <option value="RECRUITER">Recruiter / Examiner</option>
                      </select>
                    </div>
                  </div>

                  {/* Password Input with Generate button */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-neutral-700">
                        Initial Login Password
                      </label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Strong Key
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Leave blank to auto-generate secure password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl pl-9 pr-9 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 font-mono transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: WHITE-LABEL BRANDING */}
              <div className="border-t border-neutral-100 pt-3.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-neutral-600" />
                    3. White-Label Branding (Optional)
                  </span>
                  <span className="text-[11px] text-neutral-400">Can customize anytime</span>
                </div>

                <div className="space-y-3">
                  {/* Logo URL Input & Preview */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Client Organization Logo URL
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                        <input
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                        />
                      </div>
                      {logoUrl && (
                        <div className="w-9 h-9 rounded-lg border border-neutral-200 bg-white p-1 flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" onError={() => {}} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Portal Title */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Custom Portal Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tata AIG Assessment Portal"
                        value={portalTitle}
                        onChange={(e) => setPortalTitle(e.target.value)}
                        className="w-full bg-neutral-50/60 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900 transition"
                      />
                    </div>

                    {/* Brand Primary Color */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Brand Theme Color
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
                    </div>
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-neutral-400">Presets:</span>
                    {[
                      { name: "Navy", hex: "#003F72" },
                      { name: "Blue", hex: "#2563EB" },
                      { name: "Emerald", hex: "#059669" },
                      { name: "Purple", hex: "#7C3AED" },
                      { name: "Dark", hex: "#000000" },
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
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
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
                      <span>Provisioning Organization...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Issue Credentials & Provision</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
