'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { createClient } from '@bkamp/supabase/client';
import type { Walk } from '@/lib/types';

export default function WalksPage() {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWalks() {
      const supabase = createClient();
      const { data } = await supabase
        .from('walks')
        .select('*')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });
      setWalks(data || []);
      setLoading(false);
    }
    fetchWalks();
  }, []);

  if (loading) {
    return <div className="text-center py-12">불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl text-primary-dark">걷기 모임</h1>
        <Link href="/walks/new">
          <Button>모임 만들기 (관리자)</Button>
        </Link>
      </div>

      {walks.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-primary-dark/70">예정된 걷기 모임이 없습니다.</p>
            <p className="text-primary-dark/70 mt-2">곧 새로운 모임이 열릴 거예요.</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {walks.map((walk) => (
            <Link key={walk.id} href={`/walks/${walk.id}`}>
              <Card>
                <div className="p-5 hover:bg-warm-100 transition-colors cursor-pointer h-full">
                  <h2 className="text-xl text-primary-dark mb-2">{walk.title}</h2>
                  <div className="space-y-1 text-sm text-primary-dark/70">
                    <p>📍 {walk.location}</p>
                    <p>📅 {new Date(walk.scheduled_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</p>
                    <p>👥 최대 {walk.max_participants}명</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
