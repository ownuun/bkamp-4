import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '플립북 주문제작 | Flipbook',
  description: '포토부스 영상을 플립북으로 제작해서 배송해드립니다',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="pastel">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
