import { createClient } from '@bkamp/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { CreateGoalRequest } from '@/types';

// GET /api/goals - 목표 목록 조회
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: goals, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ goals });
}

// POST /api/goals - 목표 생성
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: CreateGoalRequest = await request.json();

  // Validation
  if (!body.title || body.title.length > 50) {
    return NextResponse.json(
      { error: 'Title is required and must be 50 characters or less' },
      { status: 400 }
    );
  }

  const { data: goal, error } = await supabase
    .from('jansori_goals')
    .insert({
      user_id: user.id,
      title: body.title,
      situation: body.situation || null,
      category: body.category || 'etc',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ goal }, { status: 201 });
}
