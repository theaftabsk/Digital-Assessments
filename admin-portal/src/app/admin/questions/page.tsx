"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Edit2, X, BookOpen, CheckCircle2, RefreshCw, AlertCircle, Hash
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  marks: number;
  status: string;
  createdAt: string;
}

const emptyForm = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  marks: 1,
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/questions`);
      const data = await res.json();
      if (data.success) setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const filtered = questions.filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearch = (val: string) => { setSearchTerm(val); setCurrentPage(1); };

  const openEdit = (q: Question) => {
    setEditingQ(q);
    setFormData({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    const { question, optionA, optionB, optionC, optionD } = formData;
    if (!question.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setFormError("All fields are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const baseUrl = getApiBaseUrl();
      if (editingQ) {
        await fetch(`${baseUrl}/api/v1/questions/${editingQ.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setShowModal(false);
      await fetchQuestions();
    } catch (err: any) {
      setFormError(err.message || "Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  const optionBadgeBg: Record<string, string> = {
    A: "#2563eb", B: "#0284c7", C: "#d97706", D: "#059669",
  };

  return (
    <div className="qp-page">
      {/* Header Bar */}
      <div className="qp-header">
        <p className="qp-subtitle">
          {questions.length} Questions in fixed pool · High-contrast Clean White & Blue
        </p>
        <div className="qp-header-actions">
          <button className="qp-refresh-btn" onClick={fetchQuestions} title="Refresh Questions">
            <RefreshCw size={15} /> Refresh Bank
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="qp-search-wrap">
        <Search size={16} className="qp-search-icon" />
        <input
          className="qp-search"
          placeholder="Search question text..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchTerm && (
          <button className="qp-search-clear" onClick={() => handleSearch("")}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Question List */}
      {loading ? (
        <div className="qp-loading">
          <div className="qp-spinner"></div>
          <p>Loading Question Bank...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="qp-empty">
          <BookOpen size={42} className="qp-empty-icon" />
          <p>{searchTerm ? "No questions match your search query." : "No questions in the question bank yet."}</p>
        </div>
      ) : (
        <>
          <div className="qp-list">
            {paginated.map((q) => (
              <div key={q.id} className="qp-card">
                <div className="qp-card-top">
                  <div className="qp-card-num">
                    <Hash size={12} /> Question {questions.indexOf(q) + 1}
                  </div>
                  <div className="qp-card-actions">
                    <button className="qp-btn-edit" onClick={() => openEdit(q)}>
                      <Edit2 size={14} /> Edit Question
                    </button>
                  </div>
                </div>

                <p className="qp-question-text">{q.question}</p>

                <div className="qp-options">
                  {(["A", "B", "C", "D"] as const).map((opt) => {
                    const isCorrect = q.correctAnswer === opt;
                    return (
                      <div
                        key={opt}
                        className={`qp-option ${isCorrect ? "qp-option--correct" : ""}`}
                      >
                        <span className="qp-opt-label" style={{ background: optionBadgeBg[opt] }}>{opt}</span>
                        <span className="qp-opt-text">{q[`option${opt}` as keyof Question] as string}</span>
                        {isCorrect && (
                          <CheckCircle2 size={16} className="qp-correct-icon" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="qp-pagination">
              <button
                className="qp-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              <div className="qp-page-info">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                <span className="qp-page-count">({filtered.length} total questions)</span>
              </div>
              <button
                className="qp-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* EDIT MODAL */}
      {showModal && (
        <div
          className="qp-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="qp-modal">
            <div className="qp-modal-header">
              <h2>Edit Question</h2>
              <button className="qp-modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="qp-modal-body">
              {formError && (
                <div className="qp-form-error"><AlertCircle size={15} /> {formError}</div>
              )}

              <div className="qp-form-group">
                <label>Question Statement *</label>
                <textarea
                  rows={3}
                  placeholder="Enter question text..."
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="qp-form-input qp-form-textarea"
                />
              </div>

              {(["A", "B", "C", "D"] as const).map((opt) => (
                <div key={opt} className="qp-form-group">
                  <label>
                    <span className="qp-opt-label-sm" style={{ background: optionBadgeBg[opt] }}>{opt}</span>
                    Option {opt} *
                  </label>
                  <input
                    type="text"
                    placeholder={`Option ${opt}...`}
                    value={formData[`option${opt}` as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                    className="qp-form-input"
                  />
                </div>
              ))}

              <div className="qp-form-row">
                <div className="qp-form-group">
                  <label>Correct Answer *</label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="qp-form-input font-bold text-blue-600"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div className="qp-form-group">
                  <label>Marks</label>
                  <input
                    type="number" min={0.5} max={5} step={0.5}
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="qp-form-input"
                  />
                </div>
              </div>
            </div>

            <div className="qp-modal-footer">
              <button className="qp-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="qp-modal-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving Changes..." : "Save Question"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .qp-page { padding: 28px 36px; width: 100%; max-width: 100%; margin: 0; background-color: #f8fafc; min-height: calc(100vh - 64px); box-sizing: border-box; }
        
        .qp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; width: 100%; }
        .qp-header-left { display: flex; align-items: center; gap: 14px; }
        .qp-header-icon { width: 44px; height: 44px; border-radius: 12px; background: #2563eb; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
        .qp-title { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0; tracking: -0.02em; }
        .qp-subtitle { font-size: 0.84rem; color: #64748b; margin-top: 2px; font-weight: 500; }
        .qp-header-actions { display: flex; gap: 10px; align-items: center; }
        .qp-refresh-btn { background: #ffffff; border: 1px solid #cbd5e1; color: #334155; border-radius: 10px; padding: 9px 16px; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .qp-refresh-btn:hover { background: #f1f5f9; border-color: #94a3b8; color: #0f172a; }

        .qp-search-wrap { position: relative; margin-bottom: 24px; width: 100%; }
        .qp-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .qp-search { width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 14px 12px 42px; color: #0f172a; font-size: 0.9rem; font-weight: 500; outline: none; box-sizing: border-box; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: border-color 0.2s, box-shadow 0.2s; }
        .qp-search:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .qp-search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; padding: 4px; border-radius: 6px; }
        .qp-search-clear:hover { color: #0f172a; background: #e2e8f0; }

        .qp-loading { text-align: center; padding: 60px; color: #64748b; font-size: 0.9rem; font-weight: 600; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .qp-spinner { width: 28px; height: 28px; border: 3px solid #2563eb; border-top-color: transparent; border-radius: 50%; animation: qpSpin 0.8s linear infinite; }
        @keyframes qpSpin { to { transform: rotate(360deg); } }

        .qp-empty { text-align: center; padding: 70px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; color: #64748b; }
        .qp-empty-icon { margin: 0 auto 12px; color: #94a3b8; }

        .qp-list { display: flex; flex-direction: column; gap: 16px; }

        .qp-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: border-color 0.2s, box-shadow 0.2s; }
        .qp-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .qp-card-top { display: flex; justify-content: space-between; align-items: center; }
        .qp-card-num { display: flex; align-items: center; gap: 5px; font-size: 0.78rem; font-weight: 700; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 4px 10px; }
        .qp-card-actions { display: flex; gap: 8px; }
        .qp-btn-edit { display: flex; align-items: center; gap: 5px; font-size: 0.78rem; font-weight: 700; padding: 6px 14px; border-radius: 8px; border: 1px solid #bfdbfe; background: #eff6ff; color: #1d4ed8; cursor: pointer; transition: all 0.2s; }
        .qp-btn-edit:hover { background: #dbeafe; border-color: #93c5fd; }

        .qp-question-text { font-size: 0.95rem; font-weight: 700; color: #0f172a; line-height: 1.5; margin: 0; }

        .qp-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .qp-option { display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; position: relative; transition: border-color 0.2s; }
        .qp-option--correct { background: #f0fdf4; border-color: #86efac; }
        .qp-opt-label { font-size: 0.72rem; font-weight: 800; color: #ffffff; border-radius: 6px; padding: 2px 7px; flex-shrink: 0; }
        .qp-opt-text { font-size: 0.85rem; color: #334155; font-weight: 600; line-height: 1.4; flex: 1; }
        .qp-correct-icon { color: #16a34a; flex-shrink: 0; }

        .qp-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding: 16px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .qp-page-btn { background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; border-radius: 9px; padding: 8px 18px; font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .qp-page-btn:hover:not(:disabled) { background: #eff6ff; border-color: #2563eb; color: #2563eb; }
        .qp-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .qp-page-info { font-size: 0.84rem; color: #64748b; font-weight: 500; }
        .qp-page-info strong { color: #0f172a; font-weight: 700; }
        .qp-page-count { margin-left: 6px; font-size: 0.78rem; color: #94a3b8; }

        /* Modal */
        .qp-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(4px); }
        .qp-modal { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .qp-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
        .qp-modal-header h2 { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0; }
        .qp-modal-close { background: #f1f5f9; border: none; color: #64748b; cursor: pointer; padding: 6px; border-radius: 8px; display: flex; align-items: center; }
        .qp-modal-close:hover { color: #0f172a; background: #e2e8f0; }
        .qp-modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; }
        .qp-form-group { display: flex; flex-direction: column; gap: 6px; }
        .qp-form-group label { font-size: 0.8rem; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px; }
        .qp-form-input { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 14px; color: #0f172a; font-size: 0.88rem; font-weight: 500; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; box-sizing: border-box; }
        .qp-form-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .qp-form-textarea { resize: vertical; font-family: inherit; }
        .qp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .qp-opt-label-sm { font-size: 0.7rem; font-weight: 800; color: #ffffff; border-radius: 5px; padding: 1px 6px; }
        .qp-form-error { display: flex; align-items: center; gap: 8px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 10px 14px; font-size: 0.82rem; color: #dc2626; font-weight: 600; }
        .qp-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 18px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; }
        .qp-modal-cancel { background: #ffffff; border: 1px solid #cbd5e1; color: #475569; border-radius: 10px; padding: 9px 18px; font-size: 0.86rem; font-weight: 600; cursor: pointer; }
        .qp-modal-save { background: #2563eb; border: none; color: #ffffff; border-radius: 10px; padding: 9px 22px; font-size: 0.86rem; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.3); }
        .qp-modal-save:hover { background: #1d4ed8; }
        .qp-modal-save:disabled { opacity: 0.6; cursor: not-allowed; }
        
        @media (max-width: 600px) {
          .qp-options { grid-template-columns: 1fr; }
          .qp-form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
