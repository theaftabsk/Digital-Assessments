"use client";

import React from "react";
import { AlertTriangle, Trash2, X, AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.06)",
          overflow: "hidden",
          animation: "scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: isDanger ? "#FEF2F2" : "#EFF6FF",
              color: isDanger ? "#DC2626" : "#0284C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isDanger ? <Trash2 size={22} /> : <AlertCircle size={22} />}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "0 0 2px" }}>
              {title}
            </h3>
            <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
              Action Confirmation Required
            </p>
          </div>

          {!loading && (
            <button
              onClick={onCancel}
              style={{
                background: "#F8FAFC",
                border: "none",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748B",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
          {message}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px 20px",
            background: "#F8FAFC",
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              fontSize: "13px",
              fontWeight: 700,
              color: "#475569",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "9px 20px",
              borderRadius: "10px",
              background: isDanger ? "#DC2626" : "#003F72",
              border: "none",
              fontSize: "13px",
              fontWeight: 800,
              color: "#FFFFFF",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: isDanger ? "0 2px 8px rgba(220, 38, 38, 0.25)" : "0 2px 8px rgba(0, 63, 114, 0.25)",
            }}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
