'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@bkamp/supabase/client';
import type { Walk, WalkParticipant } from '@/lib/types';

// localStorage 키
const PARTICIPATION_KEY = 'bluetree_participations';

interface StoredParticipation {
  participantId: string;
  walkId: string;
}

function getStoredParticipation(walkId: string): StoredParticipation | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PARTICIPATION_KEY);
    if (!stored) return null;
    const participations: StoredParticipation[] = JSON.parse(stored);
    return participations.find((p) => p.walkId === walkId) || null;
  } catch {
    return null;
  }
}

function saveParticipation(walkId: string, participantId: string) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(PARTICIPATION_KEY);
    const participations: StoredParticipation[] = stored ? JSON.parse(stored) : [];
    const existing = participations.findIndex((p) => p.walkId === walkId);
    if (existing >= 0) {
      participations[existing].participantId = participantId;
    } else {
      participations.push({ walkId, participantId });
    }
    localStorage.setItem(PARTICIPATION_KEY, JSON.stringify(participations));
  } catch {
    // ignore
  }
}

function removeParticipation(walkId: string) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(PARTICIPATION_KEY);
    if (!stored) return;
    const participations: StoredParticipation[] = JSON.parse(stored);
    const filtered = participations.filter((p) => p.walkId !== walkId);
    localStorage.setItem(PARTICIPATION_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export default function WalkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const walkId = Array.isArray(params.id) ? params.id[0] : params.id;
  const joinFormRef = useRef<HTMLFormElement>(null);

  const [walk, setWalk] = useState<Walk | null>(null);
  const [participants, setParticipants] = useState<WalkParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  // 참여 신청 폼
  const [nickname, setNickname] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 내 참여 정보
  const [myParticipation, setMyParticipation] = useState<WalkParticipant | null>(null);

  // 수정/취소 모달
  const [showModal, setShowModal] = useState<'edit' | 'cancel' | 'admin' | null>(null);
  const [modalPassword, setModalPassword] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // 관리자 모드
  const [adminVerified, setAdminVerified] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!walkId) return;

      const supabase = createClient();

      const { data: walkData } = await supabase
        .from('bluetree_walks')
        .select('*')
        .eq('id', walkId)
        .single();

      const { data: participantsData } = await supabase
        .from('bluetree_participants')
        .select('*')
        .eq('walk_id', walkId)
        .order('created_at', { ascending: true });

      setWalk(walkData || null);
      setParticipants(participantsData || []);

      // localStorage에서 내 참여 정보 확인
      const stored = getStoredParticipation(walkId);
      if (stored && participantsData) {
        const myData = participantsData.find((p) => p.id === stored.participantId);
        setMyParticipation(myData || null);
      }

      setLoading(false);
    }
    fetchData();
  }, [walkId]);

  async function refreshParticipants() {
    if (!walkId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('bluetree_participants')
      .select('*')
      .eq('walk_id', walkId)
      .order('created_at', { ascending: true });
    setParticipants(data || []);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !walkId) return;
    if (!contact.trim()) {
      alert('연락처를 입력해주세요.');
      return;
    }
    if (!email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!/^\d{4}$/.test(password)) {
      alert('비밀번호는 4자리 숫자로 입력해주세요.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bluetree_participants')
      .insert({
        walk_id: walkId,
        nickname: nickname.trim(),
        contact: contact.trim(),
        email: email.trim(),
        password: password,
      })
      .select()
      .single();

    if (error) {
      console.error('Participation error:', error);
      alert('참여 신청에 실패했습니다. 다시 시도해주세요.');
    } else if (data) {
      saveParticipation(walkId, data.id);
      setMyParticipation(data);
      await refreshParticipants();
      setNickname('');
      setContact('');
      setEmail('');
      setPassword('');
    }
    setSubmitting(false);
  }

  async function handleEditSubmit() {
    if (!myParticipation || !walkId) return;
    if (!editContact.trim()) {
      alert('연락처를 입력해주세요.');
      return;
    }
    if (!editEmail.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    const supabase = createClient();

    // 비밀번호 확인
    const { data: verified } = await supabase
      .from('bluetree_participants')
      .select('id')
      .eq('id', myParticipation.id)
      .eq('password', modalPassword)
      .single();

    if (!verified) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 정보 수정
    const { error } = await supabase
      .from('bluetree_participants')
      .update({
        nickname: editNickname.trim(),
        contact: editContact.trim(),
        email: editEmail.trim(),
      })
      .eq('id', myParticipation.id);

    if (!error) {
      setMyParticipation({
        ...myParticipation,
        nickname: editNickname.trim(),
        contact: editContact.trim(),
        email: editEmail.trim(),
      });
      await refreshParticipants();
      setShowModal(null);
      setModalPassword('');
    } else {
      alert('수정에 실패했습니다.');
    }
  }

  async function handleCancelSubmit() {
    if (!myParticipation || !walkId) return;

    const supabase = createClient();

    // 비밀번호 확인 후 삭제
    const { error } = await supabase
      .from('bluetree_participants')
      .delete()
      .eq('id', myParticipation.id)
      .eq('password', modalPassword);

    if (!error) {
      removeParticipation(walkId);
      setMyParticipation(null);
      await refreshParticipants();
      setShowModal(null);
      setModalPassword('');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  }

  async function handleAdminVerify() {
    try {
      const res = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: modalPassword }),
      });

      if (res.ok) {
        setAdminVerified(true);
        setShowModal(null);
        setModalPassword('');
      } else {
        alert('관리자 비밀번호가 일치하지 않습니다.');
      }
    } catch {
      alert('오류가 발생했습니다.');
    }
  }

  function openEditModal() {
    if (!myParticipation) return;
    setEditNickname(myParticipation.nickname);
    setEditContact(myParticipation.contact || '');
    setEditEmail(myParticipation.email || '');
    setShowModal('edit');
  }

  if (loading) {
    return <div className="text-center py-12">불러오는 중...</div>;
  }

  if (!walk) {
    return (
      <div className="text-center py-12">
        <p className="text-primary-dark/70">모임을 찾을 수 없습니다.</p>
        <div className="mt-4">
          <button className="sketch-btn" onClick={() => router.push('/walks')}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isFull = participants.length >= walk.max_participants;
  const isPast = new Date(walk.scheduled_at) < new Date();
  const canJoin = !myParticipation && !isPast && !isFull;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button className="sketch-btn" onClick={() => router.push('/walks')}>
        목록으로
      </button>

      <div className="sketch-card">
        <h1 className="text-2xl text-primary-dark mb-4">{walk.title}</h1>

        <div className="space-y-2 text-primary-dark/80 mb-6">
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
          <p>👥 참여 {participants.length} / {walk.max_participants}명</p>
        </div>

        {walk.description && (
          <div className="text-primary-dark/70 whitespace-pre-wrap border-t border-primary-dark/20 pt-4">
            {walk.description}
          </div>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-primary-dark">
            참여자 ({participants.length} / {walk.max_participants}명)
          </h2>
          {!adminVerified && (
            <button
              className="sketch-btn text-sm"
              onClick={() => setShowModal('admin')}
            >
              관리자
            </button>
          )}
        </div>

        {/* 참여자 목록 - 관리자만 볼 수 있음 */}
        {adminVerified && participants.length > 0 && (
          <div className="sketch-card !p-4 space-y-2">
            {participants.map((p, idx) => (
              <div
                key={p.id}
                className="py-2 border-b border-primary-dark/10 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-primary-dark/80">
                    {idx + 1}. {p.nickname}
                  </span>
                  <span className="text-sm text-primary-dark/60">{p.contact}</span>
                </div>
                {p.email && (
                  <div className="text-sm text-primary-dark/50 mt-1">
                    📧 {p.email}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 내 참여 정보 - 수정/취소 버튼 */}
        {myParticipation && !isPast && (
          <div className="sketch-card !p-4">
            <p className="text-primary-dark mb-3">참여 신청이 완료되었습니다!</p>
            <div className="flex gap-2">
              <button className="sketch-btn text-sm" onClick={openEditModal}>
                정보 수정
              </button>
              <button
                className="sketch-btn text-sm"
                onClick={() => setShowModal('cancel')}
              >
                참여 취소
              </button>
            </div>
          </div>
        )}

        {/* 참여 신청 폼 */}
        {canJoin && (
          <div className="sketch-card !p-4">
            <h3 className="text-lg text-primary-dark mb-3">참여 신청</h3>
            <form ref={joinFormRef} onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
                className="sketch-input"
              />
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="연락처"
                className="sketch-input"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                className="sketch-input"
              />
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  placeholder="비밀번호 4자리 (수정/취소 시 필요)"
                  className="sketch-input"
                />
              </div>
              <button
                type="button"
                className="sketch-btn"
                onClick={() => joinFormRef.current?.requestSubmit()}
              >
                {submitting ? '신청 중...' : '참여 신청하기'}
              </button>
            </form>
          </div>
        )}

        {isFull && !myParticipation && (
          <div className="sketch-card !p-4 text-center">
            <p className="text-primary-dark/70">모집이 마감되었습니다.</p>
          </div>
        )}

        {isPast && !myParticipation && (
          <div className="sketch-card !p-4 text-center">
            <p className="text-primary-dark/70">이미 종료된 모임입니다.</p>
          </div>
        )}
      </section>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="sketch-card max-w-sm w-full mx-4">
            {showModal === 'edit' && (
              <>
                <h3 className="text-lg text-primary-dark mb-4">참여 정보 수정</h3>
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="닉네임"
                    className="sketch-input"
                  />
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    placeholder="연락처"
                    className="sketch-input"
                  />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="이메일"
                    className="sketch-input"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value.replace(/\D/g, ''))}
                    placeholder="비밀번호 4자리"
                    className="sketch-input"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button className="sketch-btn" onClick={handleEditSubmit}>
                    수정
                  </button>
                  <button
                    className="sketch-btn"
                    onClick={() => {
                      setShowModal(null);
                      setModalPassword('');
                    }}
                  >
                    취소
                  </button>
                </div>
              </>
            )}

            {showModal === 'cancel' && (
              <>
                <h3 className="text-lg text-primary-dark mb-4">참여를 취소하시겠습니까?</h3>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value.replace(/\D/g, ''))}
                  placeholder="비밀번호 4자리"
                  className="sketch-input mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button className="sketch-btn" onClick={handleCancelSubmit}>
                    취소하기
                  </button>
                  <button
                    className="sketch-btn"
                    onClick={() => {
                      setShowModal(null);
                      setModalPassword('');
                    }}
                  >
                    돌아가기
                  </button>
                </div>
              </>
            )}

            {showModal === 'admin' && (
              <>
                <h3 className="text-lg text-primary-dark mb-4">관리자 인증</h3>
                <p className="text-sm text-primary-dark/60 mb-4">
                  참여자 연락처를 확인하려면 관리자 비밀번호를 입력하세요.
                </p>
                <input
                  type="password"
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  placeholder="관리자 비밀번호"
                  className="sketch-input mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button className="sketch-btn" onClick={handleAdminVerify}>
                    확인
                  </button>
                  <button
                    className="sketch-btn"
                    onClick={() => {
                      setShowModal(null);
                      setModalPassword('');
                    }}
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
