import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Marathon Alert - 2026 마라톤 광클 방지기",
  description:
    "인기 마라톤 대회 참가 신청 오픈 시간을 놓치지 않도록 알려주는 서비스",
  keywords: [
    "마라톤",
    "달리기",
    "서울마라톤",
    "춘천마라톤",
    "JTBC마라톤",
    "대회신청",
    "알림",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t py-6 mt-12">
          <div className="container text-center text-sm text-muted-foreground">
            <p>Marathon Alert - 마라톤 신청 알림 서비스</p>
            <p className="mt-1">Made with love for runners</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
