'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@bkamp/supabase/client';

export default function NewWalkPage() {
  const router = useRouter();
  const verifyFormRef = useRef<HTMLFormElement>(null);
  const createFormRef = useRef<HTMLFormElement>(null);
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
    const { error } = await supabase.from('bluetree_walks').insert({
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
        <div className="sketch-card">
          <form ref={verifyFormRef} onSubmit={handleVerify} className="space-y-4">
            <p className="text-primary-dark/70">모임 생성은 관리자만 가능합니다.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="sketch-input"
            />
            <div className="flex gap-3">
              <button
                type="button"
                className="sketch-btn"
                onClick={() => verifyFormRef.current?.requestSubmit()}
              >
                확인
              </button>
              <button type="button" className="sketch-btn" onClick={() => router.back()}>
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl text-primary-dark mb-6">걷기 모임 만들기</h1>

      <div className="sketch-card">
        <form ref={createFormRef} onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-primary-dark mb-2">모임 이름</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="모임 이름을 입력하세요"
              className="sketch-input"
            />
          </div>

          <div>
            <label className="block text-primary-dark mb-2">설명 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="모임에 대한 설명을 적어주세요..."
              rows={4}
              className="sketch-input resize-none"
            />
          </div>

          <div>
            <label className="block text-primary-dark mb-2">장소</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="모임 장소"
              className="sketch-input"
            />
          </div>

          <div>
            <label className="block text-primary-dark mb-2">일시</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="sketch-input"
            />
          </div>

          <div>
            <label className="block text-primary-dark mb-2">최대 인원</label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              min="1"
              max="100"
              className="sketch-input"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="sketch-btn"
              onClick={() => createFormRef.current?.requestSubmit()}
            >
              {submitting ? '생성 중...' : '모임 생성'}
            </button>
            <button type="button" className="sketch-btn" onClick={() => router.back()}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
