import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Admin Console — Niva Bupa & Tenant Credit Engine",
  description: "Enterprise Super Admin Portal for Exam Credit Management, Tenant Quotas, and Real-Time Audit Ledger.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
