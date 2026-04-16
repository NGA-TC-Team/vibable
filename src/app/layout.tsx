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
const siteDescription =
  "7단계 페이즈로 기획서를 체계적으로 작성하고, 완성본을 JSON 또는 PDF로 보내는 바이브코딩용 기획 도구입니다.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  applicationName: siteName,
  title: {
    default: siteName,
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
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName,
    title: `${siteName} — 바이브코딩 기획서`,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — 바이브코딩 기획서`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
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
