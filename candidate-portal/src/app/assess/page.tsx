"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Zap,
  Clock,
  Award,
  BookOpen,
  Check,
  ExternalLink,
  User,
  Users,
  Target,
  BarChart3,
  BrainCircuit,
  Eye,
  Camera,
  Layers,
  HelpCircle,
  Building2,
  Lock,
  Code2,
  Terminal,
  Activity,
  Cpu,
  MonitorCheck,
  FileCheck,
} from "lucide-react";

export default function AssessPage() {
  const router = useRouter();
  const [examCode, setExamCode] = useState("");
  const [launchError, setLaunchError] = useState("");
  const [activeTab, setActiveTab] = useState<"aptitude" | "technical" | "behavioural">("technical");
  const [simulatedAnswer, setSimulatedAnswer] = useState<string | null>("B");

  const handleLaunchExam = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = examCode.trim();
    if (!clean) {
      setLaunchError("Please enter your assessment session code or slug.");
      return;
    }
    const slug = clean.replace(/^(https?:\/\/[^\/]+\/)?/, "").replace(/^\//, "");
    router.push(`/${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP UTILITY HEADER (Contact & Hotlines)
      ────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#0A0C10] border-b border-white/5 py-2 px-4 sm:px-8 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <a
            href="tel:+918810418647"
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>+91-8810418647</span>
          </a>
          <span className="text-white/20">|</span>
          <a
            href="mailto:contact@greatcampus.in"
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <Mail className="w-3 h-3 text-cyan-400" />
            <span>contact@greatcampus.in</span>
          </a>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            PILLAR 01: ASSESS ACTIVE
          </span>
          <span className="text-white/20 hidden sm:inline">|</span>
          <a
            href="https://admin.assessment.greatcampus.tech"
            className="text-slate-300 hover:text-white font-bold flex items-center gap-1 transition"
          >
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>HR Admin Portal</span>
          </a>
          <span className="text-white/20">|</span>
          <a
            href="https://sa.assessment.greatcampus.tech"
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Super Admin</span>
          </a>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN STICKY NAVIGATION BAR
      ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#050608]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-black font-black flex items-center justify-center text-lg shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              GC
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                GreatCampus
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Assess
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                Digital Assessment & AI Proctoring
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/assess" className="text-cyan-400 font-bold flex items-center gap-1">
              01 - Assess <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            </Link>
            <a
              href="https://admin.assessment.greatcampus.tech"
              className="hover:text-white transition flex items-center gap-1"
            >
              Client Admin
            </a>
            <a
              href="https://sa.assessment.greatcampus.tech"
              className="hover:text-white transition flex items-center gap-1"
            >
              Super Admin
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#exam-launcher"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs tracking-wider uppercase hover:opacity-90 transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              Take Assessment
            </a>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SECTION WITH DIRECT EXAM LAUNCHER
      ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.08),transparent_50%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                PILLAR 01: TALENT CAPABILITY ASSESSMENT
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Identify Who Can <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                  Actually Do The Job.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
                GreatCampus enables organizations to conduct structured digital assessments that measure the capabilities that truly matter for a role — blending cognitive horsepower, hands-on domain mastery, and behavioural resilience with automated AI proctoring.
              </p>

              {/* Assessment Launcher Box */}
              <div id="exam-launcher" className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl max-w-xl shadow-2xl">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  <Terminal className="w-3.5 h-3.5" /> Candidate Examination Launcher
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Enter your assigned Assessment Session Code or Slug to launch your AI-proctored exam:
                </p>

                <form onSubmit={handleLaunchExam} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. aa-2812 or session slug"
                      value={examCode}
                      onChange={(e) => {
                        setExamCode(e.target.value);
                        setLaunchError("");
                      }}
                      className="w-full bg-black/70 border border-white/20 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs tracking-wider uppercase hover:opacity-90 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-cyan-500/20"
                  >
                    Start Test <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {launchError && (
                  <p className="text-xs text-rose-400 font-medium mt-2.5">{launchError}</p>
                )}
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% White-Label Isolation
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> ISO 27001 & Cryptographic Audit
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" /> Zero Browser Collusion
                </span>
              </div>
            </div>

            {/* Right Card: Dynamic Diagnostic Telemetry Mockup */}
            <div className="lg:col-span-5">
              <div className="relative p-6 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.01] border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-mono text-slate-400 ml-2">PROCTOR_SYSTEM_V4</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                    LIVE AI PROCTORING
                  </span>
                </div>

                {/* Candidate Feed Simulation */}
                <div className="relative rounded-2xl bg-black border border-white/10 overflow-hidden aspect-[4/3] flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)]"></div>
                  
                  {/* Face oval guideline */}
                  <div className="w-40 h-52 rounded-[50%] border-2 border-dashed border-cyan-400/60 flex items-center justify-center relative">
                    <div className="absolute top-2 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono">
                      FACE_CENTERED_OK
                    </div>
                    <User className="w-16 h-16 text-cyan-500/40" />
                  </div>

                  {/* Top telemetry tags */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/80 border border-white/10 text-[10px] font-mono text-emerald-400">
                    <Camera className="w-3 h-3 text-emerald-400" />
                    <span>30 FPS • 720p HD</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Audio Decibels: <strong className="text-white">12 dB (Quiet)</strong></span>
                    <span className="text-emerald-400 font-bold">Anti-Cheat: ACTIVE</span>
                  </div>
                </div>

                {/* 4 Metric indicators */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Window Status</div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <MonitorCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Fullscreen Locked
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Tab Blurs</div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      0 Violations
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. VALIDATED STATS & ENTERPRISE BENCHMARKS
      ────────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-[#080A0E] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">30,000+</div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mt-2">Validated Questions</div>
              <p className="text-xs text-slate-500 mt-1">Multi-domain adaptive bank</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">500+</div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mt-2">Role Competency Profiles</div>
              <p className="text-xs text-slate-500 mt-1">Tech, Finance, Sales, Ops</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">15+ Languages</div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mt-2">Cloud Code Sandbox</div>
              <p className="text-xs text-slate-500 mt-1">Python, JS, Java, C++, Go, SQL</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">99.8%</div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mt-2">Proctoring Accuracy</div>
              <p className="text-xs text-slate-500 mt-1">AI facial & tab focus engine</p>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. THE THREE FOUNDATIONAL PILLARS (Tabs & Matrix)
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-8 border-b border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-cyan-400 text-xs font-mono font-bold tracking-wide">
            <Cpu className="w-3.5 h-3.5" /> HOLISTIC ROLE ASSESSMENT
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Cognitive, Domain & Behavioural Synergy
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            GreatCampus eliminates guesswork by evaluating candidates through three rigorous, interconnected dimensions:
          </p>

          {/* Pillar Selector Tabs */}
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab("aptitude")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition ${
                activeTab === "aptitude"
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              1. Aptitude & Logic
            </button>
            <button
              onClick={() => setActiveTab("technical")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition ${
                activeTab === "technical"
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              2. Technical & Domain
            </button>
            <button
              onClick={() => setActiveTab("behavioural")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition ${
                activeTab === "behavioural"
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              3. Behavioural & Resilience
            </button>
          </div>
        </div>

        {/* Dynamic Pillar Display */}
        {activeTab === "aptitude" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Numerical Reasoning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quantitative aptitude, data interpretation, financial ratios, probability, and rapid mathematical reasoning.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Logical & Analytical</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pattern recognition, critical deductions, syllogisms, and systematic root-cause problem deconstruction.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Verbal Ability</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Business communication comprehension, contextual vocabulary, syntax integrity, and editorial reasoning.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                04
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Learning Agility</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                How rapidly candidates absorb new rules, adapt to changing test constraints, and extrapolate insights.
              </p>
            </div>
          </div>
        )}

        {activeTab === "technical" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Software & Cloud Sandbox</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hands-on programming tests in Python, Java, JS, C++, Go, and SQL with automated test case evaluation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Finance & Accounting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Financial modeling, balance sheet analytics, risk management, and GAAP compliance scenario testing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sales & Growth Execution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pipeline qualification, objection handling, pitch simulations, and customer acquisition scenario tests.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Operations & SOP</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Process workflow simulations, ticketing resolutions, logistical prioritization, and compliance execution.
              </p>
            </div>
          </div>
        )}

        {activeTab === "behavioural" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Teamwork & Alignment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cross-functional empathy, collaborative conflict negotiation, and team-first orientation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Crisis Decision-Making</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluating candidate emotional equilibrium, priority triage, and rational judgment under strict time limits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Autonomous Initiative</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Self-starter indicators, resourcefulness when unguided, and bias toward constructive action.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Customer Empathy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active listening instincts, emotional intelligence, and stakeholder management capability.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. AI-POWERED PROCTORING SUITE
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-8 border-b border-white/5">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> UNCOMPROMISING INTEGRITY
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              AI-Powered Online Proctoring You Can Trust
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Where high stakes demand zero compromise, our continuous proctoring engine ensures that every test result is 100% authentic, tamper-evident, and auditable.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Eye className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">360° Continuous Facial Biometrics</h4>
                  <p className="text-xs text-slate-400">
                    Continuously detects multiple faces, unauthorized personnel in the room, candidate absence, or looking away from the camera.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <MonitorCheck className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Full Browser & Window Lock</h4>
                  <p className="text-xs text-slate-400">
                    Mandates native fullscreen mode. Enforces automatic strike increments whenever a candidate attempts to switch tabs or open apps.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Lock className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Anti-ChatGPT / Copy-Paste Lockdown</h4>
                  <p className="text-xs text-slate-400">
                    Clipboard access is permanently blocked. Keystroke rhythm analysis flags AI-generated answers or automated script injections.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Question Simulator */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Live Simulation</span>
                  <h4 className="text-base font-bold text-white">Question 14 of 60 • Aptitude & Logic</h4>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>34:12 Remaining</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  A distributed microservice platform experiences an unpredicted 40% traffic spike during quarterly evaluations. If worker pod autoscaling initiates after 120ms with a cooldown factor of 0.85, what is the optimal capacity multiplier required to sustain sub-50ms latency?
                </p>

                <div className="space-y-2.5">
                  {[
                    { key: "A", text: "1.25x Baseline Horizontal Pod Scale" },
                    { key: "B", text: "1.40x Elastic Multiplier with Dynamic Cooldown" },
                    { key: "C", text: "2.10x Static Replicated Load Shedding" },
                    { key: "D", text: "0.95x Conservative Backpressure Throttling" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSimulatedAnswer(option.key)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-mono flex items-center justify-between transition ${
                        simulatedAnswer === option.key
                          ? "bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold"
                          : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span>
                        <strong className="mr-3">{option.key}.</strong> {option.text}
                      </span>
                      {simulatedAnswer === option.key && (
                        <Check className="w-4 h-4 text-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Auto-saved to Postgres Audit Trail</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Proctor Verified
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. ACTION CALLOUT
      ────────────────────────────────────────────────────────────── */}
      <section className="py-20 text-center max-w-5xl mx-auto px-4 sm:px-8">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-tr from-cyan-950/40 via-blue-950/30 to-black border border-cyan-500/30 shadow-2xl relative overflow-hidden space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
            READY TO DEPLOY
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Elevate Your Talent Quality Today.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Eliminate resume screening bottlenecks. Give your team validated role capability data in real time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#exam-launcher"
              className="px-8 py-3.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs tracking-wider uppercase hover:opacity-90 transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              Start Candidate Exam <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://admin.assessment.greatcampus.tech"
              className="px-8 py-3.5 rounded-xl bg-white/10 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-white/20 transition flex items-center gap-2"
            >
              Client Admin Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER
      ────────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#030406] border-t border-white/5 py-12 px-4 sm:px-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-cyan-500 text-black font-black flex items-center justify-center text-xs">
              GC
            </div>
            <span className="text-slate-300 font-bold">GreatCampus Technologies</span>
            <span>• Integrated Talent Journey</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://assessment.greatcampus.tech" className="hover:text-white transition">Candidate Portal</a>
            <a href="https://admin.assessment.greatcampus.tech" className="hover:text-white transition">Admin Portal</a>
            <a href="https://sa.assessment.greatcampus.tech" className="hover:text-white transition">Super Admin</a>
            <a href="https://api.assessment.greatcampus.tech/api/docs" className="hover:text-white transition">API Docs</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
