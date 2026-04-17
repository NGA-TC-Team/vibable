import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppProviders } from "@/services/providers/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "Vibable";
const siteTitleDefault =
  "Vibable — 바이브코딩용 7단계 기획 워크플로, 기획서를 JSON·PDF로 보내는 웹 도구";
const siteDescription =
  "Vibable은 아이디어부터 요구사항·정보구조·화면 설계·데이터 모델까지 7단계 페이즈로 프로덕트 기획서를 쌓아가는 웹 도구입니다. Claude·OpenClaw용 에이전트 초안도 정리하고, 완성본은 JSON과 PDF로 보내 AI 코딩 파이프라인과 공유할 수 있습니다.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  applicationName: siteName,
  title: {
    default: siteTitleDefault,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Vibable",
    "바이브코딩",
    "vibe coding",
    "기획서",
    "스펙",
    "프로덕트 기획",
    "AI 코딩",
    "JSON",
    "PDF",
  ],
  authors: [{ name: "Vibable" }],
  creator: "Vibable",
  icons: {
    icon: "/favicon.ico",
    apple: "/vibable-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AppProviders>{children}</AppProviders>
            <Toaster richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
