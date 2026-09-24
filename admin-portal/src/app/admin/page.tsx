"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserX,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

export default function AdminOverviewDashboard() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [userName, setUserName] = useState<string>("HR Administrator");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    const token = localStorage.getItem("banca_admin_token") || "";
    const userStr = localStorage.getItem("banca_admin_user");
    let activeRole = "ADMIN";
    let activeVendorId: string | null = null;

    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        activeRole = u.role || "ADMIN";
        activeVendorId = u.vendorId || null;
        setUserRole(activeRole);
        setUserName(u.name || "Administrator");
      } catch {}
    }

    const headers: any = {
      Authorization: `Bearer ${token}`,
      ...(activeRole === "VENDOR" && activeVendorId ? { "x-vendor-id": activeVendorId, "x-user-role": "VENDOR" } : {}),
    };

    const candUrl =
      activeRole === "VENDOR" && activeVendorId
        ? `${baseUrl}/api/v1/candidates?vendorId=${activeVendorId}`
        : `${baseUrl}/api/v1/candidates`;

    Promise.all([
      fetch(candUrl, { headers }).then((r) => r.json()),
      fetch(`${baseUrl}/api/v1/assessments`, { headers }).then((r) => r.json()),
      activeRole !== "VENDOR"
        ? fetch(`${baseUrl}/api/v1/questions`, { headers }).then((r) => r.json())
        : Promise.resolve({ questions: [] }),
    ])
      .then(([cRes, aRes, qRes]) => {
        if (cRes?.success) setCandidates(cRes.candidates || []);
        if (aRes?.success) setAssessments(aRes.assessments || []);
        if (qRes?.success) setQuestions(qRes.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500 font-bold tracking-tight">Loading Dashboard Analytics...</p>
      </div>
    );
  }

  const isVendor = userRole === "VENDOR";
  const totalCand = candidates.length;
  const completedCand = candidates.filter((c) => c.status === "COMPLETED");
  const inProgressCand = candidates.filter((c) => c.status === "IN_PROGRESS");
  const lockedCand = candidates.filter((c) => c.status === "LOCKED" || c.attempt?.status === "LOCKED");
  const registeredCand = candidates.filter((c) => c.status === "REGISTERED" || !c.attempt);

  const avgScore =
    completedCand.length > 0
      ? Math.round(
          completedCand.reduce((acc, c) => acc + (c.attempt?.percentage || c.percentage || 0), 0) /
            completedCand.length
        )
      : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Apple Liquid Glass Banner */}
      <div className="bg-white/80 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center md:justify-between gap-5 transition-all">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
              {isVendor ? "Vendor Control Panel" : "Talent Assessment & Operations"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-tight max-w-2xl">
            {isVendor
              ? "Manage candidate batches, upload roster files, and monitor real-time test progress."
              : "Real-time overview of active exams, candidate evaluations, proctoring metrics, and system activity."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isVendor ? (
            <Link
              href="/admin/assessments"
              className="px-4 py-2.5 bg-black hover:bg-black/90 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <FileText size={14} />
              <span>My Assessments ({assessments.length})</span>
            </Link>
          ) : (
            <Link
              href="/admin/vendors"
              className="px-4 py-2.5 bg-black/[0.04] hover:bg-black/[0.08] text-black border border-black/[0.08] rounded-2xl text-xs font-bold flex items-center gap-2 transition"
            >
              <Building2 size={14} />
              <span>Manage Vendors</span>
            </Link>
          )}
          <Link
            href="/admin/assessments"
            className="px-4 py-2.5 bg-black text-white hover:bg-black/90 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <span>+ Create Exam</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards (Strict Apple Monochrome) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Candidates */}
        <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">
              {isVendor ? "My Candidates" : "Total Candidates"}
            </p>
            <p className="text-3xl font-black text-black tracking-tight mt-1">{totalCand}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">
                {isVendor ? "Assigned Roster" : "Candidate Pool"}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 bg-black/[0.04] border border-black/[0.06] text-black rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Average Score</p>
            <p className="text-3xl font-black text-black tracking-tight mt-1">{avgScore}%</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">
                {completedCand.length} Evaluated
              </span>
            </div>
          </div>
          <div className="w-11 h-11 bg-black/[0.04] border border-black/[0.06] text-black rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Completed Sessions</p>
            <p className="text-3xl font-black text-black tracking-tight mt-1">{completedCand.length}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">Final Submissions</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-black/[0.04] border border-black/[0.06] text-black rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Question Bank Pool */}
        <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">
              {isVendor ? "Assigned Exams" : "Question Bank"}
            </p>
            <p className="text-3xl font-black text-black tracking-tight mt-1">
              {isVendor ? assessments.length : questions.length}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-[11px] font-bold text-zinc-500 tracking-tight">
                {isVendor ? "Active Assessments" : "Question Pool"}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 bg-black/[0.04] border border-black/[0.06] text-black rounded-2xl flex items-center justify-center shrink-0">
            {isVendor ? <FileText className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
        </div>

      </div>

      {/* Candidate Performance Status Summary (Apple Liquid Glass) */}
      <div className="bg-white/80 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-black" />
            <h2 className="text-sm font-black text-black tracking-tight">
              {isVendor ? "Candidates Exam Lifecycle Progress" : "Candidate Performance Status Summary"}
            </h2>
          </div>
          <Link
            href="/admin/candidates"
            className="text-xs font-bold text-black hover:opacity-75 flex items-center gap-1 tracking-tight transition"
          >
            <span>View Full Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Status Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.04] transition">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Completed</span>
            </div>
            <p className="text-2xl font-black text-black tracking-tight mt-2">{completedCand.length}</p>
            <p className="text-[11px] text-zinc-500 font-semibold tracking-tight mt-0.5">
              {totalCand > 0 ? `${Math.round((completedCand.length / totalCand) * 100)}%` : "0%"} of Total
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.04] transition">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">In Progress</span>
            </div>
            <p className="text-2xl font-black text-black tracking-tight mt-2">{inProgressCand.length}</p>
            <p className="text-[11px] text-zinc-500 font-semibold tracking-tight mt-0.5">Live Sessions</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.04] transition">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Not Started</span>
            </div>
            <p className="text-2xl font-black text-black tracking-tight mt-2">{registeredCand.length}</p>
            <p className="text-[11px] text-zinc-500 font-semibold tracking-tight mt-0.5">Pending Login</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.04] transition">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Locked / Flagged</span>
            </div>
            <p className="text-2xl font-black text-black tracking-tight mt-2">{lockedCand.length}</p>
            <p className="text-[11px] text-zinc-500 font-semibold tracking-tight mt-0.5">Integrity Violations</p>
          </div>

        </div>
      </div>

    </div>
  );
}
