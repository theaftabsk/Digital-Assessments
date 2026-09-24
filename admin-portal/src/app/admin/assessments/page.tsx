"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Clock,
  Link2,
  Copy,
  CheckCircle2,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  Calendar,
  AlertCircle,
  Zap,
  Users,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  ShieldCheck,
  Terminal,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import ToastContainer, { ToastMessage } from "@/components/Toast";
import { getApiBaseUrl } from "@/lib/config";

interface QuestionBankSummary {
  id: string;
  name: string;
  category?: string;
  questionCount: number;
  totalMarks: number;
}

interface AssessmentSession {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  activeFrom?: string;
  activeUntil?: string;
  durationMins: number;
  totalQuestions: number;
  totalCandidates: number;
  passingPercentage: number;
  maxProctorWarnings: number;
  enableTabSwitch?: boolean;
  enableFullscreen?: boolean;
  enableCopyPaste?: boolean;
  enableCamera?: boolean;
  uniqueCandidateLink: string;
  questionBankId?: string;
  questionBankName?: string;
  questionBank?: {
    id: string;
    name: string;
    category?: string;
    questionCount: number;
  };
  vendorAssignments?: Array<{
    vendorId?: string;
    vendorName?: string;
    vendorCode?: string;
    assignedBy?: string;
    assignedAt?: string;
  }>;
  assignedVendors?: Array<{
    id: string;
    name: string;
    vendorCode: string;
  }>;
  createdAt: string;
}

const EXAM_DURATION_MINS = 45;
const TOTAL_QUESTIONS = 60;

function getComputedStatus(session: AssessmentSession): "ACTIVE" | "UPCOMING" | "EXPIRED" | "INACTIVE" | "DRAFT" {
  if (session.status === "INACTIVE") return "INACTIVE";
  if (session.status === "DRAFT") return "DRAFT";
  const now = new Date();
  if (session.activeFrom && now < new Date(session.activeFrom)) return "UPCOMING";
  if (session.activeUntil && now > new Date(session.activeUntil)) return "EXPIRED";
  return "ACTIVE";
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active
        </span>
      );
    case "UPCOMING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <Clock size={11} />
          Upcoming
        </span>
      );
    case "EXPIRED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle size={11} />
          Expired
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Draft
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          Inactive
        </span>
      );
  }
}

