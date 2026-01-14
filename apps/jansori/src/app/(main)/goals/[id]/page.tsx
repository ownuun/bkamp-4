'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@/lib/hand-drawn-ui';
import { createClient } from '@bkamp/supabase/client';
import {
  GoalWithSettings,
  ToneType,
  NaggingHistory,
  TONE_INFO,
  CATEGORY_INFO,
} from '@/types';

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  const supabase = createClient();

  const [goal, setGoal] = useState<GoalWithSettings | null>(null);
  const [history, setHistory] = useState<NaggingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  // 설정 상태
  const [tone, setTone] = useState<ToneType>('cold');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [situation, setSituation] = useState('');

  useEffect(() => {
    loadGoal();
  }, [goalId]);

  const loadGoal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 목표 로드
    const { data: goalData } = await supabase
      .from('jansori_goals')
      .select(
        `
        *,
        jansori_settings (*)
      `
      )
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (!goalData) {
      router.push('/dashboard');
      return;
    }

    const formattedGoal = {
      ...goalData,
      nagging_settings: Array.isArray(goalData.jansori_settings)
        ? goalData.jansori_settings[0] || null
        : goalData.jansori_settings,
    };
    setGoal(formattedGoal);
    setSituation(formattedGoal.situation || '');

    // 설정 초기화
    if (formattedGoal.nagging_settings) {
      setTone(formattedGoal.nagging_settings.tone);
      setTimeSlots(formattedGoal.nagging_settings.time_slots);
      setIsEnabled(formattedGoal.nagging_settings.is_enabled);
    }

    // 히스토리 로드
    const { data: historyData } = await supabase
      .from('jansori_history')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(10);

    setHistory(historyData || []);
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // 목표 상황 업데이트
      await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation }),
      });

      // 잔소리 설정 업데이트
      await fetch(`/api/goals/${goalId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone,
          frequency: 'daily',
          time_slots: timeSlots,
          is_enabled: isEnabled,
        }),
      });
      alert('설정이 저장되었습니다!');
      loadGoal();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNagging = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/nagging/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_id: goalId, tone }),
      });
      const data = await response.json();
      setTestMessage(data.message);
    } catch (error) {
      console.error('Failed to generate nagging:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 목표를 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (isLoading || !goal) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  const categoryInfo = CATEGORY_INFO[goal.category];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-2xl">
          ←
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryInfo.emoji}</span>
            <h1 className="text-2xl font-bold">{goal.title}</h1>
          </div>
          {goal.description && (
            <p className="text-muted">{goal.description}</p>
          )}
        </div>
      </div>

      {/* Situation */}
      <Card elevation={2}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">내 상황</h2>
          <p className="text-sm text-muted mb-3">
            현재 상황을 적어두면 더 맞춤형 잔소리를 받을 수 있어요
          </p>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value.slice(0, 5000))}
            placeholder="예: 요즘 야근이 많아서 운동할 시간이 없어요. 주말에라도 꼭 하고 싶은데..."
            className="w-full p-3 rounded-lg border-2 border-black min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted mt-1 text-right">
            {situation.length}/5000자
          </p>
        </div>
      </Card>

      {/* Settings */}
      <Card elevation={2}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">잔소리 설정</h2>

          {/* Tone */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">톤</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(TONE_INFO).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-3 py-2 rounded-lg border-2 border-black transition-colors ${
                    tone === t.id
                      ? 'bg-primary text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {t.emoji} {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              알림 시간 (최대 3개)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="time"
                id="time-input-detail"
                className="flex-1 p-2 rounded-lg border-2 border-black"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('time-input-detail') as HTMLInputElement;
                  const time = input?.value;
                  if (time && !timeSlots.includes(time) && timeSlots.length < 3) {
                    setTimeSlots([...timeSlots, time].sort());
                    input.value = '';
                  }
                }}
                className="px-4 py-2 rounded-lg border-2 border-black bg-primary text-white hover:bg-primary/90"
              >
                추가
              </button>
            </div>
            <div className="space-y-2">
              {timeSlots.length === 0 ? (
                <p className="text-muted text-center py-2">시간을 추가해주세요</p>
              ) : (
                timeSlots.map((time) => (
                  <div
                    key={time}
                    className="flex items-center justify-between p-2 rounded-lg border-2 border-black bg-primary text-white"
                  >
                    <span className="font-bold">{time}</span>
                    <button
                      onClick={() => setTimeSlots(timeSlots.filter((t) => t !== time))}
                      className="text-white hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted mt-2">
              {timeSlots.length}/3개 선택됨
            </p>
          </div>

          {/* Enable Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-bold">잔소리 활성화</span>
            </label>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!isSaving && (
              <div onClick={handleSaveSettings}>
                <Button>설정 저장</Button>
              </div>
            )}
            {isSaving && (
              <div className="text-center py-2">
                <span className="text-muted">저장 중...</span>
              </div>
            )}
            {!isGenerating && (
              <div onClick={handleTestNagging}>
                <Button>테스트 잔소리 받아보기</Button>
              </div>
            )}
            {isGenerating && (
              <div className="text-center py-2">
                <span className="text-muted">생성 중...</span>
              </div>
            )}
            {/* Test Message */}
            {testMessage && (
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-black mt-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-bold text-sm mb-1">테스트 잔소리</p>
                    <p className="italic">&quot;{testMessage}&quot;</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* History */}
      <Card elevation={1}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">최근 잔소리</h2>
          {history.length === 0 ? (
            <p className="text-muted text-center py-4">
              아직 받은 잔소리가 없어요
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const toneInfo = TONE_INFO[item.tone as ToneType];
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 rounded-lg border-2 border-black"
                  >
                    <p className="italic mb-2">&quot;{item.message}&quot;</p>
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>
                        {toneInfo?.emoji} {toneInfo?.name}톤
                      </span>
                      <span>
                        {new Date(item.sent_at).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Delete */}
      <div className="text-center">
        <button
          onClick={handleDelete}
          className="text-red-500 underline text-sm"
        >
          목표 삭제
        </button>
      </div>
    </div>
  );
}
