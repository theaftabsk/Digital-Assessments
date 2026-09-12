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
      <head>
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@900,800,700,600,500,400&display=swap" />
      </head>
      <body className="min-h-screen bg-white text-black antialiased selection:bg-black selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