function formatDatetimeLocal(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDisplay(iso?: string | null) {
  if (!iso) return "Immediately (Open)";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function getDisplayExamLink(rawLink: string) {
  if (!rawLink) return "";
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    let slugOrId = rawLink;
    if (rawLink.includes("assessment=")) {
      slugOrId = rawLink.split("assessment=")[1];
    } else if (rawLink.includes("/")) {
      const parts = rawLink.split("/");
      slugOrId = parts[parts.length - 1];
    }
    return `http://localhost:3000/${slugOrId}`;
  }
  return rawLink;
}

export default function AdminAssessmentsPage() {
  const [sessions, setSessions] = useState<AssessmentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [vendorId, setVendorId] = useState<string | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: "success" | "error" | "warning" | "info", message: string, title?: string) => {
    setToasts((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), type, message, title }]);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<AssessmentSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AssessmentSession | null>(null);

  // Form
  const emptyForm = {
    name: "",
    description: "",
    questionBankId: "",
    durationMins: 45,
    passingPercentage: 50,
    maxProctorWarnings: 6,
    enableTabSwitch: true,
    enableFullscreen: true,
    enableCopyPaste: true,
    enableCamera: true,
    activeFrom: "",
    activeUntil: "",
    status: "ACTIVE",
    assignedVendorIds: [] as string[],
  };
  const [form, setForm] = useState({ ...emptyForm });
  const [questionBanks, setQuestionBanks] = useState<QuestionBankSummary[]>([]);
  const [availableVendors, setAvailableVendors] = useState<Array<{ id: string; name: string; vendorCode: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("banca_admin_token") || "";
      const userStr = localStorage.getItem("banca_admin_user");
      let activeRole = "ADMIN";
      let activeVendorId: string | null = null;

      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          activeRole = u.role || "ADMIN";
          activeVendorId = u.vendorId || u.id || u.vendorCode || u.email || null;
          setUserRole(activeRole);
          setVendorId(activeVendorId);
        } catch {}
      }

      const headers: any = { Authorization: `Bearer ${token}` };
      const params = new URLSearchParams();
      if (activeRole === "VENDOR" && activeVendorId) {
        params.append("vendorId", activeVendorId);
      }

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${getApiBaseUrl()}/api/v1/assessments${queryStr}`, { headers });
      const data = await res.json();
      if (data.success) setSessions(data.assessments || []);

      // Load available question banks
      try {
        const qbRes = await fetch(`${getApiBaseUrl()}/api/v1/questions/banks`, { headers });
        const qbData = await qbRes.json();
        if (qbData.success && Array.isArray(qbData.banks)) {
          setQuestionBanks(qbData.banks);
        }
      } catch (e) {
        console.error("Failed to load question banks:", e);
      }

      // Load available vendors
      try {
        const vRes = await fetch(`${getApiBaseUrl()}/api/v1/vendors`, { headers });
        const vData = await vRes.json();
        if (Array.isArray(vData)) {
          setAvailableVendors(vData);
        } else if (vData.success && Array.isArray(vData.vendors)) {
          setAvailableVendors(vData.vendors);
        }
      } catch (e) {
        console.error("Failed to load vendors:", e);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const copyLink = (session: AssessmentSession) => {
    const linkToCopy = getDisplayExamLink(session.uniqueCandidateLink);
    navigator.clipboard.writeText(linkToCopy).then(() => {
      setCopiedId(session.id);
      addToast("info", "Candidate exam link copied to clipboard.", "Link Copied");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    setFormError("");
    setShowCreateModal(true);
  };

  const openEdit = (session: AssessmentSession) => {
    setEditTarget(session);
    setForm({
      name: session.name,
      description: session.description || "",
      questionBankId: session.questionBankId || "",
      durationMins: session.durationMins || 45,
      passingPercentage: session.passingPercentage || 50,
      maxProctorWarnings: session.maxProctorWarnings || 6,
      enableTabSwitch: session.enableTabSwitch !== false,
      enableFullscreen: session.enableFullscreen !== false,
      enableCopyPaste: session.enableCopyPaste !== false,
      enableCamera: session.enableCamera !== false,
      activeFrom: formatDatetimeLocal(session.activeFrom),
      activeUntil: formatDatetimeLocal(session.activeUntil),
      status: session.status === "INACTIVE" || session.status === "DRAFT" ? session.status : "ACTIVE",
      assignedVendorIds: session.vendorAssignments?.map((v) => v.vendorId).filter(Boolean) as string[] || [],
    });
    setFormError("");
    setShowEditModal(true);
  };

  const handleSave = async (isEdit: boolean) => {
    if (!form.name.trim()) {
      setFormError("Session name is required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      let isoActiveFrom: string | null | undefined = undefined;
      if (form.activeFrom && form.activeFrom.trim() !== "") {
        const d = new Date(form.activeFrom);
        if (!isNaN(d.getTime())) {
          isoActiveFrom = d.toISOString();
        }
      } else if (isEdit) {
        isoActiveFrom = null;
      }

      let isoActiveUntil: string | null | undefined = undefined;
      if (form.activeUntil && form.activeUntil.trim() !== "") {
        const d = new Date(form.activeUntil);
        if (!isNaN(d.getTime())) {
          isoActiveUntil = d.toISOString();
        }
      } else if (isEdit) {
        isoActiveUntil = null;
      }

      const payload: any = {
        name: form.name.trim(),
        description: form.description || undefined,
        questionBankId: form.questionBankId || null,
        durationMins: Number(form.durationMins) || 45,
        passingPercentage: Number(form.passingPercentage) || 50,
        maxProctorWarnings: Number(form.maxProctorWarnings) || 6,
        enableTabSwitch: form.enableTabSwitch,
        enableFullscreen: form.enableFullscreen,
        enableCopyPaste: form.enableCopyPaste,
        enableCamera: form.enableCamera,
        activeFrom: isoActiveFrom,
        activeUntil: isoActiveUntil,
        status: form.status,
        assignedVendorIds: form.assignedVendorIds,
      };
      if (isEdit && editTarget) payload.id = editTarget.id;

      const res = await fetch(`${getApiBaseUrl()}/api/v1/assessments/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Save failed");

      setShowCreateModal(false);
      setShowEditModal(false);
      addToast(
        "success",
        isEdit ? "Assessment session updated successfully." : "New assessment session created successfully.",
        "Success"
      );
      await loadSessions();
    } catch (err: any) {
      setFormError(err.message || "Failed to save session.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteSession = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/assessments/${deleteTarget.id}`, { method: "DELETE" });
      addToast("success", `Assessment session '${deleteTarget.name}' deleted.`, "Session Deleted");
      setDeleteTarget(null);
      await loadSessions();
    } catch {
      addToast("error", "Failed to delete assessment session.", "Error");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (session: AssessmentSession) => {
    const computed = getComputedStatus(session);
    if (computed === "EXPIRED" && session.status !== "ACTIVE") {
      addToast(
        "warning",
        "This assessment session has expired. To activate it, click Edit and set a future 'Until' end date.",
        "Session Expired"
      );
      openEdit(session);
      return;
    }
    const newStatus = session.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/assessments/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.id, name: session.name, status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        addToast("error", data.message || "Failed to update status.", "Status Error");
      } else {
        addToast("success", `Session status updated to ${newStatus}.`, "Status Updated");
      }
      await loadSessions();
    } catch {
      addToast("error", "Connection error updating status.", "Network Error");
    }
  };

  // Filter and Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const filteredSessions = sessions.filter((s) => {
    const computed = getComputedStatus(s);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.vendorAssignments?.some(
        (va) => va.vendorName?.toLowerCase().includes(q) || va.vendorCode?.toLowerCase().includes(q)
      );

    const matchesStatus = statusFilter === "ALL" || computed === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const paginatedSessions = filteredSessions.slice((page - 1) * pageSize, page * pageSize);

  // High level metrics
  const activeSessionsCount = sessions.filter((s) => getComputedStatus(s) === "ACTIVE").length;
  const totalEnrolledCandidates = sessions.reduce((acc, s) => acc + (s.totalCandidates || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Exams & Assessment Sessions
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {userRole === "VENDOR"
                  ? "View and access assessment sessions assigned to your agency"
                  : "Configure unique candidate exam links with scheduled access windows"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadSessions}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition flex items-center gap-2 cursor-pointer"
            title="Refresh Sessions List"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
            <span>Refresh</span>
          </button>

          {userRole !== "VENDOR" && (
            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>New Assessment Session</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Top Metric Cards (Responsive Grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sessions</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{sessions.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Active Windows */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Windows</span>
            <div className="text-2xl font-black text-emerald-600 font-mono flex items-center gap-2">
              <span>{activeSessionsCount}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Enrolled Candidates */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{totalEnrolledCandidates}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Exam Engine Constant */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exam Engine</span>
            <div className="text-sm font-extrabold text-white">60 Qs • 45 Mins</div>
            <div className="text-[10px] text-blue-300 font-medium">Shared Question Bank</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assessment, slug, vendor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <Filter size={12} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses ({sessions.length})</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="EXPIRED">Expired</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Show:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[25, 50, 100].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setPageSize(size);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  pageSize === size ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Main Assessments Content (Responsive Table / Cards) ── */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-600">Loading assessment sessions...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen size={24} />
          </div>
          <h3 className="text-sm font-black text-slate-900">No Assessment Sessions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            {userRole === "VENDOR"
              ? "No assessments assigned to your vendor account yet. Please contact HR Administrator."
              : "No assessment sessions match your search or filter criteria."}
          </p>
          {userRole !== "VENDOR" && sessions.length === 0 && (
            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus size={15} /> Create First Session
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-[32%] min-w-[220px]">Session Details & Creator</th>
                  <th className="py-3.5 px-3 w-[10%] min-w-[90px] text-center">Status</th>
                  <th className="py-3.5 px-3 w-[16%] min-w-[130px]">Configuration</th>
                  <th className="py-3.5 px-3 w-[18%] min-w-[150px]">Schedule Window</th>
                  <th className="py-3.5 px-3 w-[16%] min-w-[140px]">Unique Candidate Link</th>
                  <th className="py-3.5 px-4 w-[8%] min-w-[100px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSessions.map((session) => {
                  const computedStatus = getComputedStatus(session);
                  const isCopied = copiedId === session.id;
                  const displayLink = getDisplayExamLink(session.uniqueCandidateLink);

                  // Determine Creator Origin
                  const isApiCreated = session.vendorAssignments?.[0]?.assignedBy?.startsWith("API:");
                  const vendorName = session.vendorAssignments?.[0]?.vendorName || session.assignedVendors?.[0]?.name;
                  const vendorCode = session.vendorAssignments?.[0]?.vendorCode || session.assignedVendors?.[0]?.vendorCode;

                  return (
                    <tr key={session.id} className="hover:bg-blue-50/20 transition-colors group">
                      {/* Col 1: Session Name & Creator */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/assessments/${session.id}`}
                          className="inline-flex items-center gap-1.5 font-extrabold text-slate-900 hover:text-blue-600 transition group-hover:underline"
                        >
                          <span className="text-xs sm:text-sm font-bold tracking-tight">{session.name}</span>
                          <ExternalLink size={12} className="text-blue-500 opacity-80 shrink-0" />
                        </Link>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {isApiCreated ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                              <Terminal size={10} /> API: {vendorName || vendorCode || "Vendor"}
                            </span>
                          ) : vendorName ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                              <Building2 size={10} /> Vendor: {vendorName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                              <ShieldCheck size={10} /> Super Admin
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-medium">
                            • Created {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {session.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-normal">
                            {session.description}
                          </p>
                        )}
                      </td>

                      {/* Col 2: Status */}
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={computedStatus} />
                      </td>

                      {/* Col 3: Configuration & Controls */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200">
                              <BookOpen size={10} /> {session.totalQuestions || session.questionBank?.questionCount || TOTAL_QUESTIONS} Qs
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200">
                              <Clock size={10} /> {session.durationMins || EXAM_DURATION_MINS} Mins
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200">
                              Pass {session.passingPercentage || 50}%
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-extrabold border border-rose-200">
                              {session.maxProctorWarnings || 6} Warns
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-extrabold border border-purple-200">
                              <Users size={10} /> {session.totalCandidates} Users
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1">
                            {session.enableCamera !== false && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] text-zinc-700 font-semibold" title="Camera Monitoring Enabled">
                                📷 Cam
                              </span>
                            )}
                            {session.enableTabSwitch !== false && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] text-zinc-700 font-semibold" title="Tab Switch Detection Enabled">
                                🔀 Tab
                              </span>
                            )}
                            {session.enableFullscreen !== false && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] text-zinc-700 font-semibold" title="Fullscreen Enforced">
                                ⛶ Fullscreen
                              </span>
                            )}
                            {session.questionBankName ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/[0.04] text-black text-[10px] font-bold border border-black/10">
                                <Layers size={10} /> {session.questionBankName}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Default Bank
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Col 4: Schedule Window */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium text-[11px]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-slate-400 text-[10px] font-bold">From:</span>
                            <span className="font-semibold text-slate-700">{formatDisplay(session.activeFrom)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-slate-400 text-[10px] font-bold">Until:</span>
                            <span className="font-semibold text-slate-700">{formatDisplay(session.activeUntil)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Col 5: Unique Candidate Link */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 max-w-[200px]">
                          <input
                            readOnly
                            value={displayLink}
                            title={displayLink}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600 truncate focus:outline-none select-all"
                          />
                          <button
                            onClick={() => copyLink(session)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                              isCopied
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100"
                            }`}
                            title="Copy Candidate Link"
                          >
                            {isCopied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>

                      {/* Col 6: Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/assessments/${session.id}`}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                            title="Open Assessment Dashboard"
                          >
                            <ExternalLink size={13} />
                          </Link>

                          {userRole !== "VENDOR" && (
                            <>
                              <button
                                onClick={() => openEdit(session)}
                                className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                                title="Edit Session"
                              >
                                <Edit2 size={13} />
                              </button>

                              {computedStatus !== "EXPIRED" && (
                                <button
                                  onClick={() => handleToggleStatus(session)}
                                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                    session.status === "ACTIVE"
                                      ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  }`}
                                  title={session.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                >
                                  {session.status === "ACTIVE" ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              )}

                              <button
                                onClick={() => setDeleteTarget(session)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                                title="Delete Session"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredSessions.length > 0 && (
            <div className="p-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/70">
              <span className="text-xs text-slate-500 font-semibold">
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredSessions.length)} of{" "}
                {filteredSessions.length} sessions
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-3 py-1 text-xs font-bold text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. Create / Edit Assessment Modal ── */}
      {(showCreateModal || showEditModal) && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
              setShowEditModal(false);
            }
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <h2 className="text-base font-black text-black">
                  {showCreateModal ? "Create Assessment Session" : "Edit Assessment Session"}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Full manual configuration for questions, timing, proctoring security, and access rules.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-black/[0.04] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            {/* ── SECTION 1: General Info & Question Bank ── */}
            <div className="space-y-3 bg-black/[0.02] p-4 rounded-2xl border border-black/[0.05]">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={13} /> 1. Session Info & Question Bank
              </h3>

              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1">Session Title / Role *</label>
                <input
                  type="text"
                  placeholder="e.g. Agency Unit Manager & ARM Banca Assessment"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-bold text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Brief note for candidates or internal record"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-medium text-black focus:outline-none focus:border-black"
                />
              </div>

              {/* Question Bank Selector */}
              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                  Select Question Bank *
                </label>
                <select
                  value={form.questionBankId}
                  onChange={(e) => setForm({ ...form, questionBankId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-bold text-black focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="">Default Shared Bank (60 Questions · 45 Mins)</option>
                  {questionBanks.map((qb) => (
                    <option key={qb.id} value={qb.id}>
                      {qb.name} ({qb.questionCount} Questions{qb.category ? ` · ${qb.category}` : ""})
                    </option>
                  ))}
                </select>
                {(() => {
                  const selected = questionBanks.find((b) => b.id === form.questionBankId);
                  if (selected) {
                    return (
                      <div className="mt-1.5 p-2 rounded-xl bg-black/[0.04] text-black text-[11px] font-semibold flex items-center gap-2 border border-black/10">
                        <Layers size={13} className="shrink-0" />
                        <span>
                          Linked: <strong>{selected.name}</strong> · {selected.questionCount} Questions ({selected.totalMarks} Total Marks)
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="mt-1.5 p-2 rounded-xl bg-white text-zinc-600 text-[11px] font-semibold flex items-center gap-2 border border-black/[0.05]">
                      <Zap size={13} className="text-zinc-400 shrink-0" />
                      <span>Using default shared question pool (Standard 60 questions)</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── SECTION 2: Timing, Schedule & Passing Score ── */}
            <div className="space-y-3 bg-black/[0.02] p-4 rounded-2xl border border-black/[0.05]">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={13} /> 2. Exam Duration, Passing Score & Schedule
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Duration */}
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Exam Duration (Minutes) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={360}
                      value={form.durationMins}
                      onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) || 45 })}
                      className="w-24 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-black text-black focus:outline-none focus:border-black"
                    />
                    <div className="flex flex-wrap items-center gap-1">
                      {[30, 45, 60, 90].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setForm({ ...form, durationMins: mins })}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                            form.durationMins === mins
                              ? "bg-black text-white border-black"
                              : "bg-white text-zinc-600 border-black/[0.08] hover:bg-black/[0.04]"
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Passing % */}
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Passing Mark (%) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={form.passingPercentage}
                      onChange={(e) => setForm({ ...form, passingPercentage: Number(e.target.value) || 50 })}
                      className="w-24 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-black text-black focus:outline-none focus:border-black"
                    />
                    <div className="flex flex-wrap items-center gap-1">
                      {[40, 50, 60, 75].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setForm({ ...form, passingPercentage: pct })}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                            form.passingPercentage === pct
                              ? "bg-black text-white border-black"
                              : "bg-white text-zinc-600 border-black/[0.08] hover:bg-black/[0.04]"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    <Calendar size={12} className="inline mr-1 text-zinc-400" />
                    Active From (Start Window)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.activeFrom}
                    onChange={(e) => setForm({ ...form, activeFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs text-black focus:outline-none focus:border-black"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Leave blank to start immediately</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    <Calendar size={12} className="inline mr-1 text-zinc-400" />
                    Active Until (Expiration)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.activeUntil}
                    onChange={(e) => setForm({ ...form, activeUntil: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs text-black focus:outline-none focus:border-black"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Leave blank for no expiration</span>
                </div>
              </div>
            </div>

            {/* ── SECTION 3: Proctoring & Anti-Cheat Controls (Toggles) ── */}
            <div className="space-y-3 bg-black/[0.02] p-4 rounded-2xl border border-black/[0.05]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={13} /> 3. Proctoring & Anti-Cheat Controls
                </h3>
                <span className="text-[10px] font-bold text-zinc-500">Full Manual ON / OFF</span>
              </div>

              {/* Toggle 1: Camera */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/[0.06]">
                <div>
                  <div className="text-xs font-extrabold text-black">📷 Live Camera & Face Monitoring</div>
                  <div className="text-[11px] text-zinc-500">Requires candidate webcam and captures periodic proctoring snapshots</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, enableCamera: !form.enableCamera })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    form.enableCamera ? "bg-black" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-1 left-1 ${
                      form.enableCamera ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Tab Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/[0.06]">
                <div>
                  <div className="text-xs font-extrabold text-black">🔀 Tab Switch & Window Blur Detection</div>
                  <div className="text-[11px] text-zinc-500">Triggers warnings if candidate switches tabs or clicks outside the exam</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, enableTabSwitch: !form.enableTabSwitch })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    form.enableTabSwitch ? "bg-black" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-1 left-1 ${
                      form.enableTabSwitch ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Fullscreen */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/[0.06]">
                <div>
                  <div className="text-xs font-extrabold text-black">⛶ Fullscreen Enforcement</div>
                  <div className="text-[11px] text-zinc-500">Enforces full screen mode; exiting full screen counts towards warnings</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, enableFullscreen: !form.enableFullscreen })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    form.enableFullscreen ? "bg-black" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-1 left-1 ${
                      form.enableFullscreen ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 4: Copy Paste */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/[0.06]">
                <div>
                  <div className="text-xs font-extrabold text-black">📋 Copy-Paste & Right-Click Block</div>
                  <div className="text-[11px] text-zinc-500">Prevents copying question prompts, right-click inspection, and pasting text</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, enableCopyPaste: !form.enableCopyPaste })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    form.enableCopyPaste ? "bg-black" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-1 left-1 ${
                      form.enableCopyPaste ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Warning Threshold */}
              <div className="p-3 rounded-xl bg-white border border-black/[0.06] space-y-1.5">
                <label className="block text-xs font-extrabold text-black">
                  ⚠️ Max Proctoring Warnings Before Auto-Lock
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { count: 1, label: "1 (Strict Lock)" },
                    { count: 2, label: "2 Warns" },
                    { count: 3, label: "3 Warns (Recommended)" },
                    { count: 5, label: "5 Warns" },
                    { count: 6, label: "6 Warns (Standard)" },
                    { count: 10, label: "10 Warns (Lenient)" },
                  ].map((w) => (
                    <button
                      key={w.count}
                      type="button"
                      onClick={() => setForm({ ...form, maxProctorWarnings: w.count })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        form.maxProctorWarnings === w.count
                          ? "bg-black text-white border-black shadow-xs"
                          : "bg-black/[0.02] text-zinc-700 border-black/[0.06] hover:bg-black/[0.05]"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SECTION 4: Status & Vendor Access ── */}
            <div className="space-y-3 bg-black/[0.02] p-4 rounded-2xl border border-black/[0.05]">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={13} /> 4. Status & Agency Access
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">Session Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-bold text-black focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Open for testing)</option>
                    <option value="INACTIVE">INACTIVE (Temporarily closed)</option>
                    <option value="DRAFT">DRAFT (Under preparation)</option>
                  </select>
                </div>

                {availableVendors.length > 0 && (
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                      Assign to Vendor Agencies
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-black/[0.08]">
                      {availableVendors.map((v) => {
                        const isAssigned = form.assignedVendorIds.includes(v.id);
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              if (isAssigned) {
                                setForm({
                                  ...form,
                                  assignedVendorIds: form.assignedVendorIds.filter((id) => id !== v.id),
                                });
                              } else {
                                setForm({
                                  ...form,
                                  assignedVendorIds: [...form.assignedVendorIds, v.id],
                                });
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                              isAssigned
                                ? "bg-black text-white border-black"
                                : "bg-black/[0.02] text-zinc-600 border-black/[0.08] hover:bg-black/[0.05]"
                            }`}
                          >
                            {v.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-bold text-zinc-600 hover:bg-black/[0.04] cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(showEditModal)}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-black/85 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>{saving ? "Saving..." : showEditModal ? "Update Assessment Session" : "Create Assessment Session"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Confirm Delete Modal ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Assessment Session"
        message={`Are you sure you want to delete '${deleteTarget?.name}'? Candidates already registered under this session may lose access.`}
        confirmText="Delete Session"
        cancelText="Cancel"
        isDanger={true}
        loading={deleting}
        onConfirm={confirmDeleteSession}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
