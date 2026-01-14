'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@bkamp/supabase/client';

const randomNames = [
  '푸른나무',
  '따뜻한햇살',
  '조용한바람',
  '작은별',
  '맑은하늘',
  '부드러운구름',
  '잔잔한호수',
  '고요한밤',
  '새벽이슬',
  '가을낙엽',
];

function generateNickname() {
  const name = randomNames[Math.floor(Math.random() * randomNames.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${name}${num}`;
}

export default function NewStoryPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [nickname, setNickname] = useState(generateNickname());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (!/^\d{4}$/.test(password)) {
      alert('비밀번호는 4자리 숫자로 입력해주세요.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('bluetree_stories').insert({
      nickname: nickname.trim() || generateNickname(),
      title: title.trim(),
      content: content.trim(),
      password: password,
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

      <div className="sketch-card">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-primary-dark mb-2">닉네임 (익명)</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임"
              className="sketch-input"
            />
            <p className="text-sm text-primary-dark/50 mt-1">비워두면 자동으로 생성됩니다</p>
          </div>

          <div>
            <label className="block text-primary-dark mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="sketch-input"
            />
          </div>

          <div>
            <label className="block text-primary-dark mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="당신의 이야기를 들려주세요..."
              rows={6}
              className="sketch-input resize-none"
            />
          </div>

          <div>
            <label className="block text-primary-dark mb-2">비밀번호 (4자리 숫자)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
              placeholder="수정/삭제 시 필요합니다"
              className="sketch-input"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="sketch-btn"
              onClick={() => formRef.current?.requestSubmit()}
            >
              {submitting ? '저장 중...' : '작성 완료'}
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
