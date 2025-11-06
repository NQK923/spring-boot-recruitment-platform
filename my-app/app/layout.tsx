import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ChatWidgetProvider } from "@/app/providers/chat-widget-provider";
import { ChatWidget } from "@/components/candidate/ChatWidget";
import { ThemeProvider } from "@/app/providers/theme-provider";
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
  title: "TalentFlow | Nền tảng tuyển dụng chuyên nghiệp",
  description:
    "Vận hành toàn bộ pipeline tuyển dụng – đăng job, sàng lọc, phỏng vấn và báo cáo – trên một giao diện tối ưu cho đội ngũ recruiter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-bg text-text antialiased`}>
        <ThemeProvider>
          <ChatWidgetProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <ChatWidget />
          </ChatWidgetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
