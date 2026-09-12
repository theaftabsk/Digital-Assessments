import type { Metadata } from "next";
import "./globals.css";
import "./exam/exam.css";

export const metadata: Metadata = {
  title: "GreatCampus — Integrated Talent: Assess → Interview → Develop → Reassess",
  description:
    "GreatCampus brings talent screening, AI-powered structured interviews, and post-hire microlearning together into one unified, measurable talent journey. Conduct proctored assessments, scale first-round interviews, and continuously build workforce capability.",
  keywords: [
    "GreatCampus",
    "Talent Assessment Platform",
    "AI Proctoring",
    "AI First-Round Interviews",
    "Candidate Screening",
    "Post-Hire Microlearning",
    "Continuous Talent Loop",
    "Recruitment Automation",
    "SaaS Assessment Engine",
  ],
  authors: [{ name: "GreatCampus Technologies" }],
  creator: "GreatCampus Technologies",
  publisher: "GreatCampus Technologies",
  metadataBase: new URL("https://www.greatcampus.tech"),
  alternates: {
    canonical: "https://www.greatcampus.tech",
  },
  openGraph: {
    title: "GreatCampus | One Integrated Talent Journey",
    description:
      "Assess → Interview → Develop → Reassess. Identify the right people, make better hiring decisions, and continuously develop workforce capability.",
    url: "https://www.greatcampus.tech",
    siteName: "GreatCampus Technologies",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreatCampus — Integrated Talent Engine",
    description:
      "AI-powered role tests, automated first-round interviews, and personalized microlearning in one continuous platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased selection:bg-white selection:text-black">
      <body className="min-h-full flex flex-col bg-black text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
