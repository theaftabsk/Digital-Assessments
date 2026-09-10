"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "../exam.css";
import { CheckCircle2, ShieldCheck, Home, Clock, MailCheck } from "lucide-react";

export default function CandidateThankYou() {
  const [tenant, setTenant] = useState<{
    name: string;
    logoUrl: string | null;
    portalTitle: string;
    primaryColor: string;
  }>({
    name: "Talent Assessment",
    logoUrl: null,
    portalTitle: "Candidate Evaluation",
    primaryColor: "#003F72",
  });

  const [candidateName, setCandidateName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("banca_candidate");
      if (stored) {
        const cand = JSON.parse(stored);
        if (cand.name) setCandidateName(cand.name);
        if (cand.tenant) {
          setTenant({
            name: cand.tenant.name || "Client Organization",
            logoUrl: cand.tenant.logoUrl || null,
            portalTitle: cand.tenant.portalTitle || `${cand.tenant.name} Assessment Portal`,
            primaryColor: cand.tenant.primaryColor || "#003F72",
          });
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const monogram = tenant.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "TA";

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg, #E8F6FD 0%, #F4FAFF 50%, #FFF8EE 100%)",
      }}
    >
      <Navbar
        mode="public"
        logoUrl={tenant.logoUrl}
        tenantName={tenant.name}
        portalTitle={tenant.portalTitle}
        primaryColor={tenant.primaryColor}
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px 48px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "540px",
            background: "white",
            borderRadius: "28px",
            border: "1.5px solid #C8E8F8",
            boxShadow: "0 12px 40px rgba(0,63,114,0.13)",
            overflow: "hidden",
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              background: tenant.primaryColor
                ? `linear-gradient(135deg, ${tenant.primaryColor}, #0284C7)`
                : "linear-gradient(135deg, #003F72, #00AEEF)",
              height: "6px",
            }}
          />

          <div style={{ padding: "clamp(28px,7vw,48px) clamp(20px,6vw,40px)", textAlign: "center" }}>
            {/* Dynamic White-Label Logo or Monogram */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
              {tenant.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  style={{
                    height: "clamp(48px, 9vw, 68px)",
                    width: "auto",
                    maxWidth: "200px",
                    borderRadius: "12px",
                    objectFit: "contain",
                    padding: "4px",
                    border: "1px solid #E2E8F0",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "18px",
                    backgroundColor: tenant.primaryColor,
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: 900,
                    boxShadow: "0 6px 20px rgba(0, 63, 114, 0.2)",
                  }}
                >
                  {monogram}
                </div>
              )}
            </div>

            {/* Success Icon */}
            <div
              style={{
                width: "72px",
                height: "72px",
                background: "linear-gradient(135deg, #DCFCE7, #BBF7D0)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 6px 20px rgba(22,163,74,0.2)",
              }}
            >
              <CheckCircle2 size={36} color="#16A34A" />
            </div>

            <h1
              style={{
                fontSize: "clamp(20px, 5vw, 26px)",
                fontWeight: 900,
                color: "#1A2B40",
                lineHeight: 1.25,
                marginBottom: "12px",
              }}
            >
              Assessment Submitted Successfully!
            </h1>

            <p
              style={{
                fontSize: "clamp(13px, 3vw, 15px)",
                color: "#4A6580",
                lineHeight: 1.7,
                maxWidth: "420px",
                margin: "0 auto 28px",
              }}
            >
              Thank you {candidateName ? <strong style={{ color: "#0F172A" }}>{candidateName}</strong> : "Candidate"} for completing your official assessment for{" "}
              <strong style={{ color: tenant.primaryColor }}>
                {tenant.name}
              </strong>
              . Your answers and automated proctoring verification logs have been securely submitted to the Talent Acquisition committee.
            </p>

            {/* What Happens Next Card */}
            <div
              style={{
                background: "#F0F8FF",
                border: "1.5px solid #B3E0F9",
                borderRadius: "16px",
                padding: "18px 20px",
                textAlign: "left",
                marginBottom: "28px",
              }}
            >
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <ShieldCheck size={22} color="#0284C7" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginBottom: "4px" }}>
                    What Happens Next?
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.6 }}>
                    Your assessment scores, competency analysis, and integrity verification report will be evaluated by the recruitment team. You will be notified regarding the next round of interviews via your registered email.
                  </div>
                </div>
              </div>
            </div>

            {/* Session Security Sign-off */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#64748B",
                marginBottom: "24px",
              }}
            >
              <MailCheck size={16} color="#16A34A" />
              <span>Confirmation receipt sent to your registered email</span>
            </div>

            {/* Return to Home / Close Window */}
            <div>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 28px",
                  borderRadius: "14px",
                  background: tenant.primaryColor,
                  color: "white",
                  fontWeight: 800,
                  fontSize: "13px",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(0,63,114,0.2)",
                  transition: "opacity 0.2s",
                }}
              >
                <Home size={16} />
                <span>Return to Portal Home</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
