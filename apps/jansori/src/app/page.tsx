import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="nb-card p-12 bg-nb-orange-light text-center max-w-md w-full">
        {/* Icon */}
        <div className="text-8xl mb-6">
          <span role="img" aria-label="speaking head">
            {String.fromCodePoint(0x1F5E3, 0xFE0F)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-black mb-4">
          잔소리 AI
        </h1>

        {/* Message */}
        <p className="text-xl font-bold text-black/80 mb-8">
          준비 중입니다
        </p>

        {/* Link to Portal */}
        <Link href="http://localhost:3000">
          <button className="nb-button bg-nb-orange text-white hover:bg-nb-orange-dark w-full">
            포털로 돌아가기
          </button>
        </Link>
      </div>
    </main>
  );
}
