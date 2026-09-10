"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "24px",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "400px",
        width: "100%",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: "#ECFDF5",
      border: "#A7F3D0",
      text: "#065F46",
      iconColor: "#059669",
      icon: <CheckCircle2 size={18} />,
    },
    error: {
      bg: "#FEF2F2",
      border: "#FECACA",
      text: "#991B1B",
      iconColor: "#DC2626",
      icon: <AlertCircle size={18} />,
    },
    warning: {
      bg: "#FFFBEB",
      border: "#FDE68A",
      text: "#92400E",
      iconColor: "#D97706",
      icon: <AlertTriangle size={18} />,
    },
    info: {
      bg: "#EFF6FF",
      border: "#BFDBFE",
      text: "#1E40AF",
      iconColor: "#0284C7",
      icon: <Info size={18} />,
    },
  }[toast.type];

  return (
    <div
      style={{
        pointerEvents: "auto",
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "14px",
        padding: "14px 16px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        animation: "slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div style={{ color: config.iconColor, flexShrink: 0, marginTop: "1px" }}>
        {config.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontSize: "13px", fontWeight: 800, color: config.text, marginBottom: "2px" }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: "12px", color: config.text, lineHeight: 1.5, wordBreak: "break-word" }}>
          {toast.message}
        </div>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: "transparent",
          border: "none",
          color: config.text,
          opacity: 0.6,
          cursor: "pointer",
          padding: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
