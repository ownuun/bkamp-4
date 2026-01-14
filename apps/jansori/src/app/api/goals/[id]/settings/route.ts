import { createClient } from '@bkamp/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { UpdateNaggingSettingsRequest } from '@/types';

// GET /api/goals/[id]/settings - 잔소리 설정 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: goalId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: settings, error } = await supabase
    .from('jansori_settings')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ settings });
}

// PUT /api/goals/[id]/settings - 잔소리 설정 저장/업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: goalId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: UpdateNaggingSettingsRequest = await request.json();

  // Validation
  const validTones = ['cold', 'friend', 'mom', 'teacher', 'coach', 'tsundere'];
  if (!validTones.includes(body.tone)) {
    return NextResponse.json({ error: 'Invalid tone' }, { status: 400 });
  }

  const validFrequencies = ['daily', 'weekdays', 'weekends', 'custom'];
  if (!validFrequencies.includes(body.frequency)) {
    return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
  }

  if (!body.time_slots || body.time_slots.length === 0) {
    return NextResponse.json(
      { error: 'At least one time slot is required' },
      { status: 400 }
    );
  }

  if (body.time_slots.length > 3) {
    return NextResponse.json(
      { error: 'Maximum 3 time slots allowed' },
      { status: 400 }
    );
  }

  // 기존 설정 확인
  const { data: existing } = await supabase
    .from('jansori_settings')
    .select('id')
    .eq('goal_id', goalId)
    .eq('user_id', user.id)
    .single();

  let settings;
  let error;

  if (existing) {
    // 업데이트
    const result = await supabase
      .from('jansori_settings')
      .update({
        tone: body.tone,
        frequency: body.frequency,
        custom_days: body.custom_days || null,
        time_slots: body.time_slots,
        is_enabled: body.is_enabled,
      })
      .eq('id', existing.id)
      .select()
      .single();
    settings = result.data;
    error = result.error;
  } else {
    // 새로 생성
    const result = await supabase
      .from('jansori_settings')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        tone: body.tone,
        frequency: body.frequency,
        custom_days: body.custom_days || null,
        time_slots: body.time_slots,
        is_enabled: body.is_enabled,
      })
      .select()
      .single();
    settings = result.data;
    error = result.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings });
}
