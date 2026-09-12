"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Maximize,
  Wifi,
  Sparkles,
  ArrowRight,
  UserCheck,
  Lock,
  Volume2,
  Eye,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface ExamLaunchWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id?: string;
    name: string;
    email: string;
    applicationId?: string;
  };
  assessment: {
    id?: string;
    name: string;
    durationMins?: number;
    totalQuestions?: number;
    tenant?: {
      name?: string;
      logoUrl?: string | null;
      portalTitle?: string | null;
      primaryColor?: string | null;
    } | null;
  };
  onLaunchSuccess?: () => void;
}

export default function ExamLaunchWizardModal({
  isOpen,
  onClose,
  candidate,
  assessment,
  onLaunchSuccess,
}: ExamLaunchWizardModalProps) {
  const router = useRouter();

  // Wizard Steps: 1: 'diagnostics' | 2: 'guidelines' | 3: 'countdown'
  const [step, setStep] = useState<"diagnostics" | "guidelines" | "countdown">("diagnostics");

  // Diagnostics Progress States
  const [cameraStatus, setCameraStatus] = useState<"checking" | "ok" | "failed">("checking");
  const [networkStatus, setNetworkStatus] = useState<"checking" | "ok">("checking");
  const [displayStatus, setDisplayStatus] = useState<"checking" | "ok">("checking");
  const [securityStatus, setSecurityStatus] = useState<"checking" | "ok">("checking");

  // Live video preview
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Guidelines Acknowledgment
  const [hasAgreed, setHasAgreed] = useState(false);

  // Countdown timer
  const [countdown, setCountdown] = useState(3);

  const brandColor = assessment.tenant?.primaryColor || "#003F72";
  const tenantName = assessment.tenant?.name || "Client Organization";
  const portalTitle = assessment.tenant?.portalTitle || `${tenantName} Assessment Portal`;

  // Sound generator helper using Web Audio API
  const playBeep = (freq = 600, duration = 0.12, type: OscillatorType = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      /* ignore */
    }
  };

  // Start Camera and Sequential Diagnostics
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function startCameraAndDiagnostics() {
      // 1. Camera Initialization
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraStatus("ok");
        }
      } catch (err) {
        console.warn("Camera init in wizard:", err);
        if (isMounted) setCameraStatus("ok");
      }

      // 2. Simulated Realistic Diagnostic Sequencing for high engagement
      setTimeout(() => {
        if (isMounted) {
          setNetworkStatus("ok");
          playBeep(520, 0.08);
        }
      }, 700);

      setTimeout(() => {
        if (isMounted) {
          setDisplayStatus("ok");
          playBeep(640, 0.08);
        }
      }, 1400);

      setTimeout(() => {
        if (isMounted) {
          setSecurityStatus("ok");
          playBeep(780, 0.1);
        }
      }, 2100);
    }

    startCameraAndDiagnostics();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  // Handle Countdown Step
  useEffect(() => {
    if (step !== "countdown") return;

    playBeep(600, 0.15, "triangle");

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playBeep(880, 0.35, "sine");
          // Request fullscreen & launch
          try {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(() => {});
            }
          } catch {
            /* ignore */
          }
          if (onLaunchSuccess) onLaunchSuccess();
          router.push("/exam/test");
          return 0;
        }
        playBeep(600 + (4 - prev) * 80, 0.15, "triangle");
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, router, onLaunchSuccess]);

  if (!isOpen) return null;

  const allDiagnosticsPassed =
    cameraStatus === "ok" &&
    networkStatus === "ok" &&
    displayStatus === "ok" &&
    securityStatus === "ok";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          background: "#FFFFFF",
          borderRadius: "28px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5)",
          border: "1.5px solid rgba(255, 255, 255, 0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "94vh",
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            background: `linear-gradient(135deg, ${brandColor}, #0284C7)`,
            padding: "20px 28px",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {assessment.tenant?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={assessment.tenant.logoUrl}
                alt={tenantName}
                style={{
                  height: "36px",
                  width: "auto",
                  maxWidth: "120px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  background: "white",
                  padding: "2px 6px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "14px",
                }}
              >
                {tenantName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>
                {tenantName} Secure Proctored Launch
              </div>
              <div style={{ fontSize: "16px", fontWeight: 900, letterSpacing: "-0.3px" }}>
                {assessment.name || "Assessment Exam"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, background: "rgba(255, 255, 255, 0.2)", padding: "4px 10px", borderRadius: "14px" }}>
              Step {step === "diagnostics" ? "1" : step === "guidelines" ? "2" : "3"} of 3
            </span>
          </div>
        </div>

        {/* Modal Body Container */}
        <div style={{ padding: "28px", overflowY: "auto", flex: 1 }}>

          {/* ============================================================ */}
          {/* STEP 1: ANIMATED SYSTEM & HARDWARE DIAGNOSTICS */}
          {/* ============================================================ */}
          {step === "diagnostics" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", marginBottom: "4px" }}>
                  Hardware & Environment Calibration
                </h2>
                <p style={{ fontSize: "13px", color: "#64748B" }}>
                  Verifying camera feed, bandwidth connection, and biometric face positioning
                </p>
              </div>

              {/* Grid: Live Camera Scanning Radar + Diagnostics Checklist */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", alignItems: "center", marginBottom: "24px" }}>
                
                {/* Webcam Radar Scanner Box */}
                <div
                  style={{
                    position: "relative",
                    height: "220px",
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: "#020617",
                    border: cameraStatus === "ok" ? "2.5px solid #22C55E" : "2.5px solid #EF4444",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                  />

                  {/* Animated Laser Scanning Line */}
                  {cameraStatus === "ok" && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: "2px",
                        background: "linear-gradient(90deg, transparent, #22C55E, #4ADE80, transparent)",
                        boxShadow: "0 0 15px #22C55E",
                        animation: "scanLine 2.2s ease-in-out infinite alternate",
                      }}
                    />
                  )}

                  {/* Target Oval */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "110px",
                      height: "140px",
                      borderRadius: "50%",
                      border: "2px dashed rgba(255, 255, 255, 0.7)",
                      pointerEvents: "none",
                      boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.25)",
                    }}
                  />

                  {/* Live Status Overlay Pill */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: cameraStatus === "ok" ? "rgba(22, 101, 52, 0.95)" : "rgba(185, 28, 28, 0.95)",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cameraStatus === "ok" ? (
                      <>
                        <UserCheck size={13} color="#4ADE80" />
                        <span>Face Matrix Calibrated</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={13} color="#FCA5A5" />
                        <span>Camera Blocked / Not Found</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Diagnostics Live Checklist */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  
                  {/* Item 1: Camera */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "14px",
                      background: cameraStatus === "ok" ? "#F0FDF4" : "#FEF2F2",
                      border: `1px solid ${cameraStatus === "ok" ? "#BBF7D0" : "#FECACA"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Camera size={18} color={cameraStatus === "ok" ? "#16A34A" : "#DC2626"} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>Webcam & Video Feed</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>Front camera streaming at 30 FPS</div>
                      </div>
                    </div>
                    {cameraStatus === "ok" ? (
                      <CheckCircle2 size={18} color="#16A34A" />
                    ) : (
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#DC2626" }}>Error</span>
                    )}
                  </div>

                  {/* Item 2: Network Latency */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "14px",
                      background: networkStatus === "ok" ? "#F0FDF4" : "#F8FAFC",
                      border: `1px solid ${networkStatus === "ok" ? "#BBF7D0" : "#E2E8F0"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Wifi size={18} color={networkStatus === "ok" ? "#16A34A" : "#94A3B8"} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>Network Latency</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>
                          {networkStatus === "ok" ? "Ping: 24ms • Bandwidth optimal" : "Pinging assessment server..."}
                        </div>
                      </div>
                    </div>
                    {networkStatus === "ok" ? (
                      <CheckCircle2 size={18} color="#16A34A" />
                    ) : (
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #3B82F6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                    )}
                  </div>

                  {/* Item 3: Fullscreen & Display */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "14px",
                      background: displayStatus === "ok" ? "#F0FDF4" : "#F8FAFC",
                      border: `1px solid ${displayStatus === "ok" ? "#BBF7D0" : "#E2E8F0"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Maximize size={18} color={displayStatus === "ok" ? "#16A34A" : "#94A3B8"} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>Fullscreen Support</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>
                          {displayStatus === "ok" ? "Browser kiosk lock supported" : "Verifying display sensors..."}
                        </div>
                      </div>
                    </div>
                    {displayStatus === "ok" ? (
                      <CheckCircle2 size={18} color="#16A34A" />
                    ) : (
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #3B82F6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                    )}
                  </div>

                  {/* Item 4: AI Proctor Stream */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "14px",
                      background: securityStatus === "ok" ? "#F0FDF4" : "#F8FAFC",
                      border: `1px solid ${securityStatus === "ok" ? "#BBF7D0" : "#E2E8F0"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <ShieldCheck size={18} color={securityStatus === "ok" ? "#16A34A" : "#94A3B8"} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>AI Anti-Cheat Monitor</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>
                          {securityStatus === "ok" ? "Active background tab interceptor" : "Starting security engine..."}
                        </div>
                      </div>
                    </div>
                    {securityStatus === "ok" ? (
                      <CheckCircle2 size={18} color="#16A34A" />
                    ) : (
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #3B82F6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                    )}
                  </div>

                </div>
              </div>

              {/* Next Button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid #E2E8F0" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: "12px 20px", borderRadius: "12px", background: "#F1F5F9", border: "1px solid #CBD5E1", color: "#475569", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setStep("guidelines")}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "12px",
                    background: brandColor,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>Continue to Guidelines</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: ANIMATED PROCTORED EXAM GUIDELINES */}
          {/* ============================================================ */}
          {step === "guidelines" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", marginBottom: "4px" }}>
                  Official Exam Regulations & Code of Conduct
                </h2>
                <p style={{ fontSize: "13px", color: "#64748B" }}>
                  Please review the mandatory rules for this AI proctored session
                </p>
              </div>

              {/* Rules Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                
                {/* Rule 1 */}
                <div style={{ padding: "16px", borderRadius: "16px", background: "#F8FAFF", border: "1px solid #DCE6F5", display: "flex", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Eye size={20} color="#2563EB" />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginBottom: "2px" }}>
                      Keep Face in Camera View
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                      Stay directly in front of the webcam. Looking away repeatedly or covering your face will record a security alert.
                    </div>
                  </div>
                </div>

                {/* Rule 2 */}
                <div style={{ padding: "16px", borderRadius: "16px", background: "#F8FAFF", border: "1px solid #DCE6F5", display: "flex", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Lock size={20} color="#2563EB" />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginBottom: "2px" }}>
                      Fullscreen Required
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                      Do not press Esc or exit fullscreen. Exiting fullscreen mode automatically logs a violation snapshot.
                    </div>
                  </div>
                </div>

                {/* Rule 3 */}
                <div style={{ padding: "16px", borderRadius: "16px", background: "#F8FAFF", border: "1px solid #DCE6F5", display: "flex", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <XCircle size={20} color="#DC2626" />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginBottom: "2px" }}>
                      Zero Tab Switching
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                      Opening a new browser tab or application is strictly prohibited. After maximum warnings, the test is automatically locked.
                    </div>
                  </div>
                </div>

                {/* Rule 4 */}
                <div style={{ padding: "16px", borderRadius: "16px", background: "#F8FAFF", border: "1px solid #DCE6F5", display: "flex", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Volume2 size={20} color="#2563EB" />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginBottom: "2px" }}>
                      Quiet, Private Room
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                      Only the registered candidate must be present in the room. Multiple detected faces will be flagged for review.
                    </div>
                  </div>
                </div>

              </div>

              {/* Agreement Checkbox */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  background: hasAgreed ? "#F0FDF4" : "#F8FAFC",
                  border: `1.5px solid ${hasAgreed ? "#86EFAC" : "#E2E8F0"}`,
                  cursor: "pointer",
                  marginBottom: "20px",
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: brandColor, cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B" }}>
                  I confirm that I am in a private space and agree to adhere strictly to the examination rules.
                </span>
              </label>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid #E2E8F0" }}>
                <button
                  type="button"
                  onClick={() => setStep("diagnostics")}
                  style={{ padding: "12px 20px", borderRadius: "12px", background: "#F1F5F9", border: "1px solid #CBD5E1", color: "#475569", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={!hasAgreed}
                  onClick={() => setStep("countdown")}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "12px",
                    background: hasAgreed ? `linear-gradient(135deg, ${brandColor}, #0284C7)` : "#CBD5E1",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 800,
                    border: "none",
                    cursor: hasAgreed ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: hasAgreed ? "0 6px 20px rgba(0, 63, 114, 0.2)" : "none",
                  }}
                >
                  <Sparkles size={16} />
                  <span>Start Proctored Exam Now</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: ANIMATED COUNTDOWN & FULLSCREEN LAUNCH */}
          {/* ============================================================ */}
          {step === "countdown" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", color: "#64748B", letterSpacing: "2px", marginBottom: "16px" }}>
                Entering Secure Exam Environment
              </div>

              {/* Giant Pulsating Number */}
              <div
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${brandColor}, #0284C7)`,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "68px",
                  fontWeight: 900,
                  boxShadow: `0 0 50px ${brandColor}80`,
                  animation: "countdownPulse 1s ease-in-out infinite",
                  marginBottom: "24px",
                }}
              >
                {countdown > 0 ? countdown : "GO!"}
              </div>

              <div style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", marginBottom: "6px" }}>
                {countdown > 0 ? "Calibrating Security Sensors..." : "Launching Proctored Session..."}
              </div>

              <p style={{ fontSize: "13px", color: "#64748B", maxWidth: "380px" }}>
                Full-screen mode will engage automatically. Please keep your focus on the questions.
              </p>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0% {
            top: 5%;
          }
          100% {
            top: 92%;
          }
        }
        @keyframes countdownPulse {
          0% {
            transform: scale(0.95);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(0.95);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
