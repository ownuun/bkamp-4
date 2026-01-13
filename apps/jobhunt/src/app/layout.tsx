import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Freelancer Job Alarm',
  description: '이력서 스캔, 적합도 분석, 빠른 지원',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
