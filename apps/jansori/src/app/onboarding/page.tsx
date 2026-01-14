'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/lib/hand-drawn-ui';
import { createClient } from '@bkamp/supabase/client';
import {
  ToneType,
  CategoryType,
  TONE_INFO,
  CATEGORY_INFO,
} from '@/types';
import { subscribeToPush } from '@/lib/push';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

interface OnboardingData {
  nickname: string;
  goalTitle: string;
  goalCategory: CategoryType;
  situation: string;
  tone: ToneType;
  timeSlots: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    nickname: '',
    goalTitle: '',
    goalCategory: 'etc',
    situation: '',
    tone: 'cold',
    timeSlots: [],
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check profiles for nickname
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single();

      // Check jansori_profiles for onboarding status
      const { data: jansoriProfile } = await supabase
        .from('jansori_profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (jansoriProfile?.onboarding_completed) {
        router.push('/dashboard');
        return;
      }

      if (profile?.nickname) {
        setData((prev) => ({ ...prev, nickname: profile.nickname }));
      }
    };
    checkUser();
  }, [router, supabase]);

  const nextStep = () => {
    if (step < 5) setStep((step + 1) as OnboardingStep);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as OnboardingStep);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update nickname in profiles
      await supabase
        .from('profiles')
        .update({ nickname: data.nickname })
        .eq('id', user.id);

      // Upsert jansori_profiles with onboarding_completed
      await supabase
        .from('jansori_profiles')
        .upsert({
          id: user.id,
          onboarding_completed: true,
        });

      const { data: goal, error: goalError } = await supabase
        .from('jansori_goals')
        .insert({
          user_id: user.id,
          title: data.goalTitle,
          category: data.goalCategory,
          situation: data.situation || null,
        })
        .select()
        .single();

      if (goalError) throw goalError;

      await supabase.from('jansori_settings').insert({
        goal_id: goal.id,
        user_id: user.id,
        tone: data.tone,
        frequency: 'daily',
        time_slots: data.timeSlots,
        is_enabled: true,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushPermission = async () => {
    await subscribeToPush();
    handleComplete();
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted hover:text-foreground mb-4 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          뒤로가기
        </button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted">Step {step}/5</span>
            <span className="text-sm text-muted">{step * 20}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${step * 20}%` }}
            />
          </div>
        </div>

        {/* Step 1: Nickname */}
        {step === 1 && (
          <Card elevation={2}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">뭐라고 불러줄까요?</h2>
              <p className="text-muted mb-6">잔소리할 때 사용할 이름이에요</p>
              <div className="mb-6">
                <Input
                  value={data.nickname}
                  onChange={(value) => setData({ ...data, nickname: value })}
                />
              </div>
              {data.nickname.trim() && (
                <div onClick={nextStep}>
                  <Button>다음</Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <Card elevation={2}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">
                어떤 목표를 이루고 싶어요?
              </h2>
              <p className="text-muted mb-6">잔소리 받고 싶은 목표를 알려주세요</p>
              <div className="mb-4">
                <Input
                  value={data.goalTitle}
                  onChange={(value) => setData({ ...data, goalTitle: value })}
                />
              </div>
              <div className="mb-4">
                <p className="text-sm text-muted mb-2">카테고리</p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(CATEGORY_INFO).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setData({ ...data, goalCategory: cat.id })}
                      className={`px-3 py-2 rounded-lg border-2 border-black transition-colors ${
                        data.goalCategory === cat.id
                          ? 'bg-primary text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm font-bold mb-2">내 상황</p>
                <p className="text-sm text-muted mb-2">
                  현재 상황을 적어두면 더 맞춤형 잔소리를 받을 수 있어요
                </p>
                <textarea
                  value={data.situation}
                  onChange={(e) => setData({ ...data, situation: e.target.value.slice(0, 5000) })}
                  placeholder="예: 요즘 야근이 많아서 운동할 시간이 없어요. 주말에라도 꼭 하고 싶은데..."
                  className="w-full p-3 rounded-lg border-2 border-black min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted mt-1 text-right">
                  {data.situation.length}/5000자
                </p>
              </div>
              <div className="flex justify-between">
                <div onClick={prevStep}>
                  <Button>이전</Button>
                </div>
                {data.goalTitle.trim() && (
                  <div onClick={nextStep}>
                    <Button>다음</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Tone */}
        {step === 3 && (
          <Card elevation={2}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">
                어떤 스타일의 잔소리가 좋아요?
              </h2>
              <p className="text-muted mb-6">톤을 선택해주세요</p>
              <div className="space-y-3 mb-6">
                {Object.values(TONE_INFO).map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setData({ ...data, tone: tone.id })}
                    className={`w-full p-4 rounded-lg border-2 border-black text-left transition-colors ${
                      data.tone === tone.id
                        ? 'bg-primary text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tone.emoji}</span>
                      <div>
                        <p className="font-bold">{tone.name}</p>
                        <p
                          className={`text-sm ${
                            data.tone === tone.id ? 'text-white/80' : 'text-muted'
                          }`}
                        >
                          {tone.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <div onClick={prevStep}>
                  <Button>이전</Button>
                </div>
                <div onClick={nextStep}>
                  <Button>다음</Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Time */}
        {step === 4 && (
          <Card elevation={2}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">
                언제 잔소리 받고 싶어요?
              </h2>
              <p className="text-muted mb-6">알림 받을 시간을 설정해주세요</p>

              {/* Time Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="time"
                  id="time-input"
                  className="flex-1 p-3 rounded-lg border-2 border-black"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('time-input') as HTMLInputElement;
                    const time = input?.value;
                    if (time && !data.timeSlots.includes(time) && data.timeSlots.length < 3) {
                      setData({ ...data, timeSlots: [...data.timeSlots, time].sort() });
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 rounded-lg border-2 border-black bg-primary text-white hover:bg-primary/90"
                >
                  추가
                </button>
              </div>

              {/* Selected Times */}
              <div className="space-y-2 mb-4">
                {data.timeSlots.length === 0 ? (
                  <p className="text-muted text-center py-4">시간을 추가해주세요</p>
                ) : (
                  data.timeSlots.map((time) => (
                    <div
                      key={time}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-black bg-primary text-white"
                    >
                      <span className="font-bold">{time}</span>
                      <button
                        onClick={() => setData({ ...data, timeSlots: data.timeSlots.filter((t) => t !== time) })}
                        className="text-white hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <p className="text-sm text-muted mb-4">
                최대 3개까지 추가할 수 있어요 ({data.timeSlots.length}/3)
              </p>
              <div className="flex justify-between">
                <div onClick={prevStep}>
                  <Button>이전</Button>
                </div>
                {data.timeSlots.length > 0 && (
                  <div onClick={nextStep}>
                    <Button>다음</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Step 5: Push Notification */}
        {step === 5 && (
          <Card elevation={2}>
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🔔</div>
                <h2 className="text-2xl font-bold mb-2">알림을 켜주세요!</h2>
                <p className="text-muted">
                  잔소리를 제때 받으려면 알림 허용이 필요해요
                </p>
              </div>
              <div className="space-y-3">
                {!isLoading && (
                  <div onClick={handlePushPermission}>
                    <Button>알림 허용하고 시작하기</Button>
                  </div>
                )}
                {isLoading && <p className="text-center">설정 중...</p>}
                <button
                  onClick={handleComplete}
                  className="w-full text-muted underline py-2"
                >
                  나중에 설정할게요
                </button>
              </div>
              <div onClick={prevStep} className="mt-4">
                <Button>이전</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
