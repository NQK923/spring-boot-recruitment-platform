import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Talentflow | Recruitment Platform",
  description:
    "Manage companies, jobs, applications, and interviews with a unified recruitment platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-x-0 top-[-20%] hidden h-[520px] w-full blur-[160px] sm:block">
              <div className="mx-auto h-full max-w-5xl rounded-full bg-gradient-to-r from-indigo-300/40 via-sky-200/40 to-purple-200/30" />
            </div>
          </div>
          <SiteHeader />
          <main className="flex-1 pb-20 pt-12 sm:pb-24 sm:pt-16">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
