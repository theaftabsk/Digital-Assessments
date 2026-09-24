"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  KeyRound,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Edit2,
  Trash2,
  ShieldCheck,
  UserCheck,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  Activity,
  Layers,
  Eye,
  Lock,
  ExternalLink,
  Terminal,
} from "lucide-react";

interface AssessmentItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  durationMins: number;
}

interface VendorItem {
  id: string;
  vendorCode: string;
  name: string;
  email: string;
  phone?: string;
  apiKey?: string;
  contactPerson?: string;
  status: string;
  creditUsed: number;
  totalCandidates: number;
  totalAssessments: number;
  assignedAssessments: AssessmentItem[];
  createdAt: string;
}

export default function VendorsManagementPage() {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedApiKey, setCopiedApiKey] = useState<string | null>(null);
  const [copiedDocLink, setCopiedDocLink] = useState(false);
  const [copiedDocPass, setCopiedDocPass] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null);

  // Add Vendor Form
  const [newVendor, setNewVendor] = useState({
    name: "",
    email: "",
    password: "Vendor@" + Math.floor(100 + Math.random() * 900),
    phone: "",
    contactPerson: "",
    assignedAssessmentIds: [] as string[],
  });

  // Edit / Reset Password Form
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    contactPerson: "",
    status: "ACTIVE",
    newPassword: "",
  });

  // Assign Assessment Checkboxes
  const [selectedAssessmentIds, setSelectedAssessmentIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem("banca_admin_token") || "";

      // 1. Fetch Vendors
      const vRes = await fetch(`${baseUrl}/api/v1/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vData = await vRes.json();
      if (Array.isArray(vData)) {
        setVendors(vData);
      }

      // 2. Fetch Assessments
      const aRes = await fetch(`${baseUrl}/api/v1/assessments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const aData = await aRes.json();
      if (aData.success && Array.isArray(aData.assessments)) {
        setAssessments(aData.assessments);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCopyApiKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedApiKey(text);
    setTimeout(() => setCopiedApiKey(null), 2000);
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.email) {
      showToast("error", "Vendor Name and Unique Email are required.");
      return;
    }

    setSaving(true);
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem("banca_admin_token") || "";

      const res = await fetch(`${baseUrl}/api/v1/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newVendor),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create vendor");
      }

      showToast("success", `Vendor "${newVendor.name}" created successfully!`);
      setShowAddModal(false);
      setNewVendor({
        name: "",
        email: "",
        password: "Vendor@" + Math.floor(100 + Math.random() * 900),
        phone: "",
        contactPerson: "",
        assignedAssessmentIds: [],
      });
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Error creating vendor");
    } finally {
      setSaving(false);
    }
  };

  const openAssignModal = async (vendor: VendorItem) => {
    setSelectedVendor(vendor);
    setSelectedAssessmentIds(vendor.assignedAssessments.map((a) => a.id));
    setShowAssignModal(true);
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem("banca_admin_token") || "";
      const aRes = await fetch(`${baseUrl}/api/v1/assessments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const aData = await aRes.json();
      if (aData.success && Array.isArray(aData.assessments)) {
        setAssessments(aData.assessments);
      }
    } catch {}
  };

  const handleSaveAssignments = async () => {
    if (!selectedVendor) return;
    setSaving(true);
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem("banca_admin_token") || "";

      const res = await fetch(`${baseUrl}/api/v1/vendors/${selectedVendor.id}/assign-assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessmentIds: selectedAssessmentIds,
          assignedBy: "Admin",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign assessments");

      showToast("success", `Updated assigned assessments for "${selectedVendor.name}"`);
      setShowAssignModal(false);
      await loadData();
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (vendor: VendorItem) => {
    setSelectedVendor(vendor);
    setEditForm({
      name: vendor.name,
      phone: vendor.phone || "",
      contactPerson: vendor.contactPerson || "",
      status: vendor.status || "ACTIVE",
      newPassword: "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    setSaving(true);
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem("banca_admin_token") || "";

      const payload: any = {
        name: editForm.name,
        phone: editForm.phone,
        contactPerson: editForm.contactPerson,
        status: editForm.status,
      };

      if (editForm.newPassword.trim()) {
        payload.password = editForm.newPassword.trim();
      }

      const res = await fetch(`${baseUrl}/api/v1/vendors/${selectedVendor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update vendor");

      showToast("success", `Vendor "${editForm.name}" updated successfully!`);
      setShowEditModal(false);
      await loadData();
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVendor = async (vendor: VendorItem) => {
    if (!confirm(`Are you sure you want to remove Vendor "${vendor.name}"? Candidates will remain safe but will be unlinked from this vendor.`)) {
      return;
    }

    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem("banca_admin_token") || "";

      const res = await fetch(`${baseUrl}/api/v1/vendors/${vendor.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete vendor");

      showToast("success", data.message || "Vendor deleted");
      await loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalCandidatesAll = vendors.reduce((acc, v) => acc + (v.totalCandidates || 0), 0);
  const totalCreditAll = vendors.reduce((acc, v) => acc + (v.creditUsed || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-white transition-all ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── 1. Apple Liquid Glass Toolbar (No Duplicate In-Page Header) ── */}
      <div className="bg-white/80 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search vendor name, code, email, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/[0.03] border border-black/[0.06] rounded-2xl text-xs font-semibold text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-black/[0.03] hover:bg-black/[0.06] text-black rounded-2xl transition font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-black/[0.06]"
            title="Refresh Vendors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-black" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-black hover:bg-black/85 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add New Vendor</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Stats Cards (Apple Monochrome) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Total Vendors</span>
            <div className="text-3xl font-black text-black tracking-tight">{vendors.length}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">
                {vendors.filter((v) => v.status === "ACTIVE").length} Active Agencies
              </span>
            </div>
          </div>
          <div className="w-11 h-11 bg-black/[0.04] border border-black/[0.06] text-black rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Vendor Candidates</span>
            <div className="text-3xl font-black text-black tracking-tight">{totalCandidatesAll}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">Assigned Across Batches</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-black/[0.04] border border-black/[0.06] text-black rounded-2xl flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Exam Consumption</span>
            <div className="text-3xl font-black text-black tracking-tight">{totalCreditAll}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">Credits Utilized</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-black/[0.04] border border-black/[0.06] text-black rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Active Assessments</span>
            <div className="text-3xl font-black text-black tracking-tight">{assessments.length}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">Available For Assignment</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-black/[0.04] border border-black/[0.06] text-black rounded-2xl flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Protected Vendor API Documentation Banner ── */}
      <div className="bg-black text-white rounded-3xl p-5 shadow-sm border border-black/[0.1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 text-white rounded-xl border border-white/20">
              <Lock size={15} />
            </div>
            <h3 className="text-sm font-black text-white tracking-tight">
              Protected Vendor API Documentation (Swagger OAS 3.0)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20">
              Secured
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed tracking-tight">
            Protected endpoint for external vendor developer teams to automate candidate registration and retrieve scores via REST.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
            <span className="text-zinc-400">Portal User:</span>
            <code className="px-2 py-0.5 bg-white/10 text-white rounded-lg border border-white/15 font-bold">niva-admin</code>
            <span className="text-zinc-400 ml-1">Password:</span>
            <code className="px-2 py-0.5 bg-white/10 text-white rounded-lg border border-white/15 font-bold">Niva@Doc2026!</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText("Niva@Doc2026!");
                setCopiedDocPass(true);
                setTimeout(() => setCopiedDocPass(false), 2000);
              }}
              className="text-[10px] text-zinc-300 hover:text-white underline cursor-pointer ml-1"
            >
              {copiedDocPass ? "✓ Copied" : "Copy Password"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${getApiBaseUrl()}/api/docs`);
              setCopiedDocLink(true);
              setTimeout(() => setCopiedDocLink(false), 2000);
            }}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-bold transition border border-white/15 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedDocLink ? <Check size={14} className="text-white" /> : <Copy size={14} />}
            <span>{copiedDocLink ? "Link Copied!" : "Copy Doc URL"}</span>
          </button>

          <a
            href={`${getApiBaseUrl()}/api/docs?key=Niva@Doc2026!`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white hover:bg-zinc-100 text-black rounded-2xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer no-underline"
          >
            <ExternalLink size={14} />
            <span>Open API Docs</span>
          </a>
        </div>
      </div>

      {/* ── 4. Vendors Table (Apple Liquid Glass) ── */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black/[0.01]">
          <div className="text-xs font-bold text-zinc-500">
            Showing {filteredVendors.length} of {vendors.length} Registered Agencies
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b border-black/[0.06] text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-4">Vendor Code & Name</th>
                <th className="py-4 px-4">Login Credentials</th>
                <th className="py-4 px-4">Assigned Assessments</th>
                <th className="py-4 px-4 text-center">Candidates</th>
                <th className="py-4 px-4 text-center">Exam Credits</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-black">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400 font-semibold">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading vendor accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 size={28} className="text-zinc-300" />
                      <span className="font-bold text-sm text-black">No vendors found</span>
                      <span className="text-xs text-zinc-400">Click &quot;Add New Vendor&quot; above to create the first vendor account.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-black/[0.015] transition-colors">
                    {/* Name & Code */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/admin/vendors/${vendor.id}`}
                          className="w-9 h-9 rounded-2xl bg-black text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs"
                        >
                          {vendor.name.slice(0, 2).toUpperCase()}
                        </Link>
                        <div>
                          <div className="font-black text-black flex items-center gap-1.5 tracking-tight">
                            <Link
                              href={`/admin/vendors/${vendor.id}`}
                              className="hover:opacity-75 transition"
                            >
                              {vendor.name}
                            </Link>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/[0.04] text-black border border-black/[0.06]">
                              {vendor.vendorCode}
                            </span>
                          </div>
                          {vendor.contactPerson && (
                            <p className="text-[11px] text-zinc-400 font-medium tracking-tight mt-0.5">Contact: {vendor.contactPerson}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email, Phone & API Key */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-black tracking-tight">
                          <Mail size={12} className="text-zinc-400 shrink-0" />
                          <span>{vendor.email}</span>
                          <button
                            onClick={() => handleCopy(vendor.email)}
                            className="p-1 hover:bg-black/[0.04] rounded-lg text-zinc-400 hover:text-black cursor-pointer"
                            title="Copy email"
                          >
                            {copiedEmail === vendor.email ? <Check size={11} className="text-black" /> : <Copy size={11} />}
                          </button>
                        </div>
                        {vendor.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold tracking-tight">
                            <Phone size={11} className="text-zinc-400 shrink-0" />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                        {vendor.apiKey && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/[0.04] text-black font-mono text-[10px] font-bold border border-black/[0.06]">
                              <KeyRound size={10} className="text-black" />
                              <span className="truncate max-w-[110px]">{vendor.apiKey}</span>
                            </span>
                            <button
                              onClick={() => handleCopyApiKey(vendor.apiKey || "")}
                              className="p-1 hover:bg-black/[0.06] rounded-lg text-zinc-500 hover:text-black cursor-pointer"
                              title="Copy Vendor API Key"
                            >
                              {copiedApiKey === vendor.apiKey ? <Check size={11} className="text-black" /> : <Copy size={11} />}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Assigned Assessments */}
                    <td className="py-4 px-4">
                      {vendor.assignedAssessments && vendor.assignedAssessments.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {vendor.assignedAssessments.map((a) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/[0.03] text-black font-bold text-[11px] border border-black/[0.06]"
                            >
                              <FileText size={10} />
                              <span className="truncate max-w-[120px]">{a.name}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-zinc-400 bg-black/[0.02] px-2.5 py-1 rounded-xl border border-black/[0.06]">
                          No Tests Assigned
                        </span>
                      )}
                    </td>

                    {/* Candidates Count */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-black text-black bg-black/[0.03] px-2.5 py-1 rounded-xl border border-black/[0.06]">
                        {vendor.totalCandidates || 0}
                      </span>
                    </td>

                    {/* Credit Used */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-black text-black bg-black/[0.03] px-2.5 py-1 rounded-xl border border-black/[0.06]">
                        {vendor.creditUsed || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          vendor.status === "ACTIVE"
                            ? "bg-black text-white shadow-xs"
                            : "bg-black/[0.03] text-zinc-400 border border-black/[0.06]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${vendor.status === "ACTIVE" ? "bg-white" : "bg-zinc-400"}`}></span>
                        {vendor.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/vendors/${vendor.id}`}
                          className="px-2.5 py-1.5 bg-white hover:bg-black/[0.04] text-black rounded-xl font-bold text-[11px] transition flex items-center gap-1 cursor-pointer border border-black/[0.06]"
                          title="View 360° Profile & Logs"
                        >
                          <Eye size={12} />
                          <span>360° View</span>
                        </Link>

                        <button
                          onClick={() => openAssignModal(vendor)}
                          className="px-2.5 py-1.5 bg-white hover:bg-black/[0.04] text-black rounded-xl font-bold text-[11px] transition flex items-center gap-1 cursor-pointer border border-black/[0.06]"
                          title="Assign Assessments"
                        >
                          <FileText size={12} />
                          <span>Assign</span>
                        </button>

                        <button
                          onClick={() => openEditModal(vendor)}
                          className="p-2 hover:bg-black/[0.04] text-zinc-600 hover:text-black rounded-xl border border-black/[0.06] bg-white transition cursor-pointer"
                          title="Edit Details / Reset Password"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => handleDeleteVendor(vendor)}
                          className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-xl border border-black/[0.06] bg-white transition cursor-pointer"
                          title="Remove Vendor"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL 1: ADD NEW VENDOR ────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 size={18} />
                </span>
                <h3 className="font-black text-base text-slate-900">Create New Vendor Account</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Recruitment Solutions"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Unique Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vendor1@example.com"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vendor@123"
                    value={newVendor.password}
                    onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={newVendor.contactPerson}
                    onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Assign Initial Tests */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">
                  Assign Initial Assessments (Optional)
                </label>
                <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  {assessments.length === 0 ? (
                    <p className="text-slate-400 text-center py-2">No assessments available.</p>
                  ) : (
                    assessments.map((a) => (
                      <label
                        key={a.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={newVendor.assignedAssessmentIds.includes(a.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewVendor({
                                ...newVendor,
                                assignedAssessmentIds: [...newVendor.assignedAssessmentIds, a.id],
                              });
                            } else {
                              setNewVendor({
                                ...newVendor,
                                assignedAssessmentIds: newVendor.assignedAssessmentIds.filter((id) => id !== a.id),
                              });
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span className="font-bold text-slate-800">{a.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({a.durationMins}m)</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{saving ? "Creating..." : "Create Vendor Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: ASSIGN ASSESSMENTS ────────────────────────────────────── */}
      {showAssignModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Assign Assessments to {selectedVendor.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Vendor will only see and upload candidates to checked assessments.
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-700">Available Assessments ({assessments.length})</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssessmentIds(assessments.map((a) => a.id))}
                    className="text-blue-600 font-bold hover:underline cursor-pointer text-[11px]"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedAssessmentIds([])}
                    className="text-slate-500 font-bold hover:underline cursor-pointer text-[11px]"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                {assessments.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No assessments found.</p>
                ) : (
                  assessments.map((a) => {
                    const isChecked = selectedAssessmentIds.includes(a.id);
                    return (
                      <label
                        key={a.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? "bg-blue-50 border-blue-300 text-blue-900"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAssessmentIds([...selectedAssessmentIds, a.id]);
                              } else {
                                setSelectedAssessmentIds(selectedAssessmentIds.filter((id) => id !== a.id));
                              }
                            }}
                            className="rounded text-blue-600 w-4 h-4"
                          />
                          <div>
                            <span className="font-bold block">{a.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Duration: {a.durationMins} mins • Slug: {a.slug}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            a.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : a.status === "UPCOMING"
                              ? "bg-sky-100 text-sky-700"
                              : a.status === "EXPIRED"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {a.status}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{saving ? "Saving..." : "Save Assessment Assignments"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: EDIT VENDOR & RESET PASSWORD ─────────────────────────── */}
      {showEditModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Edit Vendor & Reset Password
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">{selectedVendor.vendorCode} • {selectedVendor.email}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editForm.contactPerson}
                    onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Vendor Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="ACTIVE">ACTIVE (Can log in & manage candidates)</option>
                  <option value="SUSPENDED">SUSPENDED (Login temporarily blocked)</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                  <KeyRound size={14} />
                  <span>Reset Vendor Password (Optional)</span>
                </div>
                <p className="text-[11px] text-amber-700">Leave blank to keep the current password unchanged.</p>
                <input
                  type="text"
                  placeholder="Enter new password (e.g. NewPass@2026)"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 font-semibold text-slate-900 bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
