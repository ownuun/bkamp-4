import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { generateNagging } from '@/lib/openai';
import { ToneType } from '@/types';

let supabaseAdmin: SupabaseClient | null = null;
let vapidConfigured = false;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdmin;
}

function configureVapid(): void {
  if (!vapidConfigured && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:admin@jansori.app',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    vapidConfigured = true;
  }
}

// GET /api/cron/test - 푸시 구독이 있는 사용자의 첫 번째 목표에 테스트 잔소리 전송
export async function GET() {
  const db = getSupabaseAdmin();
  configureVapid();

  try {
    // 먼저 활성 푸시 구독이 있는 사용자 찾기
    const { data: activeSub } = await db
      .from('push_subscriptions')
      .select('user_id')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!activeSub) {
      return NextResponse.json({ error: 'No active push subscriptions found' }, { status: 404 });
    }

    // 해당 사용자의 첫 번째 활성 설정 조회
    const { data: setting, error } = await db
      .from('jansori_settings')
      .select(`
        *,
        jansori_goals (id, title, description, situation, user_id)
      `)
      .eq('is_enabled', true)
      .eq('user_id', activeSub.user_id)
      .limit(1)
      .single();

    if (error || !setting) {
      return NextResponse.json({ error: 'No active settings found for subscribed user', details: error?.message }, { status: 404 });
    }

    const goal = setting.jansori_goals as {
      id: string;
      title: string;
      description: string | null;
      situation: string | null;
      user_id: string;
    } | null;

    if (!goal) {
      return NextResponse.json({ error: 'No goal found' }, { status: 404 });
    }

    // 사용자 프로필 조회
    const { data: profile } = await db
      .from('profiles')
      .select('nickname')
      .eq('id', goal.user_id)
      .single();

    const userName = profile?.nickname || 'User';

    // 잔소리 생성
    const message = await generateNagging(
      setting.tone as ToneType,
      goal.title,
      goal.description,
      userName,
      goal.situation
    );

    // 히스토리 저장
    await db.from('jansori_history').insert({
      user_id: goal.user_id,
      goal_id: goal.id,
      message,
      tone: setting.tone,
    });

    // 푸시 알림 전송
    console.log('Looking for subscriptions for user:', goal.user_id);

    // 모든 구독 조회 (디버그용)
    const { data: allSubs } = await db.from('push_subscriptions').select('*');
    console.log('All subscriptions in DB:', allSubs);

    const { data: subscriptions } = await db
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', goal.user_id)
      .eq('is_active', true);

    let pushSent = false;
    const pushErrors: string[] = [];

    for (const sub of subscriptions || []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: '잔소리',
            body: message,
            url: `/goals/${goal.id}`,
          })
        );
        pushSent = true;
      } catch (pushError: unknown) {
        const errMsg = pushError instanceof Error ? pushError.message : 'Unknown error';
        pushErrors.push(errMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message,
      goal: goal.title,
      tone: setting.tone,
      userName,
      pushSent,
      subscriptionCount: subscriptions?.length || 0,
      pushErrors: pushErrors.length > 0 ? pushErrors : undefined,
      debug: {
        goalUserId: goal.user_id,
        allSubscriptions: allSubs,
      },
    });
  } catch (error) {
    console.error('Test cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
