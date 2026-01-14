import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { generateNagging } from '@/lib/openai';
import { ToneType } from '@/types';

// Lazy initialization
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
  if (!vapidConfigured) {
    webpush.setVapidDetails(
      'mailto:admin@jansori.app',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    vapidConfigured = true;
  }
}

// GET /api/cron/process-naggings - 스케줄된 잔소리 처리
export async function GET(request: NextRequest) {
  // Cron 시크릿 검증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  configureVapid();

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentDay = now.getDay(); // 0 = Sunday

  console.log(`Processing naggings for ${currentTime}, day ${currentDay}`);

  try {
    // 현재 시간에 활성화된 잔소리 설정 조회
    const { data: allSettings, error } = await db
      .from('jansori_settings')
      .select(`
        *,
        jansori_goals (id, title, description, situation, user_id)
      `)
      .eq('is_enabled', true);

    if (error) {
      console.error('Failed to fetch settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 현재 시간과 매칭되는 설정만 필터링
    const settings = (allSettings || []).filter((setting) => {
      const timeSlots = setting.time_slots as string[] | null;
      return timeSlots && timeSlots.includes(currentTime);
    });

    if (settings.length === 0) {
      return NextResponse.json({ message: 'No naggings to process', count: 0, currentTime });
    }

    let processedCount = 0;

    for (const setting of settings) {
      // 주기 확인
      const shouldSend = checkFrequency(setting.frequency, setting.custom_days, currentDay);
      if (!shouldSend) continue;

      const goal = setting.jansori_goals as { id: string; title: string; description: string | null; situation: string | null; user_id: string } | null;
      if (!goal) continue;

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
      const { data: subscriptions } = await db
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', goal.user_id)
        .eq('is_active', true);

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
              title: 'Jansori',
              body: message,
              goalId: goal.id,
              url: `/goals/${goal.id}`,
            })
          );
        } catch (pushError: unknown) {
          console.error('Push notification failed:', pushError);
          // 만료된 구독 비활성화
          if (pushError instanceof Error && 'statusCode' in pushError) {
            const statusCode = (pushError as { statusCode: number }).statusCode;
            if (statusCode === 410 || statusCode === 404) {
              await db
                .from('push_subscriptions')
                .update({ is_active: false })
                .eq('id', sub.id);
            }
          }
        }
      }

      processedCount++;
    }

    return NextResponse.json({
      message: 'Naggings processed successfully',
      count: processedCount,
    });
  } catch (error) {
    console.error('Cron processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function checkFrequency(
  frequency: string,
  customDays: number[] | null,
  currentDay: number
): boolean {
  switch (frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return currentDay >= 1 && currentDay <= 5;
    case 'weekends':
      return currentDay === 0 || currentDay === 6;
    case 'custom':
      return customDays?.includes(currentDay) ?? false;
    default:
      return false;
  }
}
