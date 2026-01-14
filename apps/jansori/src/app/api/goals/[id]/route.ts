import { createClient } from '@bkamp/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/goals/[id] - 목표 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: goal, error } = await supabase
    .from('jansori_goals')
    .select(
      `
      *,
      jansori_settings (*)
    `
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ goal });
}

// PATCH /api/goals/[id] - 목표 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Validation
  if (body.title && body.title.length > 50) {
    return NextResponse.json(
      { error: 'Title must be 50 characters or less' },
      { status: 400 }
    );
  }

  if (body.situation && body.situation.length > 5000) {
    return NextResponse.json(
      { error: 'Situation must be 5000 characters or less' },
      { status: 400 }
    );
  }

  const { data: goal, error } = await supabase
    .from('jansori_goals')
    .update({
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category && { category: body.category }),
      ...(body.is_active !== undefined && { is_active: body.is_active }),
      ...(body.situation !== undefined && { situation: body.situation }),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ goal });
}

// DELETE /api/goals/[id] - 목표 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('jansori_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
