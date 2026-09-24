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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black text-white shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          Active
        </span>
      );
    case "UPCOMING":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/[0.04] text-black border border-black/[0.08]">
          <Clock size={11} />
          Upcoming
        </span>
      );
    case "EXPIRED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/[0.03] text-zinc-400 border border-black/[0.06]">
          <AlertCircle size={11} />
          Expired
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/[0.03] text-zinc-600 border border-black/[0.06]">
          Draft
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/[0.03] text-zinc-400 border border-black/[0.06]">
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

function getDisplayExamLink(rawLink: string, slug?: string) {
  let slugVal = slug;
  if (!slugVal && rawLink) {
    if (rawLink.includes("assessment=")) {
      slugVal = rawLink.split("assessment=")[1];
    } else {
      const parts = rawLink.split("/").filter(Boolean);
      slugVal = parts[parts.length - 1];
    }
  }
  slugVal = slugVal || "";

  return `https://assessment.greatcampus.tech/${slugVal}`;
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
    const linkToCopy = getDisplayExamLink(session.uniqueCandidateLink, session.slug);
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

      {/* ── 1. Apple Liquid Glass Toolbar (No Duplicate In-Page Header) ── */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search assessment, slug, vendor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 bg-black/[0.03] rounded-2xl border border-black/[0.06] text-xs font-semibold text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-black/[0.03] border border-black/[0.06] rounded-2xl px-3 py-1.5">
            <Filter size={12} className="text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none text-xs font-bold text-black outline-none cursor-pointer"
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

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Page Size Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-black/[0.03] border border-black/[0.06] p-1 rounded-2xl">
            {[25, 50, 100].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setPageSize(size);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  pageSize === size ? "bg-black text-white shadow-xs" : "text-zinc-600 hover:text-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadSessions}
            className="p-2.5 rounded-2xl bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] text-black text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Refresh Sessions List"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-black" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* New Assessment Session Button */}
          {userRole !== "VENDOR" && (
            <button
              onClick={openCreate}
              className="px-4 py-2.5 rounded-2xl bg-black hover:bg-black/85 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Plus size={15} />
              <span>New Assessment Session</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Top Metric Cards (Apple Monochrome) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Sessions */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Total Sessions</span>
            <div className="text-3xl font-black text-black tracking-tight">{sessions.length}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">Configured Exams</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-black/[0.04] border border-black/[0.06] text-black flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Active Windows */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Active Windows</span>
            <div className="text-3xl font-black text-black tracking-tight">{activeSessionsCount}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">Live Exam Access</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-black/[0.04] border border-black/[0.06] text-black flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Enrolled Candidates */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Total Enrolled</span>
            <div className="text-3xl font-black text-black tracking-tight">{totalEnrolledCandidates}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">Candidates Across Tests</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-black/[0.04] border border-black/[0.06] text-black flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Exam Engine Constant */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Exam Engine</span>
            <div className="text-sm font-black text-black tracking-tight">60 Qs • 45 Mins</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">Shared Question Bank</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-black/[0.04] border border-black/[0.06] text-black flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Main Assessments Content (Apple Liquid Glass Table) ── */}
      {loading ? (
        <div className="py-24 text-center bg-white/80 backdrop-blur-2xl rounded-3xl border border-black/[0.05]">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-zinc-500 tracking-tight">Loading assessment sessions...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-20 text-center bg-white/80 backdrop-blur-2xl rounded-3xl border border-black/[0.05] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] text-black flex items-center justify-center mx-auto">
            <BookOpen size={24} />
          </div>
          <h3 className="text-sm font-black text-black tracking-tight">No Assessment Sessions Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium tracking-tight">
            {userRole === "VENDOR"
              ? "No assessments assigned to your vendor account yet. Please contact HR Administrator."
              : "No assessment sessions match your search or filter criteria."}
          </p>
          {userRole !== "VENDOR" && sessions.length === 0 && (
            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-2xl bg-black text-white text-xs font-bold inline-flex items-center gap-2 hover:bg-black/85 transition"
            >
              <Plus size={15} /> Create First Session
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-black/[0.02] border-b border-black/[0.06] text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-5 w-[30%] min-w-[220px]">Session Details & Creator</th>
                  <th className="py-4 px-3 w-[12%] min-w-[100px] text-center">Status</th>
                  <th className="py-4 px-3 w-[18%] min-w-[150px]">Configuration</th>
                  <th className="py-4 px-3 w-[18%] min-w-[150px]">Schedule Window</th>
                  <th className="py-4 px-3 w-[14%] min-w-[140px]">Unique Candidate Link</th>
                  <th className="py-4 px-5 w-[8%] min-w-[110px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {paginatedSessions.map((session) => {
                  const computedStatus = getComputedStatus(session);
                  const isCopied = copiedId === session.id;
                  const displayLink = getDisplayExamLink(session.uniqueCandidateLink, session.slug);

                  // Determine Creator Origin
                  const isApiCreated = session.vendorAssignments?.[0]?.assignedBy?.startsWith("API:");
                  const vendorName = session.vendorAssignments?.[0]?.vendorName || session.assignedVendors?.[0]?.name;
                  const vendorCode = session.vendorAssignments?.[0]?.vendorCode || session.assignedVendors?.[0]?.vendorCode;

                  return (
                    <tr key={session.id} className="hover:bg-black/[0.015] transition-colors group">
                      {/* Col 1: Session Name & Creator */}
                      <td className="py-4 px-5">
                        <Link
                          href={`/admin/assessments/${session.id}`}
                          className="inline-flex items-center gap-1.5 font-black text-black hover:opacity-75 transition group-hover:underline"
                        >
                          <span className="text-sm font-black tracking-tight">{session.name}</span>
                          <ExternalLink size={12} className="text-black/50 opacity-80 shrink-0" />
                        </Link>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {isApiCreated ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/[0.04] text-black border border-black/[0.06]">
                              <Terminal size={10} /> API: {vendorName || vendorCode || "Vendor"}
                            </span>
                          ) : vendorName ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/[0.04] text-black border border-black/[0.06]">
                              <Building2 size={10} /> Vendor: {vendorName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/[0.04] text-black border border-black/[0.06]">
                              <ShieldCheck size={10} /> Super Admin
                            </span>
                          )}

                          <span className="text-[10px] text-zinc-400 font-medium">
                            • Created {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {session.description && (
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1 font-normal tracking-tight">
                            {session.description}
                          </p>
                        )}
                      </td>

                      {/* Col 2: Status */}
                      <td className="py-4 px-3 text-center">
                        <StatusBadge status={computedStatus} />
                      </td>

                      {/* Col 3: Configuration & Controls (Monochrome) */}
                      <td className="py-4 px-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/[0.03] text-black text-[10px] font-bold border border-black/[0.06]">
                              <BookOpen size={10} /> {session.totalQuestions || session.questionBank?.questionCount || TOTAL_QUESTIONS} Qs
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/[0.03] text-black text-[10px] font-bold border border-black/[0.06]">
                              <Clock size={10} /> {session.durationMins || EXAM_DURATION_MINS} Mins
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/[0.03] text-black text-[10px] font-bold border border-black/[0.06]">
                              Pass {session.passingPercentage || 50}%
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/[0.03] text-black text-[10px] font-bold border border-black/[0.06]">
                              {session.maxProctorWarnings || 6} Warns
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/[0.03] text-black text-[10px] font-bold border border-black/[0.06]">
                              <Users size={10} /> {session.totalCandidates} Users
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1">
                            {session.enableCamera !== false && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/[0.04] text-zinc-700 font-semibold" title="Camera Monitoring Enabled">
                                📷 Cam
                              </span>
                            )}
                            {session.enableTabSwitch !== false && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/[0.04] text-zinc-700 font-semibold" title="Tab Switch Detection Enabled">
                                🔀 Tab
                              </span>
                            )}
                            {session.enableFullscreen !== false && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/[0.04] text-zinc-700 font-semibold" title="Fullscreen Enforced">
                                ⛶ Fullscreen
                              </span>
                            )}
                            {session.questionBankName ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/[0.04] text-black text-[10px] font-bold border border-black/10">
                                <Layers size={10} /> {session.questionBankName}
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-400 font-medium">
                                Default Bank
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Col 4: Schedule Window */}
                      <td className="py-4 px-3 text-zinc-600 font-medium text-[11px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-zinc-400 text-[10px] font-bold">From:</span>
                            <span className="font-semibold text-black tracking-tight">{formatDisplay(session.activeFrom)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-zinc-400 text-[10px] font-bold">Until:</span>
                            <span className="font-semibold text-black tracking-tight">{formatDisplay(session.activeUntil)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Col 5: Unique Candidate Link */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 max-w-[200px]">
                          <input
                            readOnly
                            value={displayLink}
                            title={displayLink}
                            className="w-full px-2.5 py-1.5 bg-black/[0.03] border border-black/[0.06] rounded-xl text-[10px] font-mono text-zinc-700 truncate focus:outline-none select-all"
                          />
                          <button
                            onClick={() => copyLink(session)}
                            className="p-1.5 rounded-xl border border-black/[0.06] bg-white hover:bg-black/[0.04] text-black text-xs font-bold transition flex items-center shrink-0 cursor-pointer"
                            title="Copy Candidate Link"
                          >
                            {isCopied ? <CheckCircle2 size={13} className="text-black" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>

                      {/* Col 6: Actions (Monochrome) */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/assessments/${session.id}`}
                            className="p-2 rounded-xl text-zinc-600 hover:text-black hover:bg-black/[0.05] border border-black/[0.06] bg-white transition cursor-pointer"
                            title="Open Assessment Dashboard"
                          >
                            <ExternalLink size={13} />
                          </Link>

                          {userRole !== "VENDOR" && (
                            <>
                              <button
                                onClick={() => openEdit(session)}
                                className="p-2 rounded-xl text-zinc-600 hover:text-black hover:bg-black/[0.05] border border-black/[0.06] bg-white transition cursor-pointer"
                                title="Edit Session"
                              >
                                <Edit2 size={13} />
                              </button>

                              {computedStatus !== "EXPIRED" && (
                                <button
                                  onClick={() => handleToggleStatus(session)}
                                  className="p-2 rounded-xl text-zinc-600 hover:text-black hover:bg-black/[0.05] border border-black/[0.06] bg-white transition cursor-pointer"
                                  title={session.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                >
                                  {session.status === "ACTIVE" ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              )}

                              <button
                                onClick={() => setDeleteTarget(session)}
                                className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-black/[0.06] bg-white transition cursor-pointer"
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
            <div className="p-4 border-t border-black/[0.06] flex items-center justify-between bg-black/[0.01]">
              <span className="text-xs text-zinc-500 font-semibold tracking-tight">
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredSessions.length)} of{" "}
                {filteredSessions.length} sessions
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-black/[0.06] bg-white hover:bg-black/[0.04] text-black disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-3 py-1 text-xs font-bold text-black tracking-tight">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-xl border border-black/[0.06] bg-white hover:bg-black/[0.04] text-black disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
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
