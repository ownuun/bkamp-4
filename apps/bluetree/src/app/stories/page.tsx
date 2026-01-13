'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { createClient } from '@bkamp/supabase/client';
import type { Story } from '@/lib/types';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      const supabase = createClient();
      const { data } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });
      setStories(data || []);
      setLoading(false);
    }
    fetchStories();
  }, []);

  if (loading) {
    return <div className="text-center py-12">불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl text-primary-dark">사연 게시판</h1>
        <Link href="/stories/new">
          <Button>사연 작성하기</Button>
        </Link>
      </div>

      {stories.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-primary-dark/70">아직 작성된 사연이 없습니다.</p>
            <p className="text-primary-dark/70 mt-2">첫 번째 이야기를 나눠보세요.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <Link key={story.id} href={`/stories/${story.id}`}>
              <Card>
                <div className="p-5 hover:bg-warm-100 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl text-primary-dark mb-2">{story.title}</h2>
                      <p className="text-primary-dark/60 text-sm">
                        {story.nickname} · {new Date(story.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
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
