"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, User } from "lucide-react";

interface NavbarProps {
  mode?: "public" | "candidate";
  candidateName?: string;
  logoUrl?: string | null;
  tenantName?: string;
  portalTitle?: string;
  primaryColor?: string;
}

export default function Navbar({
  mode = "public",
  candidateName: propCandidateName,
  logoUrl: propLogoUrl,
  tenantName: propTenantName,
  portalTitle: propPortalTitle,
  primaryColor: propPrimaryColor,
}: NavbarProps) {
  const [tenant, setTenant] = useState<{
    name: string;
    logoUrl: string | null;
    portalTitle: string;
    primaryColor: string;
  }>({
    name: propTenantName || "GreatCampus",
    logoUrl: propLogoUrl || null,
    portalTitle: propPortalTitle || "Talent Assessment Portal",
    primaryColor: propPrimaryColor || "#003F72",
  });

  const [candidateName, setCandidateName] = useState<string>(propCandidateName || "");

  // Hydrate from localStorage if props are not explicitly supplied
  useEffect(() => {
    if (propTenantName || propLogoUrl || propPortalTitle) {
      setTenant({
        name: propTenantName || "GreatCampus",
        logoUrl: propLogoUrl || null,
        portalTitle: propPortalTitle || `${propTenantName || "Talent"} Assessment Portal`,
        primaryColor: propPrimaryColor || "#003F72",
      });
    } else {
      try {
        const storedCandidate = localStorage.getItem("banca_candidate");
        if (storedCandidate) {
          const cand = JSON.parse(storedCandidate);
          if (cand.name && !propCandidateName) {
            setCandidateName(cand.name);
          }
          if (cand.tenant) {
            setTenant({
              name: cand.tenant.name || "Client Organization",
              logoUrl: cand.tenant.logoUrl || null,
              portalTitle: cand.tenant.portalTitle || `${cand.tenant.name || "Talent"} Assessment Portal`,
              primaryColor: cand.tenant.primaryColor || "#003F72",
            });
          }
        }
      } catch {
        /* ignore */
      }
    }
  }, [propTenantName, propLogoUrl, propPortalTitle, propPrimaryColor, propCandidateName]);

  const monogram = tenant.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GC";

  return (
    <header
      className="nb-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        background: "rgba(255, 255, 255, 0.78)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
      }}
    >
      <div
        className="nb-navbar-inner"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Apple Monochrome Brand Identity */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              style={{
                height: "32px",
                width: "auto",
                maxWidth: "140px",
                objectFit: "contain",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <span
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#000000",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {tenant.name}
            </span>
          )}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "9999px",
              background: "rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#71717A",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#000000" }} />
            <span>Assessment Session</span>
          </div>
        </Link>

        {/* Right Side: Proctored Pill & Candidate Identifier */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "9999px",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              color: "#000000",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            <ShieldCheck size={13} color="#000000" />
            <span className="hidden-mobile">AI Proctored</span>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#000000" }} />
          </div>

          {mode === "candidate" && candidateName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 12px",
                borderRadius: "9999px",
                background: "#000000",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              <User size={12} color="#FFFFFF" />
              <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {candidateName}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
