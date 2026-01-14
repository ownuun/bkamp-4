'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/lib/hand-drawn-ui';
import { createClient } from '@bkamp/supabase/client';
import { GoalWithSettings, TONE_INFO, CATEGORY_INFO, Profile } from '@/types';
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from '@/lib/push';

export default function DashboardPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<GoalWithSettings[]>([]);
  const [todayNagging, setTodayNagging] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingGoalId, setGeneratingGoalId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    loadData();
    checkPushStatus();
  }, []);

  const checkPushStatus = async () => {
    const subscribed = await isPushSubscribed();
    setPushEnabled(subscribed);
  };

  const togglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
      } else {
        const success = await subscribeToPush();
        setPushEnabled(success);
      }
    } finally {
      setPushLoading(false);
    }
  };

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 프로필 로드
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(profileData);

    // 목표 로드
    const { data: goalsData } = await supabase
      .from('jansori_goals')
      .select(
        `
        *,
        jansori_settings (*)
      `
      )
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const formattedGoals = (goalsData || []).map((goal: Record<string, unknown>) => ({
      ...goal,
      nagging_settings: Array.isArray(goal.jansori_settings)
        ? goal.jansori_settings[0] || null
        : goal.jansori_settings,
    })) as GoalWithSettings[];
    setGoals(formattedGoals);

    // 오늘의 잔소리 로드 (최신 1개)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: historyData } = await supabase
      .from('jansori_history')
      .select('message')
      .eq('user_id', user.id)
      .gte('sent_at', today.toISOString())
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (historyData) {
      setTodayNagging(historyData.message);
    }

    setIsLoading(false);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ nickname: editedName.trim() })
      .eq('id', user.id);

    setProfile(prev => prev ? { ...prev, nickname: editedName.trim() } : prev);
    setIsEditingName(false);
  };

  const generateTestNagging = async (goalId: string, tone: string) => {
    setGeneratingGoalId(goalId);
    try {
      const response = await fetch('/api/nagging/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_id: goalId, tone }),
      });
      const data = await response.json();
      if (data.message) {
        setTodayNagging(data.message);
      }
    } catch (error) {
      console.error('Failed to generate nagging:', error);
    } finally {
      setGeneratingGoalId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="text-center">
        {isEditingName ? (
          <div className="flex items-center justify-center gap-2 mb-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="px-3 py-2 border-2 border-black rounded-lg text-center text-xl font-bold w-40"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') setIsEditingName(false);
              }}
            />
            <button
              onClick={handleSaveName}
              className="px-3 py-2 bg-primary text-white rounded-lg border-2 border-black"
            >
              저장
            </button>
            <button
              onClick={() => setIsEditingName(false)}
              className="px-3 py-2 bg-gray-200 rounded-lg border-2 border-black"
            >
              취소
            </button>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">
            안녕,{' '}
            <button
              onClick={() => {
                setEditedName(profile?.nickname || '');
                setIsEditingName(true);
              }}
              className="underline hover:text-primary transition-colors"
            >
              {profile?.nickname || 'User'}
            </button>
            !
          </h1>
        )}
        <p className="text-muted">오늘도 목표를 향해 화이팅!</p>
      </div>

      {/* Push Notification Toggle */}
      <Card elevation={1}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-bold">푸시 알림</p>
              <p className="text-sm text-muted">
                {pushEnabled ? '알림을 받고 있어요' : '알림이 꺼져있어요'}
              </p>
            </div>
          </div>
          <button
            onClick={togglePush}
            disabled={pushLoading}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              pushEnabled ? 'bg-primary' : 'bg-gray-300'
            } ${pushLoading ? 'opacity-50' : ''}`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow ${
                pushEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Today's Nagging */}
      {todayNagging && (
        <Card elevation={2}>
          <div className="p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">
                {String.fromCodePoint(0x1f4ac)}
              </span>
              <div>
                <h2 className="font-bold text-lg mb-2">오늘의 잔소리</h2>
                <p className="text-text italic">&quot;{todayNagging}&quot;</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Goals List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">내 목표</h2>
          <Link href="/goals/new">
            <Button>+ 추가</Button>
          </Link>
        </div>

        {goals.length === 0 ? (
          <Card elevation={1}>
            <div className="p-6 text-center">
              <p className="text-muted mb-4">아직 등록된 목표가 없어요</p>
              <Link href="/goals/new">
                <Button>첫 번째 목표 만들기</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const settings = goal.nagging_settings;
              const toneInfo = settings ? TONE_INFO[settings.tone] : null;
              const categoryInfo = CATEGORY_INFO[goal.category];

              return (
                <Link key={goal.id} href={`/goals/${goal.id}`}>
                  <Card elevation={1}>
                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{categoryInfo.emoji}</span>
                            <h3 className="font-bold">{goal.title}</h3>
                          </div>
                          {settings && (
                            <div className="flex items-center gap-2 text-sm text-muted">
                              <span>{toneInfo?.emoji}</span>
                              <span>{toneInfo?.name}톤</span>
                              <span>|</span>
                              <span>{settings.time_slots.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        {settings && generatingGoalId !== goal.id && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              generateTestNagging(goal.id, settings.tone);
                            }}
                            className="text-sm text-primary underline"
                          >
                            테스트
                          </button>
                        )}
                        {settings && generatingGoalId === goal.id && (
                          <span className="text-sm text-muted">생성중...</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
