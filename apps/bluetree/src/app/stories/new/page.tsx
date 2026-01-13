'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { createClient } from '@bkamp/supabase/client';

const randomNames = [
  '푸른나무', '따뜻한햇살', '조용한바람', '작은별', '맑은하늘',
  '부드러운구름', '잔잔한호수', '고요한밤', '새벽이슬', '가을낙엽',
];

function generateNickname() {
  const name = randomNames[Math.floor(Math.random() * randomNames.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${name}${num}`;
}

export default function NewStoryPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState(generateNickname());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('stories').insert({
      nickname: nickname.trim() || generateNickname(),
      title: title.trim(),
      content: content.trim(),
    });

    if (!error) {
      router.push('/stories');
    } else {
      alert('저장에 실패했습니다. 다시 시도해주세요.');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl text-primary-dark mb-6">사연 작성하기</h1>

      <Card>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-primary-dark mb-2">닉네임 (익명)</label>
              <Input
                value={nickname}
                onChange={(v) => setNickname(v)}
              />
              <p className="text-sm text-primary-dark/50 mt-1">
                비워두면 자동으로 생성됩니다
              </p>
            </div>

            <div>
              <label className="block text-primary-dark mb-2">제목</label>
              <Input
                value={title}
                onChange={(v) => setTitle(v)}
              />
            </div>

            <div>
              <label className="block text-primary-dark mb-2">내용</label>
              <Textarea
                value={content}
                onChange={(v) => setContent(v)}
                placeholder="당신의 이야기를 들려주세요..."
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => {}}>
                {submitting ? '저장 중...' : '작성 완료'}
              </Button>
              <Button onClick={() => router.back()}>
                취소
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
