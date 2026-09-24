"use client";

import { use, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import CameraProctor from "@/components/CameraProctor";
import PreExamCameraCheck from "@/components/PreExamCameraCheck";
import ExamLaunchWizardModal from "@/components/ExamLaunchWizardModal";
import "../exam/exam.css";
import { User, Mail, Phone, Hash, ArrowRight, BookOpen, AlertTriangle, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

interface AssessmentOption {
  id: string;
  name: string;
  description: string;
}

function AssessmentContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [formData, setFormData] = useState({
    applicationId: "",
    name: "",
    email: "",
    phone: "",
    referenceId: "",
  });
  const [cameraVerified, setCameraVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLaunchWizard, setShowLaunchWizard] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [isAssessmentExpired, setIsAssessmentExpired] = useState<boolean>(false);
  const [isAssessmentNotStarted, setIsAssessmentNotStarted] = useState<boolean>(false);

  useEffect(() => {
    async function loadAssessmentAndToken() {
      try {
        const baseUrl = getApiBaseUrl();

        // If secure assignment token is present in URL
        if (token) {
          setVerifyingToken(true);
          try {
            const tokenRes = await fetch(`${baseUrl}/api/v1/candidates/verify-token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            const tokenData = await tokenRes.json();
            if (tokenData.success && tokenData.candidate) {
              setTokenVerified(true);
              setFormData({
                name: tokenData.candidate.name || "",
                email: tokenData.candidate.email || "",
                phone: tokenData.candidate.phone || "",
                applicationId: tokenData.candidate.applicationId || tokenData.candidate.referenceId || "",
                referenceId: tokenData.candidate.referenceId || "",
              });
              if (tokenData.assessment) {
                setActiveAssessment(tokenData.assessment);
                setSelectedAssessmentId(tokenData.assessment.id);
              }
              if (tokenData.isCompleted) {
                setIsCompleted(true);
              }
              setVerifyingToken(false);
              return;
            } else if (tokenData.code === "EXPIRED") {
              setIsAssessmentExpired(true);
              setError(tokenData.message || "This assessment session link has expired.");
              setVerifyingToken(false);
              return;
            } else if (tokenData.code === "UPCOMING") {
              setIsAssessmentNotStarted(true);
              setError(tokenData.message || "This assessment session has not started yet.");
              setVerifyingToken(false);
              return;
            }
          } catch {
            /* continue to regular load */
          } finally {
            setVerifyingToken(false);
          }
        }

        // Regular slug lookup
        if (slug) {
          const res = await fetch(`${baseUrl}/api/v1/candidates/assessments/details/${slug}`);
          const data = await res.json();
          if (data.success && data.assessment) {
            setActiveAssessment(data.assessment);
            setSelectedAssessmentId(data.assessment.id);
            if (data.assessment.isExpired) {
              setIsAssessmentExpired(true);
              setError("This assessment session link is no longer active or has expired. Please contact your HR Administrator for a valid link.");
            } else if (data.assessment.isNotStarted) {
              setIsAssessmentNotStarted(true);
              const fromTime = data.assessment.activeFrom
                ? new Date(data.assessment.activeFrom).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                : "a scheduled time";
              setError(`This assessment session hasn't started yet. It will be accessible from ${fromTime}.`);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load target assessment details:", err);
      }
    }
    loadAssessmentAndToken();
  }, [slug, token]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    if (!formData.name || !formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const baseUrl = getApiBaseUrl();

      const res = await fetch(`${baseUrl}/api/v1/candidates/verify-and-start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: formData.applicationId || undefined,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          assessmentId: selectedAssessmentId || slug,
        }),
      });

      const data = await res.json();

      if (data.success && data.candidate) {
        localStorage.setItem(
          "banca_candidate",
          JSON.stringify({
            ...data.candidate,
            tenant: data.tenant || activeAssessment?.tenant || null,
          })
        );
        if (data.questions) {
          localStorage.setItem("banca_exam_session", JSON.stringify(data));
        }
        router.push("/exam/test");
      } else {
        // STRICT REJECTION: Display authorized error message, DO NOT BYPASS!
        setError(
          data.message ||
          `Access Denied: The email '${formData.email}' is not assigned to this assessment session. Please contact your HR Administrator to be invited.`
        );
      }
    } catch (err: any) {
      setError(err.message || "Unable to connect to Assessment Server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bannerBg = activeAssessment?.tenant?.primaryColor
    ? `linear-gradient(135deg, ${activeAssessment.tenant.primaryColor}, #0284C7)`
    : "linear-gradient(135deg, #003F72, #00AEEF)";

  return (
    <div style={{ minHeight: "100dvh", background: "#F5F5F7", display: "flex", flexDirection: "column" }}>
      <Navbar
        mode="public"
        logoUrl={activeAssessment?.tenant?.logoUrl}
        tenantName={activeAssessment?.tenant?.name}
        portalTitle={activeAssessment?.tenant?.portalTitle}
        primaryColor={activeAssessment?.tenant?.primaryColor}
      />

      <main style={{ flex: 1, padding: "clamp(20px, 4vw, 48px) 16px 56px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: "100%",
          maxWidth: "840px",
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderRadius: "28px",
          border: "1px solid rgba(0, 0, 0, 0.07)",
          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
          overflow: "hidden"
        }}>
          {/* Header Card — Pure Black Apple Accent */}
          <div style={{ background: "#000000", padding: "32px 36px", color: "#FFFFFF" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.12)", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "12px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
              <BookOpen size={12} /> OFFICIAL ASSESSMENT SESSION
            </div>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 900, marginBottom: "8px", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              {activeAssessment?.name || (activeAssessment?.tenant?.name ? `${activeAssessment.tenant.name} Assessment` : "Talent Assessment Session")}
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.72)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              {activeAssessment?.description || "Enter your Application ID to begin candidate verification & proctored assessment"}
            </p>
          </div>

          <div style={{ padding: "clamp(24px, 4vw, 40px)" }}>
            {error && (
              <div style={{ background: "#FAFAFA", border: "1px solid #E4E4E7", borderRadius: "14px", padding: "14px 18px", color: "#000000", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#000000", flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {tokenVerified && (
              <div style={{ background: "#F4F4F5", border: "1px solid #E4E4E7", borderRadius: "14px", padding: "12px 18px", color: "#000000", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <ShieldCheck size={18} color="#000000" />
                <span>Authenticated Candidate Record: Details are verified and locked to prevent discrepancy.</span>
              </div>
            )}

            <form onSubmit={handleStart} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#71717A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Application / Enrolment ID <span style={{ fontWeight: 500, color: "#A1A1AA" }}>(Optional)</span> {tokenVerified && <span style={{ color: "#000000", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "3px" }}><CheckCircle2 size={11} /> (Verified)</span>}
                </label>
                <div style={{ position: "relative" }}>
                  <Hash size={16} color="#71717A" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    readOnly={tokenVerified}
                    placeholder="e.g. BMU-CCE/2026/Udaan/111111 (or leave blank to auto-generate)"
                    value={formData.applicationId}
                    onChange={(e) => !tokenVerified && setFormData({ ...formData, applicationId: e.target.value })}
                    disabled={isAssessmentExpired || isAssessmentNotStarted}
                    style={{
                      width: "100%",
                      padding: "13px 14px 13px 42px",
                      borderRadius: "14px",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#000000",
                      background: tokenVerified ? "#F4F4F5" : "#FFFFFF",
                      cursor: tokenVerified ? "default" : "text",
                      outline: "none",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#71717A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Candidate Name * {tokenVerified && <span style={{ color: "#000000", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "3px" }}><CheckCircle2 size={11} /> (Verified)</span>}
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} color="#71717A" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      required
                      readOnly={tokenVerified}
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => !tokenVerified && setFormData({ ...formData, name: e.target.value })}
                      disabled={isAssessmentExpired || isAssessmentNotStarted}
                      style={{
                        width: "100%",
                        padding: "13px 14px 13px 42px",
                        borderRadius: "14px",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        background: tokenVerified ? "#F4F4F5" : "#FFFFFF",
                        cursor: tokenVerified ? "default" : "text",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#71717A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Email Address * {tokenVerified && <span style={{ color: "#000000", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "3px" }}><CheckCircle2 size={11} /> (Verified)</span>}
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} color="#71717A" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="email"
                      required
                      readOnly={tokenVerified}
                      placeholder="candidate@example.com"
                      value={formData.email}
                      onChange={(e) => !tokenVerified && setFormData({ ...formData, email: e.target.value })}
                      disabled={isAssessmentExpired || isAssessmentNotStarted}
                      style={{
                        width: "100%",
                        padding: "13px 14px 13px 42px",
                        borderRadius: "14px",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        background: tokenVerified ? "#F4F4F5" : "#FFFFFF",
                        cursor: tokenVerified ? "default" : "text",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#71717A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Phone Number * {tokenVerified && <span style={{ color: "#000000", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "3px" }}><CheckCircle2 size={11} /> (Verified)</span>}
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} color="#71717A" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="tel"
                      required
                      readOnly={tokenVerified}
                      placeholder="Mobile Number"
                      value={formData.phone}
                      onChange={(e) => !tokenVerified && setFormData({ ...formData, phone: e.target.value })}
                      disabled={isAssessmentExpired || isAssessmentNotStarted}
                      style={{
                        width: "100%",
                        padding: "13px 14px 13px 42px",
                        borderRadius: "14px",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        background: tokenVerified ? "#F4F4F5" : "#FFFFFF",
                        cursor: tokenVerified ? "default" : "text",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Live Pre-Exam Device & Camera Verification Card */}
              <PreExamCameraCheck
                brandColor="#000000"
                onStatusChange={(ready) => setCameraVerified(ready)}
              />

              <div style={{ marginTop: "12px", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={loading || isAssessmentExpired || isAssessmentNotStarted}
                  style={{
                    padding: "14px 34px",
                    borderRadius: "14px",
                    background: isAssessmentExpired || isAssessmentNotStarted
                      ? "#A1A1AA"
                      : "#000000",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "15px",
                    letterSpacing: "-0.01em",
                    border: "none",
                    cursor: isAssessmentExpired || isAssessmentNotStarted ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease"
                  }}
                >
                  {loading ? "Verifying..." : "Start Assessment"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {activeAssessment && (
          <ExamLaunchWizardModal
            isOpen={showLaunchWizard}
            onClose={() => setShowLaunchWizard(false)}
            candidate={{
              name: formData.name,
              email: formData.email,
              applicationId: formData.applicationId,
            }}
            assessment={activeAssessment}
          />
        )}
      </main>
    </div>
  );
}

export default function DynamicAssessmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Loading Assessment Session...</div>}>
      <AssessmentContent slug={resolvedParams.slug} />
    </Suspense>
  );
}

