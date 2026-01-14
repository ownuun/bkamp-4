'use client';

import { createClient } from '@bkamp/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface Recommendation {
  title: string;
  author: string;
  genre: string[];
  platform: string;
  platform_url: string;
  reason: string;
  similarity_point: string;
}

interface RecommendationResult {
  taste_analysis: string;
  recommendations: Recommendation[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [webtoons, setWebtoons] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const addWebtoon = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !webtoons.includes(trimmed)) {
      setWebtoons([...webtoons, trimmed]);
      setInputValue('');
    }
  };

  const removeWebtoon = (title: string) => {
    setWebtoons(webtoons.filter((w) => w !== title));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addWebtoon();
    }
  };

  const getRecommendations = async () => {
    if (webtoons.length === 0) {
      setError('최소 1개 이상의 웹툰을 입력해주세요');
      return;
    }

    setIsRecommending(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webtoons }),
      });

      if (!response.ok) {
        throw new Error('추천을 가져오는데 실패했습니다');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsRecommending(false);
    }
  };

  const getPlatformUrl = (platform: string, title: string) => {
    const encodedTitle = encodeURIComponent(title);
    switch (platform.toLowerCase()) {
      case 'naver':
        return `https://comic.naver.com/search?keyword=${encodedTitle}`;
      case 'kakao':
        return `https://webtoon.kakao.com/search?keyword=${encodedTitle}`;
      case 'kakaopage':
        return `https://page.kakao.com/search/result?keyword=${encodedTitle}`;
      default:
        return `https://www.google.com/search?q=${encodedTitle}+웹툰`;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'naver':
        return '네이버웹툰';
      case 'kakao':
        return '카카오웹툰';
      case 'kakaopage':
        return '카카오페이지';
      default:
        return platform;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold animate-pulse">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
            <img src="/logo.png" alt="Webtoon" className="h-8 w-8" />
            웹툰 추천
          </h1>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-sm text-black/60 hidden sm:block">
              {user?.email}
            </span>
            <Link href="/history" className="nb-button bg-white text-sm py-1 px-3">
              기록
            </Link>
            <button
              onClick={handleLogout}
              className="nb-button bg-white text-sm py-1 px-3"
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* Input Section */}
        <section className="nb-card p-6 bg-white mb-6">
          <h2 className="text-xl font-bold mb-4">좋아하는 웹툰을 알려주세요</h2>
          <p className="text-black/60 mb-4">
            여러 작품을 입력할수록 더 정확한 추천을 받을 수 있어요
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="웹툰 제목을 입력하세요"
              className="nb-input flex-1"
            />
            <button
              onClick={addWebtoon}
              className="nb-button bg-nb-green whitespace-nowrap"
            >
              추가
            </button>
          </div>

          {/* Tags */}
          {webtoons.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {webtoons.map((title) => (
                <span key={title} className="nb-tag">
                  {title}
                  <button
                    onClick={() => removeWebtoon(title)}
                    className="nb-tag-remove"
                    aria-label={`${title} 삭제`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            onClick={getRecommendations}
            disabled={webtoons.length === 0 || isRecommending}
            className="nb-button bg-nb-green-dark text-white w-full py-3 text-lg"
          >
            {isRecommending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                AI가 분석 중...
              </span>
            ) : (
              '추천 받기'
            )}
          </button>

          {error && (
            <p className="mt-4 text-red-600 font-medium text-center">{error}</p>
          )}
        </section>

        {/* Results Section */}
        {result && (
          <section className="space-y-6">
            {/* Taste Analysis */}
            <div className="nb-card p-6 bg-nb-green">
              <h3 className="text-lg font-bold mb-2">당신의 취향 분석</h3>
              <p className="text-black/80">{result.taste_analysis}</p>
            </div>

            {/* Recommendations */}
            <h3 className="text-xl font-bold">추천 웹툰</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="nb-card-hover p-6 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold">{rec.title}</h4>
                    <span className="text-xs bg-black text-white px-2 py-1 rounded">
                      {getPlatformLabel(rec.platform)}
                    </span>
                  </div>
                  <p className="text-sm text-black/60 mb-2">
                    {rec.author} · {rec.genre.join(', ')}
                  </p>
                  <p className="text-sm mb-3">{rec.reason}</p>
                  <p className="text-xs text-black/50 mb-4 italic">
                    "{rec.similarity_point}"
                  </p>
                  <a
                    href={getPlatformUrl(rec.platform, rec.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nb-button bg-nb-green text-sm py-1 px-3 inline-block"
                  >
                    보러가기 →
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
