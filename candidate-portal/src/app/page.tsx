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
  Video,
  BookOpen,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Users,
  Target,
  BarChart3,
  TrendingUp,
  BrainCircuit,
  Eye,
  Camera,
  Layers,
  HelpCircle,
  Building2,
  Lock,
} from "lucide-react";

export default function GreatCampusLandingPage() {
  const router = useRouter();

  // Assessment code launcher state
  const [examCode, setExamCode] = useState("");
  const [launchError, setLaunchError] = useState("");

  // Demo Modal state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    challenge: "Need all three: Complete Talent Journey",
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // Interactive microlearning quiz state in preview
  const [quizAnswer, setQuizAnswer] = useState<string | null>("correct");

  // Handle direct exam launch
  const handleLaunchExam = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = examCode.trim();
    if (!clean) {
      setLaunchError("Please enter your assessment session code or slug.");
      return;
    }
    // Clean leading slash or URL
    const slug = clean.replace(/^(https?:\/\/[^\/]+\/)?/, "").replace(/^\//, "");
    router.push(`/${slug}`);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 font-sans selection:bg-white selection:text-black">
      
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
            <Mail className="w-3 h-3 text-blue-400" />
            <span>contact@greatcampus.in</span>
          </a>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Continuous Loop Mode: ACTIVE
          </span>
          <span className="text-white/20 hidden sm:inline">|</span>
          <a
            href="http://localhost:3000/admin/login"
            className="text-slate-300 hover:text-white font-bold flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>HR Admin Portal</span>
          </a>
          <span className="text-white/20">|</span>
          <a
            href="http://localhost:3002"
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
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
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white text-black font-black flex items-center justify-center text-lg shadow-lg shadow-white/10 group-hover:scale-105 transition">
              GC
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                GreatCampus
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">
                  Tech
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Integrated Talent Journey
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-300">
            <a href="#pillars" className="hover:text-white transition">Products & Pillars</a>
            <a href="#challenge" className="hover:text-white transition">The Challenge</a>
            <a href="#difference" className="hover:text-white transition">The Difference</a>
            <a href="#solutions" className="hover:text-white transition">Solutions</a>
            <a href="#comparison" className="hover:text-white transition">Pricing & ROI</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById("exam-launcher");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-extrabold text-xs transition cursor-pointer"
            >
              Take Assessment →
            </button>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-black text-xs shadow-lg shadow-white/10 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Book a Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SECTION (Monochrome High-Contrast Edition)
      ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        
        {/* Glow & Grid Accents */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10 text-center space-y-8">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white text-xs font-mono tracking-wider shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ASSESS → INTERVIEW → DEVELOP → REASSESS
          </div>

          {/* Main Massive Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-5xl mx-auto">
            Identify the right people. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Make better hiring decisions.
            </span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
              Continuously develop talent.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            From assessment to interview to development, GreatCampus helps organizations build a smarter, faster and more measurable talent journey.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-200 text-black font-black text-sm shadow-xl shadow-white/15 transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#pillars"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-extrabold text-sm transition flex items-center justify-center gap-2"
            >
              <span>Explore GreatCampus</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. INSTANT CANDIDATE ASSESSMENT ACCESS BAR
          ────────────────────────────────────────────────────────────── */}
          <div
            id="exam-launcher"
            className="pt-10 max-w-2xl mx-auto"
          >
            <div className="bg-[#0D1017] border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-emerald-400 to-indigo-500"></div>

              <div className="flex items-center justify-between mb-3 text-left">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    Candidate Exam Portal Launch
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  AI Proctoring Active
                </span>
              </div>

              <form onSubmit={handleLaunchExam} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Enter your Assessment Code or Slug (e.g. aa-2812)"
                  value={examCode}
                  onChange={(e) => {
                    setExamCode(e.target.value);
                    setLaunchError("");
                  }}
                  className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                />

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Launch Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {launchError && (
                <p className="text-rose-400 text-[11px] font-bold text-left mt-2">{launchError}</p>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5 mt-3">
                <span>Default Session: <button type="button" onClick={() => setExamCode("aa-2812")} className="text-blue-400 underline font-mono">aa-2812</button></span>
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> 60 Qs · 45 Mins · Automated Scoring
                </span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. PROOF STATS STRIP
          ────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-5xl mx-auto border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">30,000+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Validated Role Tests</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">80%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Recruiter Hours Saved</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Applicants Screened</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
              <div className="text-3xl sm:text-4xl font-black text-blue-400 font-mono">1 Platform</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Hiring to Continuous Development</div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. THE GREATCAMPUS ENGINE: ONE INTEGRATED TALENT JOURNEY
      ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/10 bg-[#080A0F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
              The GreatCampus Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              One Integrated Talent Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Continuous Loop Mode: ACTIVE · Connecting every stage from first candidate touchpoint to measurable employee mastery.
            </p>
          </div>

          {/* 5-Step Continuous Loop Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              {
                step: "STEP 01",
                name: "ASSESS",
                question: "Who can do the job?",
                desc: "Objective digital evaluation of aptitude, technical skills, and integrity.",
              },
              {
                step: "STEP 02",
                name: "INTERVIEW",
                question: "Who is the right fit?",
                desc: "Structured AI interviews evaluating situational logic and communication.",
              },
              {
                step: "STEP 03",
                name: "SELECT",
                question: "Who should we hire?",
                desc: "Data-driven, unbiased shortlisting based on aggregated performance metrics.",
              },
              {
                step: "STEP 04",
                name: "DEVELOP",
                question: "What to improve?",
                desc: "Convert identified candidate weaknesses into focused 5-minute microlearning.",
              },
              {
                step: "STEP 05",
                name: "REASSESS",
                question: "Has capability improved?",
                desc: "Verify learning transfer and skill growth with automated periodic retesting.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-black/50 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/30 transition"
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  {item.step}
                </span>
                <div className="text-lg font-black text-white tracking-tight">{item.name}</div>
                <div className="text-xs font-bold text-emerald-400 mt-1 mb-2">{item.question}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. THE CHALLENGE (Why traditional point solutions fail)
      ────────────────────────────────────────────────────────────── */}
      <section id="challenge" className="py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase text-rose-400 tracking-wider">
              The Challenge
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Hiring the right people is only the beginning.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Organizations today face three deeply connected talent hurdles that traditional point-solutions treat as completely separate silos:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0A0C11] border border-white/10 rounded-3xl p-7 space-y-4">
              <span className="text-2xl font-mono font-black text-slate-600">01</span>
              <h3 className="text-lg font-black text-white tracking-tight">
                How do we identify the right talent?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Resumes are embellished and unreliable. Keyword filters miss high-potential individuals while advancing candidates who lack actual practical capability for the job.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-rose-400 font-bold">
                Problem: Unstructured initial screening
              </div>
            </div>

            <div className="bg-[#0A0C11] border border-white/10 rounded-3xl p-7 space-y-4">
              <span className="text-2xl font-mono font-black text-slate-600">02</span>
              <h3 className="text-lg font-black text-white tracking-tight">
                How do we evaluate candidates consistently at scale?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                First-round phone interviews eat hundreds of recruiter hours. High applicant volume forces recruiters to interview only a fraction of applicants, introducing human fatigue and bias.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-rose-400 font-bold">
                Problem: Scaling interview workload
              </div>
            </div>

            <div className="bg-[#0A0C11] border border-white/10 rounded-3xl p-7 space-y-4">
              <span className="text-2xl font-mono font-black text-slate-600">03</span>
              <h3 className="text-lg font-black text-white tracking-tight">
                How do we develop people after they join?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recruitment data disappears the moment an offer letter is signed. L&D starts from zero with generic training seminars that fail to address the specific skill gaps identified during hiring.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-rose-400 font-bold">
                Problem: Broken post-hire development
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 via-slate-900 to-emerald-900/20 border border-white/15 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              The GreatCampus Solution
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
              GreatCampus brings all three together in one integrated platform. <br />
              <strong className="text-white">Assess → Interview → Develop → Reassess.</strong> A complete talent journey — powered by AI.
            </p>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-white text-black font-black text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              See the Platform in Action
            </button>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. THE THREE PILLARS (DEEP DIVE WITH LIVE SIMULATORS)
      ────────────────────────────────────────────────────────────── */}
      <section id="pillars" className="py-20 border-t border-white/10 bg-[#08090C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-20">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
              The Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Our Three Pillars
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Engineered to operate independently or as one continuous talent pipeline.
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────────
              PILLAR 01: ASSESS
          ────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono uppercase text-blue-400 tracking-wider font-bold">
                01 · ASSESS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Know what your candidates and employees can do.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Go beyond CVs and basic screening. GreatCampus enables organizations to conduct structured digital assessments that measure the capabilities that matter for a role.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  "Numerical Ability",
                  "Logical & Analytical Reasoning",
                  "Verbal Ability",
                  "Data Interpretation",
                  "Technical Domain Skills",
                  "Automated Scoring Engine",
                ].map((tag, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold block">
                  AI-POWERED PROCTORING
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Make online assessments trustworthy. Where required, AI-powered proctoring strengthens integrity through real-time candidate monitoring, facial detection, and tab-switch tracking.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => router.push("/aa-2812")}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  Explore AI Assessments →
                </button>
              </div>
            </div>

            {/* LIVE ASSESSMENT CANDIDATE VIEW SIMULATOR CARD */}
            <div className="lg:col-span-6">
              <div className="bg-[#0D1016] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5 font-mono text-xs">
                
                {/* Simulator Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] uppercase text-emerald-400 font-bold">
                      LIVE ASSESSMENT CANDIDATE VIEW
                    </span>
                    <div className="text-white font-bold text-xs">Question 14 of 40</div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Time remaining: 18:45</span>
                  </div>
                </div>

                {/* Question */}
                <div className="space-y-3 font-sans">
                  <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">
                    Category: Analytical Problem Solving
                  </span>
                  <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                    &quot;If a B2B sales pipeline conversion rate drops from 18% to 12% following a pricing tier restructure, which secondary metric reveals whether the issue stems from lead quality or closing friction?&quot;
                  </p>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2 font-sans">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs flex items-center justify-between">
                    <span>A. Total inbound lead volume</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20"></span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/50 text-white text-xs flex items-center justify-between font-bold">
                    <span>B. Demo-to-Proposal stage drop-off velocity</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-emerald-400 flex items-center justify-center text-[10px] text-black">✓</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs flex items-center justify-between">
                    <span>C. Average invoice payment delay</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20"></span>
                  </div>
                </div>

                {/* Proctoring HUD */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-[10px] font-mono">
                  <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center">
                    <div className="text-slate-400">Webcam Feed</div>
                    <div className="text-emerald-400 font-bold flex items-center justify-center gap-1 mt-0.5">
                      <Camera className="w-2.5 h-2.5" /> 1 Face Detected
                    </div>
                  </div>

                  <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center">
                    <div className="text-slate-400">Tab Focus</div>
                    <div className="text-emerald-400 font-bold mt-0.5">0 Switches</div>
                  </div>

                  <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center">
                    <div className="text-slate-400">Integrity Index</div>
                    <div className="text-emerald-400 font-bold mt-0.5">99.8% Clean</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────
              PILLAR 02: INTERVIEW
          ────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-10">
            
            {/* AI INTERVIEW SCORECARD SIMULATOR CARD */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="bg-[#0D1016] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5 text-xs">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                      AI INTERVIEW SCORECARD
                    </span>
                    <div className="text-white font-bold text-sm">Role: Territory Sales Manager</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
                    RECOMMENDED (91/100)
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Communication & Executive Presence</span>
                      <span className="font-mono text-emerald-400">9.4 / 10</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-[94%] h-full bg-emerald-400"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Situational Objection Handling</span>
                      <span className="font-mono text-emerald-400">8.8 / 10</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-[88%] h-full bg-emerald-400"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Role-specific Product Reasoning</span>
                      <span className="font-mono text-emerald-400">9.0 / 10</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-[90%] h-full bg-emerald-400"></div>
                    </div>
                  </div>
                </div>

                {/* Key AI Observation Quote */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    Key AI Observation & Timestamp 06:14
                  </span>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    &quot;Candidate framed solution around client&apos;s OPEX savings without lowering prices. Demonstrated strong active listening during customer pushback.&quot;
                  </p>
                </div>

              </div>
            </div>

            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider font-bold">
                02 · INTERVIEW
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Interview more candidates. Spend human time where it matters.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                First-round interviews can consume enormous amounts of recruiter time — especially when hundreds or thousands of candidates apply. GreatCampus enables organizations to conduct AI-powered structured interviews at scale.
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-rose-400">FROM:</span> CV → Manual Screening → Manual Phone Tag
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <span className="text-emerald-400">TO:</span> Assessment → AI Interview → Structured Shortlist
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  Explore AI Interviews →
                </button>
              </div>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────
              PILLAR 03: DEVELOP
          ────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-10">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono uppercase text-teal-400 tracking-wider font-bold">
                03 · DEVELOP
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Don&apos;t stop at hiring. Build capability continuously.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Identifying a skill gap is only useful if you can do something about it. GreatCampus transforms identified assessment gaps into opportunities for continuous development through short, focused 5-minute microlearning.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  "Sales Objection Handling",
                  "Negotiation & Closing",
                  "Customer Service Empathy",
                  "Onboarding & Compliance",
                  "Continuous Learning Streaks",
                  "Automated 30-Day Reassessment",
                ].map((tag, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  Explore Microlearning →
                </button>
              </div>
            </div>

            {/* MICROLEARNING DAILY FEED SIMULATOR CARD */}
            <div className="lg:col-span-6">
              <div className="bg-[#0D1016] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5 text-xs">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">
                    MICROLEARNING DAILY FEED
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">3 min remaining</span>
                </div>

                <div className="space-y-2">
                  <div className="text-white font-bold text-sm">
                    The &quot;Feel-Felt-Found&quot; Objection Framework
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When a client pushes back on onboarding time, do not argue with the timeline. Acknowledge their urgency, share how a similar enterprise had the same concern, and demonstrate the 48-hour self-service data import.
                  </p>
                </div>

                {/* Interactive Daily Quiz */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">
                    Quiz: Which phrase builds highest trust?
                  </span>

                  <button
                    onClick={() => setQuizAnswer("correct")}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-between ${
                      quizAnswer === "correct"
                        ? "bg-emerald-500/10 border-emerald-500 text-white"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    <span>✓ &quot;I completely understand why 3 weeks feels long; let me show how...&quot;</span>
                    {quizAnswer === "correct" && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>

                  <button
                    onClick={() => setQuizAnswer("wrong")}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-between ${
                      quizAnswer === "wrong"
                        ? "bg-rose-500/10 border-rose-500 text-white"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    <span>✗ &quot;Actually, our onboarding is faster than all competitors.&quot;</span>
                    {quizAnswer === "wrong" && <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
                  <span className="text-emerald-400 font-bold">Streak: 12 days continuous</span>
                  <span>Next reassessment in 14 days</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. AUDIENCE SOLUTIONS
      ────────────────────────────────────────────────────────────── */}
      <section id="solutions" className="py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase text-blue-400 tracking-wider">
              Audience Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Built for the Complete Talent Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Tailored capabilities whether you hire thousands, run an agency, lead a campus, or build internal talent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Talent Acquisition Teams",
                tag: "High-Volume Hiring",
                impact: "3,000 applicants screened in 48 hours with zero recruiter phone tag.",
                items: ["Graduate Recruitment", "Role-Based Tests", "AI 1st-Round Interviews", "Automated Ranking"],
              },
              {
                title: "Staffing & Recruitment Agencies",
                tag: "Client Validation",
                impact: "Deliver audio-verified, score-backed candidate dossiers to enterprise clients.",
                items: ["Instant Candidate Links", "Candidate Audit Dossiers", "Agency API Integration", "White-Label Portals"],
              },
              {
                title: "Universities & Higher Ed",
                tag: "Campus Placement",
                impact: "Prepare graduating students with real corporate aptitude tests and mock AI screens.",
                items: ["Placement Drives", "Benchmark Reports", "Employability Scoring", "Corporate Cohorts"],
              },
              {
                title: "Learning & Development (L&D)",
                tag: "Workforce Capability",
                impact: "Carry interview weakness data into targeted, measurable 5-minute microlearning.",
                items: ["Skill Gap Audits", "Daily Framework Feeds", "Progress Tracking", "Periodic Reassessment"],
              },
            ].map((sol, i) => (
              <div
                key={i}
                className="bg-[#0A0C11] border border-white/10 rounded-3xl p-6 space-y-4 hover:border-white/20 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                    {sol.tag}
                  </span>
                  <h3 className="text-base font-black text-white tracking-tight">{sol.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sol.impact}</p>

                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    {sol.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <span className="w-1 h-1 rounded-full bg-white/40"></span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition cursor-pointer"
                >
                  Learn More →
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. MARKET COMPARISON: THE GREATCAMPUS DIFFERENCE
      ────────────────────────────────────────────────────────────── */}
      <section id="difference" className="py-20 border-t border-white/10 bg-[#08090C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
              Market Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              The GreatCampus Difference
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Most platforms solve one fragmented part of the talent problem. GreatCampus brings the complete journey together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Traditional Assessment Tools</span>
              <div className="text-sm font-black text-white">&quot;Can this person perform?&quot;</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tests basic cognitive knowledge or code syntax, but ignores conversational fit, empathy, and post-hire enablement.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Standalone Interview Tools</span>
              <div className="text-sm font-black text-white">&quot;Is this person the right fit?&quot;</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conducts one-way video or audio screens, but disconnected from candidate testing data and internal training.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Isolated Learning Platforms</span>
              <div className="text-sm font-black text-white">&quot;How can we develop this person?&quot;</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hosts catalog video courses, but doesn&apos;t know the employee&apos;s pre-hire baseline or specific interview weaknesses.
              </p>
            </div>

            {/* GREATCAMPUS UNIFIED LOOP */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-black border-2 border-emerald-500/60 shadow-xl space-y-3 relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-black uppercase tracking-wider">
                UNIFIED LOOP
              </div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-bold">GreatCampus Platform</span>
              <div className="text-sm font-black text-white">All Three in One Loop</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Can they perform? Are they the right fit? How can we continuously make them better? Connected baseline to post-hire capability.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. INTERACTIVE CONSULTATION / BOOK A DEMO FORM
      ────────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="bg-[#0A0D14] border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="text-center space-y-3 mb-8">
              <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
                Interactive Consultation
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ready to build a smarter talent journey?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Tell us your biggest challenge and let our senior talent architects configure your pipeline.
              </p>
            </div>

            {demoSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-black text-white">Demo Request Received!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Thank you, {demoForm.name || "partner"}. A GreatCampus talent architect will contact you within 24 hours at <strong>{demoForm.email}</strong>.
                </p>
                <button
                  onClick={() => setDemoSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition cursor-pointer"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ananya@company.com"
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91-9876543210"
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Organization / University Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Ltd"
                      value={demoForm.company}
                      onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Primary Need
                  </label>
                  <select
                    value={demoForm.challenge}
                    onChange={(e) => setDemoForm({ ...demoForm, challenge: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="Need to assess candidates">Need to assess candidates (Digital Aptitude & Proctoring)</option>
                    <option value="Need to interview at scale">Need to interview at scale (AI Structured Interviews)</option>
                    <option value="Need to develop workforce">Need to develop workforce (Post-Hire Microlearning)</option>
                    <option value="Need all three: Complete Talent Journey">Need all three (Complete Integrated Talent Journey)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-white hover:bg-slate-200 text-black font-black text-sm shadow-xl shadow-white/10 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Request Custom Implementation Plan</span>
                </button>
              </form>
            )}

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          12. COMPREHENSIVE FOOTER
      ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#050608] py-14 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand & Contact */}
            <div className="space-y-4">
              <div className="text-white font-black text-base tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white text-black font-black flex items-center justify-center text-xs">
                  GC
                </div>
                GreatCampus
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                AI-powered talent solutions to identify the right people, make better hiring decisions, and continuously develop talent.
              </p>
              <div className="space-y-1 text-[11px] font-mono">
                <div>Phone: <a href="tel:+918810418647" className="text-white hover:underline">+91-8810418647</a></div>
                <div>Email: <a href="mailto:contact@greatcampus.in" className="text-white hover:underline">contact@greatcampus.in</a></div>
              </div>
            </div>

            {/* Column 2: Pillars */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-white font-bold tracking-wider">The Pillars</span>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#pillars" className="hover:text-white transition">01 - ASSESS</a></li>
                <li><a href="#pillars" className="hover:text-white transition">02 - INTERVIEW</a></li>
                <li><a href="#pillars" className="hover:text-white transition">03 - DEVELOP</a></li>
                <li><a href="#difference" className="hover:text-white transition">The Difference</a></li>
                <li><a href="#comparison" className="hover:text-white transition">Pricing & ROI</a></li>
              </ul>
            </div>

            {/* Column 3: Lifecycle Solutions */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-white font-bold tracking-wider">Lifecycle Solutions</span>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#solutions" className="hover:text-white transition">Talent Acquisition</a></li>
                <li><a href="#solutions" className="hover:text-white transition">Staffing Agencies</a></li>
                <li><a href="#solutions" className="hover:text-white transition">Higher Education</a></li>
                <li><a href="#solutions" className="hover:text-white transition">Learning & Dev (L&D)</a></li>
              </ul>
            </div>

            {/* Column 4: Quick Portals */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-white font-bold tracking-wider">Platform Portals</span>
              <ul className="space-y-2 text-slate-400">
                <li><a href="http://localhost:3000/admin/login" className="hover:text-white transition flex items-center gap-1">Client Admin Portal <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="http://localhost:3002" className="hover:text-white transition flex items-center gap-1">Super Admin Portal <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="#exam-launcher" className="hover:text-white transition">Candidate Exam Link</a></li>
                <li><a href="http://localhost:4000/api/docs" className="hover:text-white transition flex items-center gap-1">Swagger API Docs <ExternalLink className="w-3 h-3" /></a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <div>
              © 2026 GreatCampus Technologies. All rights reserved. Monochrome High-Contrast Edition.
            </div>
            <div>
              Assess → Interview → Select → Develop → Reassess
            </div>
          </div>

        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          13. BOOK A DEMO MODAL POPUP
      ────────────────────────────────────────────────────────────── */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0D1016] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl text-slate-100">
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 mb-6">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                Schedule Direct Briefing
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">Book a GreatCampus Demo</h3>
              <p className="text-xs text-slate-400">
                Setup takes under 24 hours. Includes dedicated onboarding with senior talent architects.
              </p>
            </div>

            {demoSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">We&apos;ve reserved your briefing!</h4>
                <p className="text-xs text-slate-300">
                  We&apos;ll be in touch with you shortly.
                </p>
                <button
                  onClick={() => {
                    setDemoSubmitted(false);
                    setIsDemoModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-white"
                    placeholder="Ananya Sharma"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={demoForm.email}
                    onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                    className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-white"
                    placeholder="ananya@company.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={demoForm.phone}
                    onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                    className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-white font-mono"
                    placeholder="+91-8810418647"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Primary Challenge</label>
                  <select
                    value={demoForm.challenge}
                    onChange={(e) => setDemoForm({ ...demoForm, challenge: e.target.value })}
                    className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="Need to assess candidates">Assess Candidates at Scale</option>
                    <option value="Need to interview at scale">Automate 1st-Round AI Interviews</option>
                    <option value="Need to develop workforce">Post-Hire Continuous Microlearning</option>
                    <option value="Need all three: Complete Talent Journey">Complete Talent Journey</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 font-bold hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-white text-black font-black hover:bg-slate-200 transition cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
