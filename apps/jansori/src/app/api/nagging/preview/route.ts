import { createClient } from '@bkamp/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateNagging } from '@/lib/openai';
import { PreviewNaggingRequest, ToneType } from '@/types';

// POST /api/nagging/preview - 잔소리 미리보기 생성
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: PreviewNaggingRequest = await request.json();

  // Validation
  const validTones: ToneType[] = ['friend', 'mom', 'teacher', 'coach', 'tsundere', 'cold'];
  if (!validTones.includes(body.tone)) {
    return NextResponse.json({ error: 'Invalid tone' }, { status: 400 });
  }

  // 목표 조회
  const { data: goal, error: goalError } = await supabase
    .from('jansori_goals')
    .select('title, description, situation')
    .eq('id', body.goal_id)
    .eq('user_id', user.id)
    .single();

  if (goalError || !goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }

  // 프로필 조회
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .single();

  const userName = profile?.nickname || 'User';

  // 잔소리 생성
  const message = await generateNagging(
    body.tone,
    goal.title,
    goal.description,
    userName,
    goal.situation
  );

  // 히스토리에 저장
  await supabase.from('jansori_history').insert({
    user_id: user.id,
    goal_id: body.goal_id,
    message,
    tone: body.tone,
  });

  return NextResponse.json({
    message,
    tone: body.tone,
    goal_title: goal.title,
  });
}
