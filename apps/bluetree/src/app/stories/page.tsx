'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@bkamp/supabase/client';
import type { Story } from '@/lib/types';

const mockStories: Story[] = [
  {
    id: 'mock-1',
    nickname: '푸른나무123',
    title: '오늘 처음으로 혼자 산책을 했어요',
    content:
      '우울한 마음에 집에만 있다가, 용기를 내서 근처 공원을 걸었어요. 바람이 시원하고 좋았습니다.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'mock-2',
    nickname: '따뜻한햇살456',
    title: '힘든 하루였지만 괜찮아요',
    content:
      '회사에서 많이 지쳤는데, 퇴근길에 본 노을이 예뻐서 조금 위로가 됐어요.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'mock-3',
    nickname: '조용한바람789',
    title: '엄마랑 오랜만에 통화했어요',
    content:
      '바빠서 연락 못 했는데 오늘 30분 넘게 통화했어요. 엄마 목소리가 따뜻했습니다.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'mock-4',
    nickname: '작은별222',
    title: '좋아하는 카페를 찾았어요',
    content:
      '조용하고 창가 자리가 예쁜 카페에요. 앞으로 자주 올 것 같아요.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      const supabase = createClient();
      const { data } = await supabase
        .from('bluetree_stories')
        .select('*')
        .order('created_at', { ascending: false });

      // DB에 데이터가 없으면 목업 데이터 사용
      setStories(data && data.length > 0 ? data : mockStories);
      setLoading(false);
    }
    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-primary-dark">불러오는 중...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl text-primary-dark">사연 게시판</h1>
        <Link href="/stories/new">
          <button className="px-4 py-2 border-2 border-primary-dark rounded-lg bg-white hover:bg-warm-100 transition-colors text-primary-dark">
            사연 작성하기
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        {stories.map((story) => (
          <Link key={story.id} href={`/stories/${story.id}`}>
            <div className="p-5 border-2 border-primary-dark/30 rounded-lg bg-white hover:bg-warm-100 hover:border-primary-dark/50 transition-all cursor-pointer mb-4">
              <h2 className="text-xl text-primary-dark mb-2">{story.title}</h2>
              <p className="text-primary-dark/70 text-sm line-clamp-2 mb-2">
                {story.content}
              </p>
              <p className="text-primary-dark/50 text-sm">
                {story.nickname} ·{' '}
                {new Date(story.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
