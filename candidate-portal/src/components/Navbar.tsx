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
    <header className="nb-navbar" style={{ borderBottom: "1px solid #E2E8F0", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(12px)" }}>
      <div className="nb-navbar-inner" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>

        {/* Dynamic White-Label Brand Identity */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              style={{
                height: "40px",
                width: "auto",
                maxWidth: "160px",
                objectFit: "contain",
                borderRadius: "8px",
                padding: "2px",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: tenant.primaryColor,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 900,
                boxShadow: "0 4px 12px rgba(0, 63, 114, 0.15)",
                letterSpacing: "0.5px",
              }}
            >
              {monogram}
            </div>
          )}

          <div style={{ height: "30px", width: "1.5px", background: "#E2E8F0", margin: "0 2px" }} className="hidden-mobile" />

          <div style={{ display: "flex", flexDirection: "column" }} className="hidden-mobile">
            <span style={{ fontSize: "14px", fontWeight: 900, color: "#0F172A", lineHeight: 1.15 }}>
              {tenant.portalTitle}
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: tenant.primaryColor, marginTop: "2px", letterSpacing: "0.3px" }}>
              {tenant.name}
            </span>
          </div>
        </Link>

        {/* Right Side: Proctored Badge & Candidate Identifier */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "20px",
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              color: "#166534",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            <ShieldCheck size={14} color="#16A34A" />
            <span className="hidden-mobile">AI Proctored Environment</span>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16A34A" }} />
          </div>

          {mode === "candidate" && candidateName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "12px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                fontSize: "12px",
                fontWeight: 800,
                color: "#1E293B",
              }}
            >
              <User size={13} color={tenant.primaryColor} />
              <span className="hidden-mobile" style={{ color: "#64748B", fontWeight: 700 }}>Candidate:</span>
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
