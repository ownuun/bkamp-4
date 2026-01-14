'use client';

import { createClient } from '@bkamp/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RecommendationHistory {
  id: string;
  input_webtoons: string[];
  recommendations: {
    taste_analysis: string;
    recommendations: Array<{
      title: string;
      author: string;
      genre: string[];
      platform: string;
      reason: string;
    }>;
  };
  created_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<RecommendationHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<RecommendationHistory | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('webtoon_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
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
            <span>📖</span> 추천 기록
          </h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="nb-button bg-nb-green text-sm py-1 px-3">
              새 추천
            </Link>
            <button
              onClick={handleLogout}
              className="nb-button bg-white text-sm py-1 px-3"
            >
              로그아웃
            </button>
          </div>
        </header>

        {history.length === 0 ? (
          <div className="nb-card p-8 bg-white text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-bold mb-2">아직 추천 기록이 없어요</h2>
            <p className="text-black/60 mb-6">
              좋아하는 웹툰을 입력하고 맞춤 추천을 받아보세요
            </p>
            <Link href="/dashboard" className="nb-button bg-nb-green inline-block">
              추천 받으러 가기
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedHistory(item)}
                className="nb-card-hover p-4 bg-white text-left w-full"
              >
                <div className="text-xs text-black/50 mb-2">
                  {formatDate(item.created_at)}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.input_webtoons.slice(0, 3).map((title) => (
                    <span
                      key={title}
                      className="text-xs bg-nb-green px-2 py-0.5 rounded-full border-2 border-black"
                    >
                      {title}
                    </span>
                  ))}
                  {item.input_webtoons.length > 3 && (
                    <span className="text-xs text-black/50">
                      +{item.input_webtoons.length - 3}개
                    </span>
                  )}
                </div>
                <p className="text-sm text-black/70 line-clamp-2">
                  {item.recommendations.taste_analysis}
                </p>
                <div className="text-xs text-black/50 mt-2">
                  {item.recommendations.recommendations.length}개 추천
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedHistory && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedHistory(null)}
          >
            <div
              className="nb-card bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-black/50 mb-1">
                    {formatDate(selectedHistory.created_at)}
                  </div>
                  <h2 className="text-xl font-bold">추천 상세</h2>
                </div>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="nb-button bg-white py-1 px-2"
                >
                  <svg
                    className="w-5 h-5"
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
              </div>

              {/* Input Webtoons */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-black/60 mb-2">
                  입력한 웹툰
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHistory.input_webtoons.map((title) => (
                    <span key={title} className="nb-tag text-xs">
                      {title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Taste Analysis */}
              <div className="nb-card p-4 bg-nb-green mb-4">
                <h3 className="text-sm font-bold mb-1">취향 분석</h3>
                <p className="text-sm">
                  {selectedHistory.recommendations.taste_analysis}
                </p>
              </div>

              {/* Recommendations */}
              <h3 className="text-sm font-bold text-black/60 mb-2">추천 웹툰</h3>
              <div className="space-y-3">
                {selectedHistory.recommendations.recommendations.map(
                  (rec, index) => (
                    <div
                      key={index}
                      className="border-2 border-black rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{rec.title}</h4>
                          <p className="text-xs text-black/60">
                            {rec.author} · {rec.genre.join(', ')}
                          </p>
                        </div>
                        <span className="text-xs bg-black text-white px-2 py-0.5 rounded">
                          {rec.platform}
                        </span>
                      </div>
                      <p className="text-sm mt-2 text-black/70">{rec.reason}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
