"use client";

import { useState, useEffect, useCallback, useId } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Layers,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Hash,
  Award,
  Sparkles,
  ArrowLeft,
  Filter,
} from "lucide-react";
import * as XLSX from "xlsx";
import ConfirmModal from "@/components/ConfirmModal";
import ToastContainer, { ToastMessage } from "@/components/Toast";
import { getApiBaseUrl } from "@/lib/config";

interface Question {
  id: string;
  questionBankId?: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  marks: number;
  sectionName?: string;
  status: string;
  createdAt: string;
}

interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status: string;
  questionCount: number;
  totalMarks: number;
  assessmentsCount?: number;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

const emptyQuestionForm = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  marks: 1,
  sectionName: "General",
};

const emptyBankForm = {
  name: "",
  category: "General",
  description: "",
};

export default function AdminQuestionsPage() {
  const bulkFileInputId = useId();
  // Question Banks State
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Search & Filters
  const [bankSearch, setBankSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const QUESTIONS_PER_PAGE = 10;

  // Bank Modals
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<QuestionBank | null>(null);
  const [bankFormData, setBankFormData] = useState({ ...emptyBankForm });
  const [savingBank, setSavingBank] = useState(false);
  const [bankFormError, setBankFormError] = useState("");

  // Question Modals
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionFormData, setQuestionFormData] = useState({ ...emptyQuestionForm });
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [questionFormError, setQuestionFormError] = useState("");

  // Bulk Upload Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRows, setBulkRows] = useState<any[]>([]);
  const [bulkErrors, setBulkErrors] = useState<Array<{ row: number; error: string }>>([]);
  const [bulkFileName, setBulkFileName] = useState("");
  const [uploadingBulk, setUploadingBulk] = useState(false);

  // Delete Confirmations
  const [deleteBankTarget, setDeleteBankTarget] = useState<QuestionBank | null>(null);
  const [deletingBank, setDeletingBank] = useState(false);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: "success" | "error" | "warning" | "info", message: string, title?: string) => {
    setToasts((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), type, message, title }]);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("banca_admin_token") || "" : "";
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch all question banks
  const fetchBanks = useCallback(async () => {
    setLoadingBanks(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/questions/banks`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.banks)) {
        setBanks(data.banks);
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to fetch question banks.", "Network Error");
    } finally {
      setLoadingBanks(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  // Fetch details of selected bank
  const fetchSelectedBank = useCallback(async (bankId: string) => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/questions/banks/${bankId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && data.bank) {
        setSelectedBank(data.bank);
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to fetch questions for this bank.", "Error");
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  const handleSelectBank = (bankId: string) => {
    setSelectedBankId(bankId);
    setQuestionSearch("");
    setSectionFilter("ALL");
    setCurrentPage(1);
    fetchSelectedBank(bankId);
  };

  const handleBackToBanks = () => {
    setSelectedBankId(null);
    setSelectedBank(null);
    fetchBanks();
  };

  // Bank Create / Edit
  const openCreateBank = () => {
    setEditingBank(null);
    setBankFormData({ ...emptyBankForm });
    setBankFormError("");
    setShowBankModal(true);
  };

  const openEditBank = (bank: QuestionBank, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBank(bank);
    setBankFormData({
      name: bank.name,
      category: bank.category || "General",
      description: bank.description || "",
    });
    setBankFormError("");
    setShowBankModal(true);
  };

  const handleSaveBank = async () => {
    if (!bankFormData.name.trim()) {
      setBankFormError("Question Bank name is required.");
      return;
    }
    setSavingBank(true);
    setBankFormError("");
    try {
      const url = editingBank
        ? `${getApiBaseUrl()}/api/v1/questions/banks/${editingBank.id}`
        : `${getApiBaseUrl()}/api/v1/questions/banks`;
      const method = editingBank ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(bankFormData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to save bank.");

      addToast("success", `Question Bank "${bankFormData.name}" saved successfully.`, "Saved");
      setShowBankModal(false);
      fetchBanks();
      if (selectedBankId && editingBank && selectedBankId === editingBank.id) {
        fetchSelectedBank(selectedBankId);
      }
    } catch (err: any) {
      setBankFormError(err.message || "Failed to save bank.");
    } finally {
      setSavingBank(false);
    }
  };

  const confirmDeleteBank = async () => {
    if (!deleteBankTarget) return;
    setDeletingBank(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/questions/banks/${deleteBankTarget.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to delete.");

      addToast("success", `Question Bank "${deleteBankTarget.name}" deleted.`, "Deleted");
      setDeleteBankTarget(null);
      if (selectedBankId === deleteBankTarget.id) {
        handleBackToBanks();
      } else {
        fetchBanks();
      }
    } catch (err: any) {
      addToast("error", err.message || "Failed to delete question bank.", "Error");
    } finally {
      setDeletingBank(false);
    }
  };

  // Single Question Create / Edit
  const openCreateQuestion = () => {
    setEditingQuestion(null);
    setQuestionFormData({ ...emptyQuestionForm });
    setQuestionFormError("");
    setShowQuestionModal(true);
  };

  const openEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQuestionFormData({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      sectionName: q.sectionName || "General",
    });
    setQuestionFormError("");
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async () => {
    const { question, optionA, optionB, optionC, optionD } = questionFormData;
    if (!question.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setQuestionFormError("All fields (Question, Options A-D) are required.");
      return;
    }
    if (!selectedBankId && !editingQuestion) {
      setQuestionFormError("No Question Bank selected.");
      return;
    }

    setSavingQuestion(true);
    setQuestionFormError("");
    try {
      if (editingQuestion) {
        const res = await fetch(`${getApiBaseUrl()}/api/v1/questions/${editingQuestion.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...questionFormData,
            questionBankId: selectedBankId || editingQuestion.questionBankId,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to update question.");
        addToast("success", "Question updated successfully.", "Saved");
      } else if (selectedBankId) {
        const res = await fetch(`${getApiBaseUrl()}/api/v1/questions/banks/${selectedBankId}/questions`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(questionFormData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to add question.");
        addToast("success", "Question added to bank.", "Added");
      }

      setShowQuestionModal(false);
      if (selectedBankId) fetchSelectedBank(selectedBankId);
    } catch (err: any) {
      setQuestionFormError(err.message || "Failed to save question.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const confirmDeleteQuestion = async () => {
    if (!deleteQuestionTarget) return;
    setDeletingQuestion(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/questions/${deleteQuestionTarget.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to delete.");

      addToast("success", "Question removed from bank.", "Deleted");
      setDeleteQuestionTarget(null);
      if (selectedBankId) fetchSelectedBank(selectedBankId);
    } catch (err: any) {
      addToast("error", err.message || "Failed to delete question.", "Error");
    } finally {
      setDeletingQuestion(false);
    }
  };

  // Bulk File Handling (Client-side SheetJS XLSX & CSV Parsing)
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    setBulkErrors([]);
    setBulkRows([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonRows.length === 0) {
          setBulkErrors([{ row: 0, error: "The selected file is empty." }]);
          return;
        }

        const valid: any[] = [];
        const errors: Array<{ row: number; error: string }> = [];

        jsonRows.forEach((row, idx) => {
          const rowNum = idx + 2; // header is row 1
          const qText = row.question || row.Question || row["Question Text"] || row["question_text"];
          const optA = row.optionA || row.OptionA || row["Option A"] || row["A"];
          const optB = row.optionB || row.OptionB || row["Option B"] || row["B"];
          const optC = row.optionC || row.OptionC || row["Option C"] || row["C"];
          const optD = row.optionD || row.OptionD || row["Option D"] || row["D"];
          const correct = String(row.correctAnswer || row.CorrectAnswer || row["Correct Answer"] || row.answer || row.Answer || "A")
            .trim()
            .toUpperCase();
          const marks = row.marks !== undefined ? Number(row.marks) : (row.Marks !== undefined ? Number(row.Marks) : 1);
          const section = row.sectionName || row.SectionName || row["Section Name"] || row.section || "General";

          if (!qText || String(qText).trim() === "") {
            errors.push({ row: rowNum, error: "Question text is missing." });
            return;
          }
          if (!optA || !optB || !optC || !optD) {
            errors.push({ row: rowNum, error: "Options A, B, C, and D must all be present." });
            return;
          }
          if (!["A", "B", "C", "D"].includes(correct)) {
            errors.push({ row: rowNum, error: `Invalid correct answer "${correct}". Must be A, B, C, or D.` });
            return;
          }

          valid.push({
            question: String(qText).trim(),
            optionA: String(optA).trim(),
            optionB: String(optB).trim(),
            optionC: String(optC).trim(),
            optionD: String(optD).trim(),
            correctAnswer: correct,
            marks: isNaN(marks) || marks <= 0 ? 1 : marks,
            sectionName: String(section).trim() || "General",
          });
        });

        setBulkRows(valid);
        setBulkErrors(errors);
      } catch (err: any) {
        setBulkErrors([{ row: 0, error: `Failed to parse file: ${err.message}` }]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUploadBulk = async () => {
    if (!selectedBankId || bulkRows.length === 0) return;
    setUploadingBulk(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/questions/banks/${selectedBankId}/import`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ questions: bulkRows }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Bulk import failed.");

      addToast("success", `Successfully imported ${data.importedCount} questions!`, "Import Successful");
      setShowBulkModal(false);
      setBulkRows([]);
      setBulkFileName("");
      fetchSelectedBank(selectedBankId);
    } catch (err: any) {
      addToast("error", err.message || "Failed to upload questions.", "Import Failed");
    } finally {
      setUploadingBulk(false);
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent =
      `question,optionA,optionB,optionC,optionD,correctAnswer,marks,sectionName\n` +
      `"A customer asks: Will this policy definitely pay for my father's treatment? What is best response?","It should be covered if active","Most treatments are covered","Yes, provided premium is paid","Let's check the applicable terms before I answer",D,1,"Customer Handling"\n` +
      `"If BANK is coded as CBOL, then LOAN becomes:","MPBO","MPAO","LPBO","MQBO",A,1,"Reasoning"\n` +
      `"Why is accurate disclosure of health info important when applying for insurance?","Guarantees immediate approval","Eliminates underwriting","Ensures premium never changes","Helps insurer assess proposal appropriately",D,1,"Regulations"\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "greatcampus_question_bank_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("info", "Downloaded template CSV file.", "Download Ready");
  };

  // Filtered Banks
  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    (b.category && b.category.toLowerCase().includes(bankSearch.toLowerCase())) ||
    (b.description && b.description.toLowerCase().includes(bankSearch.toLowerCase()))
  );

  // Filtered Questions in selected bank
  const questionsList = selectedBank?.questions || [];
  const uniqueSections = Array.from(new Set(questionsList.map((q) => q.sectionName || "General"))).filter(Boolean);

  const filteredQuestions = questionsList.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.optionA.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.optionB.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.optionC.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.optionD.toLowerCase().includes(questionSearch.toLowerCase());
    const matchesSection = sectionFilter === "ALL" || (q.sectionName || "General") === sectionFilter;
    return matchesSearch && matchesSection;
  });

  const totalQuestionPages = Math.max(1, Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE));
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F5F5F7] p-4 sm:p-6 lg:p-8 space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: QUESTION BANKS DIRECTORY OVERVIEW                    */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {!selectedBankId && (
        <div className="space-y-6">
          {/* Top Liquid Glass Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-2xl p-3.5 rounded-2xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)]">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search question banks by title or category..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-black/[0.03] border border-black/[0.06] rounded-xl text-xs font-semibold text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
              />
              {bankSearch && (
                <button
                  onClick={() => setBankSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchBanks}
                disabled={loadingBanks}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-black/[0.03] border border-black/[0.08] text-black text-xs font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={loadingBanks ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
              <button
                onClick={openCreateBank}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-black/85 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer hover:-translate-y-0.5"
              >
                <Plus size={14} />
                <span>+ New Question Bank</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-2xl p-4 rounded-2xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)]">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Question Banks</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-black tracking-tight">{banks.length}</span>
                <span className="text-xs text-zinc-500 font-medium">Distinct Pools</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-2xl p-4 rounded-2xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)]">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Total Questions Pool</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-black tracking-tight">
                  {banks.reduce((acc, b) => acc + (b.questionCount || 0), 0)}
                </span>
                <span className="text-xs text-zinc-500 font-medium">Across all banks</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-2xl p-4 rounded-2xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)]">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Total Marks Capacity</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-black tracking-tight">
                  {banks.reduce((acc, b) => acc + (b.totalMarks || 0), 0)}
                </span>
                <span className="text-xs text-zinc-500 font-medium">Points</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-2xl p-4 rounded-2xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)]">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Exam Engine</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-black text-black tracking-tight">Instant Assessment Sync</span>
              </div>
            </div>
          </div>

          {/* Banks Grid */}
          {loadingBanks ? (
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-black/[0.05] p-12 text-center">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-zinc-500">Loading Question Banks...</p>
            </div>
          ) : filteredBanks.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-black/[0.05] p-12 text-center space-y-3">
              <BookOpen size={36} className="mx-auto text-zinc-300" />
              <h3 className="text-sm font-bold text-black">No Question Banks Found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {bankSearch ? "No banks match your search term." : "Create your first Question Bank to store questions and link them to assessments."}
              </p>
              {!bankSearch && (
                <button
                  onClick={openCreateBank}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Plus size={14} /> Create Question Bank
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredBanks.map((bank) => (
                <div
                  key={bank.id}
                  onClick={() => handleSelectBank(bank.id)}
                  className="bg-white/80 backdrop-blur-2xl border border-black/[0.06] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Top Row: Category Pill & Menu */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/[0.04] text-black border border-black/10">
                        <Layers size={10} /> {bank.category || "General"}
                      </span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => openEditBank(bank, e)}
                          title="Edit Bank Info"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-black/[0.04] transition cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteBankTarget(bank);
                          }}
                          title="Delete Bank"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Bank Title & Description */}
                    <h3 className="text-base font-black text-black tracking-tight group-hover:underline">
                      {bank.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {bank.description || "No description provided for this question bank."}
                    </p>
                  </div>

                  {/* Bottom Stats & Launch */}
                  <div className="mt-5 pt-3.5 border-t border-black/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black text-white text-[11px] font-bold">
                        <BookOpen size={10} /> {bank.questionCount || 0} Questions
                      </span>
                      <span className="text-[11px] text-zinc-400 font-semibold">
                        {bank.totalMarks || 0} Marks
                      </span>
                    </div>

                    <span className="text-xs font-bold text-black flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      Manage →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: INSIDE SPECIFIC QUESTION BANK                        */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {selectedBankId && (
        <div className="space-y-6">
          {/* Navigation Bar / Breadcrumb */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleBackToBanks}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-xl border border-black/[0.08] hover:bg-black/[0.04] text-black text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={13} /> All Question Banks
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSampleCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-black/[0.04] border border-black/[0.08] text-black text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
                title="Download CSV Template for Bulk Upload"
              >
                <Download size={13} />
                <span>Sample CSV Template</span>
              </button>
              <button
                onClick={() => {
                  setBulkFileName("");
                  setBulkRows([]);
                  setBulkErrors([]);
                  setShowBulkModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-black/[0.04] border border-black/[0.08] text-black text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
              >
                <Upload size={13} />
                <span>Import Excel / CSV</span>
              </button>
              <button
                onClick={openCreateQuestion}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-black/85 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer hover:-translate-y-0.5"
              >
                <Plus size={14} />
                <span>+ Add Single Question</span>
              </button>
            </div>
          </div>

          {/* Bank Header Info Card */}
          <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-2xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-black tracking-tight">
                  {selectedBank?.name || "Question Bank"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/[0.04] text-black border border-black/10">
                  {selectedBank?.category || "General"}
                </span>
              </div>
              {selectedBank?.description && (
                <p className="text-xs text-zinc-500 mt-1 max-w-2xl">{selectedBank.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Questions</span>
                <span className="text-lg font-black text-black">{selectedBank?.questions?.length || 0}</span>
              </div>
              <div className="h-8 w-px bg-black/[0.08]"></div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Marks</span>
                <span className="text-lg font-black text-black">{selectedBank?.totalMarks || 0}</span>
              </div>
            </div>
          </div>

          {/* Search & Section Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-2xl p-3.5 rounded-2xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)]">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search question text or options..."
                value={questionSearch}
                onChange={(e) => {
                  setQuestionSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-black/[0.03] border border-black/[0.06] rounded-xl text-xs font-semibold text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
              />
              {questionSearch && (
                <button
                  onClick={() => {
                    setQuestionSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {uniqueSections.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={13} className="text-zinc-400 shrink-0" />
                <select
                  value={sectionFilter}
                  onChange={(e) => {
                    setSectionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-black/[0.03] border border-black/[0.06] rounded-xl text-xs font-bold text-black focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Sections ({questionsList.length})</option>
                  {uniqueSections.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Questions List */}
          {loadingQuestions ? (
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-black/[0.05] p-12 text-center">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-zinc-500">Loading questions from bank...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-black/[0.05] p-12 text-center space-y-3">
              <BookOpen size={36} className="mx-auto text-zinc-300" />
              <h3 className="text-sm font-bold text-black">No Questions Found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {questionSearch
                  ? "No questions match your query."
                  : "This bank doesn't have any questions yet. Add them manually or upload via Excel/CSV."}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={openCreateQuestion}
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  + Add Question
                </button>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2 bg-white border border-black/[0.08] text-black text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Import Excel / CSV
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedQuestions.map((q, idx) => {
                const questionIndex = (currentPage - 1) * QUESTIONS_PER_PAGE + idx + 1;
                return (
                  <div
                    key={q.id}
                    className="bg-white/80 backdrop-blur-2xl border border-black/[0.06] rounded-2xl p-5 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] space-y-3 hover:shadow-md transition"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/[0.04]">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black text-white text-[11px] font-black">
                          <Hash size={11} /> Q{questionIndex}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/[0.04] text-zinc-700 border border-black/5">
                          {q.sectionName || "General"}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-400">
                          • {q.marks || 1} {q.marks === 1 ? "Mark" : "Marks"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditQuestion(q)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-zinc-600 hover:text-black hover:bg-black/[0.04] rounded-lg transition cursor-pointer"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteQuestionTarget(q)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <p className="text-sm font-bold text-black leading-relaxed">{q.question}</p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(["A", "B", "C", "D"] as const).map((opt) => {
                        const isCorrect = q.correctAnswer === opt;
                        const optKey = `option${opt}` as keyof Question;
                        const optText = q[optKey] as string;

                        return (
                          <div
                            key={opt}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition ${
                              isCorrect
                                ? "bg-black text-white border-black font-bold shadow-xs"
                                : "bg-black/[0.02] text-zinc-800 border-black/[0.06] font-medium"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                isCorrect ? "bg-white text-black" : "bg-black/10 text-black"
                              }`}
                            >
                              {opt}
                            </span>
                            <span className="flex-1 leading-snug">{optText}</span>
                            {isCorrect && (
                              <CheckCircle2 size={14} className="text-white shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalQuestionPages > 1 && (
                <div className="bg-white/80 backdrop-blur-2xl p-3.5 rounded-2xl border border-black/[0.05] flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-semibold">
                    Showing {(currentPage - 1) * QUESTIONS_PER_PAGE + 1} -{" "}
                    {Math.min(currentPage * QUESTIONS_PER_PAGE, filteredQuestions.length)} of{" "}
                    {filteredQuestions.length} questions
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-black/[0.08] bg-white hover:bg-black/[0.03] text-black disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-black">
                      Page {currentPage} of {totalQuestionPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalQuestionPages, p + 1))}
                      disabled={currentPage >= totalQuestionPages}
                      className="p-1.5 rounded-lg border border-black/[0.08] bg-white hover:bg-black/[0.03] text-black disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: CREATE / EDIT QUESTION BANK                         */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {showBankModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBankModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.08] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <h2 className="text-base font-extrabold text-black">
                {editingBank ? "Edit Question Bank" : "Create New Question Bank"}
              </h2>
              <button
                onClick={() => setShowBankModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-black/[0.04] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {bankFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle size={15} /> {bankFormError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1">Bank Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Banca Assurance Unit Manager Pool"
                  value={bankFormData.name}
                  onChange={(e) => setBankFormData({ ...bankFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs font-bold text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1">Category / Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Banking & Financial, Sales Aptitude, Tech"
                  value={bankFormData.category}
                  onChange={(e) => setBankFormData({ ...bankFormData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Description (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brief note describing who this bank is designed for..."
                  value={bankFormData.description}
                  onChange={(e) => setBankFormData({ ...bankFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs font-medium text-black focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
              <button
                type="button"
                disabled={savingBank}
                onClick={() => setShowBankModal(false)}
                className="px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-bold text-zinc-600 hover:bg-black/[0.04] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingBank}
                onClick={handleSaveBank}
                className="px-4 py-2 rounded-xl bg-black hover:bg-black/85 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingBank ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>{savingBank ? "Saving..." : editingBank ? "Update Bank" : "Create Bank"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: MANUAL QUESTION ADD / EDIT                          */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {showQuestionModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQuestionModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.08] max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <h2 className="text-base font-extrabold text-black">
                {editingQuestion ? "Edit Question" : "Add Single Question to Bank"}
              </h2>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-black/[0.04] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {questionFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle size={15} /> {questionFormError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1">Question Statement *</label>
                <textarea
                  rows={3}
                  placeholder="Enter the full question prompt clearly..."
                  value={questionFormData.question}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                  className="w-full px-3 py-2 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Section / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Communication, Aptitude"
                    value={questionFormData.sectionName}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, sectionName: e.target.value })}
                    className="w-full px-3 py-2 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Marks</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={questionFormData.marks}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, marks: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {(["A", "B", "C", "D"] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {opt}
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${opt} text...`}
                      value={questionFormData[`option${opt}` as keyof typeof questionFormData] as string}
                      onChange={(e) =>
                        setQuestionFormData({ ...questionFormData, [`option${opt}`]: e.target.value })
                      }
                      className="flex-1 px-3 py-1.5 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs font-medium text-black focus:outline-none focus:border-black"
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer */}
              <div className="pt-2">
                <label className="block text-xs font-extrabold text-zinc-700 mb-1">Correct Answer *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["A", "B", "C", "D"] as const).map((opt) => {
                    const isSelected = questionFormData.correctAnswer === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQuestionFormData({ ...questionFormData, correctAnswer: opt })}
                        className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                          isSelected
                            ? "bg-black text-white border-black shadow-xs"
                            : "bg-black/[0.02] text-zinc-700 border-black/[0.08] hover:bg-black/[0.06]"
                        }`}
                      >
                        Option {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
              <button
                type="button"
                disabled={savingQuestion}
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-bold text-zinc-600 hover:bg-black/[0.04] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingQuestion}
                onClick={handleSaveQuestion}
                className="px-4 py-2 rounded-xl bg-black hover:bg-black/85 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingQuestion ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>{savingQuestion ? "Saving..." : editingQuestion ? "Update Question" : "Add Question"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: BULK IMPORT EXCEL / CSV                             */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {showBulkModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBulkModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.08] max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-black" />
                <h2 className="text-base font-extrabold text-black">Bulk Import Questions (Excel / CSV)</h2>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-black/[0.04] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Upload an <strong>.xlsx</strong> or <strong>.csv</strong> file containing questions. Column headers should be:{" "}
              <code className="bg-black/[0.05] px-1 py-0.5 rounded text-[11px] font-mono text-black">
                question, optionA, optionB, optionC, optionD, correctAnswer, marks, sectionName
              </code>
            </p>

            {/* Upload Drag & Drop Box */}
            <div className="border-2 border-dashed border-black/15 hover:border-black/40 rounded-2xl p-6 text-center transition bg-black/[0.01]">
              <input
                id={bulkFileInputId}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleBulkFileChange}
                className="hidden"
              />
              <label htmlFor={bulkFileInputId} className="cursor-pointer block space-y-2">
                <Upload size={28} className="mx-auto text-zinc-400" />
                <div className="text-xs font-bold text-black">
                  {bulkFileName ? (
                    <span className="text-black font-extrabold">Selected: {bulkFileName}</span>
                  ) : (
                    "Click to browse file (Excel .xlsx / CSV)"
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">Supported formats: .xlsx, .xls, .csv</p>
              </label>
            </div>

            {/* Parsing Errors Notice */}
            {bulkErrors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                  <AlertCircle size={14} /> Found {bulkErrors.length} Issue(s) in File:
                </div>
                <ul className="text-[11px] text-red-600 list-disc list-inside max-h-24 overflow-y-auto space-y-0.5">
                  {bulkErrors.map((err, i) => (
                    <li key={i}>
                      {err.row > 0 ? `Row ${err.row}: ` : ""}
                      {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Parsed Rows Preview */}
            {bulkRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-black">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    {bulkRows.length} Questions Ready to Import
                  </span>
                  <span className="text-zinc-400 text-[11px]">Previewing first 2 rows</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {bulkRows.slice(0, 2).map((r, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-black/[0.02] border border-black/5 text-xs space-y-1">
                      <div className="font-bold text-black line-clamp-1">
                        #{i + 1} {r.question}
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                        <span>Correct: <strong>{r.correctAnswer}</strong></span>
                        <span>• Marks: {r.marks}</span>
                        <span>• Section: {r.sectionName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
              <button
                type="button"
                disabled={uploadingBulk}
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-bold text-zinc-600 hover:bg-black/[0.04] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={uploadingBulk || bulkRows.length === 0}
                onClick={handleUploadBulk}
                className="px-4 py-2 rounded-xl bg-black hover:bg-black/85 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {uploadingBulk ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>
                  {uploadingBulk ? "Importing Questions..." : `Import ${bulkRows.length} Questions`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* CONFIRM MODALS: DELETE BANK & DELETE QUESTION                */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <ConfirmModal
        isOpen={!!deleteBankTarget}
        title="Delete Question Bank"
        message={`Are you sure you want to delete "${deleteBankTarget?.name}"? All ${deleteBankTarget?.questionCount || 0} questions inside this bank will be deleted.`}
        confirmText="Delete Bank"
        cancelText="Cancel"
        isDanger={true}
        loading={deletingBank}
        onConfirm={confirmDeleteBank}
        onCancel={() => {
          if (!deletingBank) setDeleteBankTarget(null);
        }}
      />

      <ConfirmModal
        isOpen={!!deleteQuestionTarget}
        title="Delete Question"
        message="Are you sure you want to remove this question from the bank?"
        confirmText="Delete Question"
        cancelText="Cancel"
        isDanger={true}
        loading={deletingQuestion}
        onConfirm={confirmDeleteQuestion}
        onCancel={() => {
          if (!deletingQuestion) setDeleteQuestionTarget(null);
        }}
      />
    </div>
  );
}
