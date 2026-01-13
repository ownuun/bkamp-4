'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { createClient } from '@bkamp/supabase/client';
import type { Walk, WalkParticipant } from '@/lib/types';

export default function WalkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [walk, setWalk] = useState<Walk | null>(null);
  const [participants, setParticipants] = useState<WalkParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: walkData } = await supabase
        .from('walks')
        .select('*')
        .eq('id', params.id)
        .single();

      const { data: participantsData } = await supabase
        .from('walk_participants')
        .select('*')
        .eq('walk_id', params.id)
        .order('created_at', { ascending: true });

      setWalk(walkData);
      setParticipants(participantsData || []);
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('walk_participants').insert({
      walk_id: params.id,
      nickname: nickname.trim(),
      contact: contact.trim() || null,
    });

    if (!error) {
      setJoined(true);
      const { data } = await supabase
        .from('walk_participants')
        .select('*')
        .eq('walk_id', params.id)
        .order('created_at', { ascending: true });
      setParticipants(data || []);
    } else {
      alert('참여 신청에 실패했습니다. 다시 시도해주세요.');
    }
    setSubmitting(false);
  }

  if (loading) {
    return <div className="text-center py-12">불러오는 중...</div>;
  }

  if (!walk) {
    return (
      <div className="text-center py-12">
        <p className="text-primary-dark/70">모임을 찾을 수 없습니다.</p>
        <div className="mt-4">
          <Button onClick={() => router.push('/walks')}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const isFull = participants.length >= walk.max_participants;
  const isPast = new Date(walk.scheduled_at) < new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button onClick={() => router.push('/walks')}>목록으로</Button>

      <Card>
        <div className="p-6">
          <h1 className="text-2xl text-primary-dark mb-4">{walk.title}</h1>

          <div className="space-y-2 text-primary-dark/80 mb-6">
            <p>📍 {walk.location}</p>
            <p>📅 {new Date(walk.scheduled_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}</p>
            <p>👥 참여 {participants.length} / {walk.max_participants}명</p>
          </div>

          {walk.description && (
            <div className="text-primary-dark/70 whitespace-pre-wrap border-t pt-4">
              {walk.description}
            </div>
          )}
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl text-primary-dark">참여자 목록</h2>

        {participants.length === 0 ? (
          <Card>
            <div className="p-4 text-center text-primary-dark/70">
              아직 참여자가 없습니다. 첫 번째 참여자가 되어보세요!
            </div>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <Card key={p.id}>
                <div className="px-3 py-2">
                  <span className="text-primary-dark">{p.nickname}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!joined && !isPast && !isFull && (
          <Card>
            <div className="p-4">
              <h3 className="text-lg text-primary-dark mb-3">참여 신청</h3>
              <form onSubmit={handleJoin} className="space-y-3">
                <Input
                  value={nickname}
                  onChange={(v) => setNickname(v)}
                />
                <Input
                  value={contact}
                  onChange={(v) => setContact(v)}
                />
                <Button onClick={() => {}}>
                  {submitting ? '신청 중...' : '참여 신청하기'}
                </Button>
              </form>
            </div>
          </Card>
        )}

        {joined && (
          <Card>
            <div className="p-4 text-center">
              <p className="text-primary-dark">참여 신청이 완료되었습니다!</p>
            </div>
          </Card>
        )}

        {isFull && !joined && (
          <Card>
            <div className="p-4 text-center">
              <p className="text-primary-dark/70">모집이 마감되었습니다.</p>
            </div>
          </Card>
        )}

        {isPast && (
          <Card>
            <div className="p-4 text-center">
              <p className="text-primary-dark/70">이미 종료된 모임입니다.</p>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
