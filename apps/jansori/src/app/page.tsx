'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/lib/hand-drawn-ui';
import { TONE_INFO } from '@/types';

export default function LandingPage() {
  const tones = Object.values(TONE_INFO);

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo.png"
              alt="Jansori"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-text mb-4">Jansori</h1>
          <p className="text-xl text-muted mb-2">잔소리 AI</p>
          <p className="text-lg text-text leading-relaxed">
            목표는 있는데 실천이 어려워?
            <br />
            친구처럼, 엄마처럼 잔소리해줄게!
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <Link href="/login" className="block">
            <button className="w-full px-6 py-3 border-2 border-black rounded-lg bg-surface hover:bg-background transition-colors text-lg font-bold">
              시작하기
            </button>
          </Link>
        </div>

        {/* Tone Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            어떤 잔소리가 좋아?
          </h2>
          <div className="space-y-4">
            {tones.map((tone) => (
              <Card key={tone.id} elevation={1}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{tone.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{tone.name}</h3>
                      <p className="text-muted text-sm mb-2">{tone.description}</p>
                      <p className="text-text italic">&quot;{tone.example}&quot;</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            이런 분께 추천해요
          </h2>
          <Card elevation={1}>
            <div className="p-6">
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>목표는 있지만 실천력이 부족한 분</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>💭</span>
                  <span>혼자서는 동기부여가 안 되는 분</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>💕</span>
                  <span>누군가의 관심이 필요한 분</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📅</span>
                  <span>작심삼일이 일상인 분</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="text-center">
          <Link href="/login" className="inline-block w-full">
            <button className="w-full px-6 py-3 border-2 border-black rounded-lg bg-surface hover:bg-background transition-colors text-lg font-bold">
              지금 시작하기
            </button>
          </Link>
          <p className="text-muted mt-4 text-sm">
            무료로 시작할 수 있어요!
          </p>
        </div>
      </div>
    </main>
  );
}
