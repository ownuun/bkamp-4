'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { createClient } from '@bkamp/supabase/client';

export default function NewWalkPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [submitting, setSubmitting] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setVerified(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !scheduledAt) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('walks').insert({
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim(),
      scheduled_at: new Date(scheduledAt).toISOString(),
      max_participants: parseInt(maxParticipants) || 10,
    });

    if (!error) {
      router.push('/walks');
    } else {
      alert('저장에 실패했습니다. 다시 시도해주세요.');
      setSubmitting(false);
    }
  }

  if (!verified) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl text-primary-dark mb-6">관리자 인증</h1>
        <Card>
          <div className="p-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-primary-dark/70">
                모임 생성은 관리자만 가능합니다.
              </p>
              <Input
                value={password}
                onChange={(v) => setPassword(v)}
              />
              <div className="flex gap-3">
                <Button onClick={() => {}}>확인</Button>
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl text-primary-dark mb-6">걷기 모임 만들기</h1>

      <Card>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-primary-dark mb-2">모임 이름</label>
              <Input
                value={title}
                onChange={(v) => setTitle(v)}
              />
            </div>

            <div>
              <label className="block text-primary-dark mb-2">설명 (선택)</label>
              <Textarea
                value={description}
                onChange={(v) => setDescription(v)}
                placeholder="모임에 대한 설명을 적어주세요..."
              />
            </div>

            <div>
              <label className="block text-primary-dark mb-2">장소</label>
              <Input
                value={location}
                onChange={(v) => setLocation(v)}
              />
            </div>

            <div>
              <label className="block text-primary-dark mb-2">일시</label>
              <Input
                value={scheduledAt}
                onChange={(v) => setScheduledAt(v)}
              />
            </div>

            <div>
              <label className="block text-primary-dark mb-2">최대 인원</label>
              <Input
                value={maxParticipants}
                onChange={(v) => setMaxParticipants(v)}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => {}}>
                {submitting ? '생성 중...' : '모임 생성'}
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
