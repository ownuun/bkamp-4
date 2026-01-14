import { createClient } from '@bkamp/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/push/subscribe - 푸시 알림 구독
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  console.log('Subscribing user:', user.id, 'endpoint:', endpoint.substring(0, 50));

  // 기존 구독 삭제 후 새로 삽입
  const { error: deleteError } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Delete error:', deleteError);
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .insert({
      user_id: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      is_active: true,
    })
    .select();

  console.log('Insert result:', { data, error });

  if (error) {
    console.error('Failed to save subscription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// DELETE /api/push/subscribe - 푸시 알림 구독 해제
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint } = body;

  await supabase
    .from('push_subscriptions')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);

  return NextResponse.json({ success: true });
}
