'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@bkamp/supabase/client';
import type { Walk } from '@/lib/types';

export default function WalksPage() {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWalks() {
      const supabase = createClient();
      const { data } = await supabase
        .from('bluetree_walks')
        .select('*')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      setWalks(data || []);
      setLoading(false);
    }
    fetchWalks();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-primary-dark">불러오는 중...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl text-primary-dark">걷기 모임</h1>
        <Link href="/walks/new">
          <button className="px-4 py-2 border-2 border-primary-dark rounded-lg bg-white hover:bg-warm-100 transition-colors text-primary-dark">
            모임 만들기
          </button>
        </Link>
      </div>

      {walks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-primary-dark/70 mb-4">예정된 걷기 모임이 없습니다.</p>
          <p className="text-primary-dark/50 text-sm">첫 번째 모임을 만들어보세요!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {walks.map((walk) => (
            <Link key={walk.id} href={`/walks/${walk.id}`}>
              <div className="p-5 border-2 border-primary-dark/30 rounded-lg bg-white hover:bg-warm-100 hover:border-primary-dark/50 transition-all cursor-pointer h-full">
                <h2 className="text-xl text-primary-dark mb-3">{walk.title}</h2>
                {walk.description && (
                  <p className="text-primary-dark/70 text-sm line-clamp-2 mb-3">
                    {walk.description}
                  </p>
                )}
                <div className="space-y-1 text-sm text-primary-dark/60">
                  <p>📍 {walk.location}</p>
                  <p>
                    📅{' '}
                    {new Date(walk.scheduled_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p>👥 최대 {walk.max_participants}명</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
