'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Input } from '@/lib/hand-drawn-ui';
import {
  CategoryType,
  ToneType,
  CATEGORY_INFO,
  TONE_INFO,
} from '@/types';

type Step = 1 | 2 | 3;

export default function NewGoalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState({
    title: '',
    category: 'etc' as CategoryType,
    situation: '',
    tone: 'cold' as ToneType,
    timeSlots: [] as string[],
  });

  const nextStep = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. 목표 생성
      const goalRes = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          category: data.category,
          situation: data.situation || null,
        }),
      });
      const { goal } = await goalRes.json();

      // 2. 잔소리 설정 생성
      await fetch(`/api/goals/${goal.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone: data.tone,
          frequency: 'daily',
          time_slots: data.timeSlots,
          is_enabled: true,
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('목표 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/dashboard"
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
        </Link>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted">Step {step}/3</span>
            <span className="text-sm text-muted">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Goal Info */}
        {step === 1 && (
          <Card elevation={2}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">어떤 목표를 이루고 싶어요?</h2>
              <p className="text-muted mb-6">잔소리 받고 싶은 목표를 알려주세요</p>
              <div className="mb-4">
                <Input
                  value={data.title}
                  onChange={(value) => setData({ ...data, title: value })}
                />
              </div>
              <div className="mb-4">
                <p className="text-sm text-muted mb-2">카테고리</p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(CATEGORY_INFO).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setData({ ...data, category: cat.id })}
                      className={`px-3 py-2 rounded-lg border-2 border-black transition-colors ${
                        data.category === cat.id
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
              {data.title.trim() && (
                <div onClick={nextStep}>
                  <Button>다음</Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Tone */}
        {step === 2 && (
          <Card elevation={2}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">어떤 스타일의 잔소리가 좋아요?</h2>
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

        {/* Step 3: Time */}
        {step === 3 && (
          <Card elevation={2}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">언제 잔소리 받고 싶어요?</h2>
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
                {!isLoading && data.timeSlots.length > 0 && (
                  <div onClick={handleSubmit}>
                    <Button>완료</Button>
                  </div>
                )}
                {isLoading && (
                  <div className="text-center py-2">
                    <span className="text-muted">생성 중...</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
