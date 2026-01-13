import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="nb-card p-8 bg-nb-green text-center max-w-md">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-3xl font-black mb-2">웹툰 추천</h1>
        <p className="text-lg mb-6 text-black/70">준비 중입니다</p>
        <Link href="http://localhost:3000" className="nb-button bg-white inline-block">
          포털로 돌아가기
        </Link>
      </div>
    </main>
  );
}
