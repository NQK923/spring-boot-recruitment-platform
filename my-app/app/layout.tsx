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
  title: "Talentflow | Nền tảng tuyển dụng",
  description:
    "Quản lý doanh nghiệp, bài đăng tuyển dụng, hồ sơ ứng tuyển và lịch phỏng vấn trên một nền tảng duy nhất.",
};

const INITIAL_THEME_SCRIPT = `(function(){try{var storageKey='talentflow-ui-theme';var stored=localStorage.getItem(storageKey);var theme=(stored==='light'||stored==='dark')?stored:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-bg text-text antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: INITIAL_THEME_SCRIPT }} />
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
