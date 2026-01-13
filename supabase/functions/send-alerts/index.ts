// Marathon Alert - Send Alerts Edge Function
// This function is triggered by a cron job every minute to send scheduled alerts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScheduledAlert {
  id: string;
  user_id: string;
  marathon_id: string;
  alert_type: string;
  scheduled_for: string;
  profiles: {
    email: string;
    push_subscription: object | null;
    push_notifications_enabled: boolean;
    email_notifications_enabled: boolean;
  };
  marathons: {
    name: string;
    registration_opens_at: string;
    registration_url: string | null;
    official_url: string | null;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const oneMinuteFromNow = new Date(now.getTime() + 60000);

    // Fetch pending alerts due within the next minute
    const { data: alerts, error: fetchError } = await supabase
      .from("scheduled_alerts")
      .select(
        `
        *,
        profiles!inner(
          email,
          push_subscription,
          push_notifications_enabled,
          email_notifications_enabled
        ),
        marathons!inner(
          name,
          registration_opens_at,
          registration_url,
          official_url
        )
      `
      )
      .eq("status", "pending")
      .lte("scheduled_for", oneMinuteFromNow.toISOString())
      .gte("scheduled_for", now.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    const results: { id: string; status: string; error?: string }[] = [];

    for (const alert of (alerts as ScheduledAlert[]) || []) {
      try {
        const alertTypeKorean =
          alert.alert_type === "10min"
            ? "10분"
            : alert.alert_type === "5min"
            ? "5분"
            : "1분";

        const notificationTitle = `${alert.marathons.name} 신청 ${alertTypeKorean} 전!`;
        const notificationBody = `곧 등록이 시작됩니다. 준비하세요!`;
        const targetUrl =
          alert.marathons.registration_url ||
          alert.marathons.official_url ||
          "/";

        // Send Web Push if enabled and subscription exists
        if (
          alert.profiles.push_notifications_enabled &&
          alert.profiles.push_subscription &&
          vapidPublicKey &&
          vapidPrivateKey
        ) {
          try {
            // Web push would be sent here using web-push library
            // For Deno, we'd use a different approach or external service
            console.log("Would send push notification:", {
              title: notificationTitle,
              body: notificationBody,
              url: targetUrl,
            });
          } catch (pushError) {
            console.error("Push notification failed:", pushError);
          }
        }

        // Send Email if enabled
        if (alert.profiles.email_notifications_enabled && resendApiKey) {
          try {
            const emailResponse = await fetch(
              "https://api.resend.com/emails",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${resendApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "Marathon Alert <alerts@marathon-alert.com>",
                  to: alert.profiles.email,
                  subject: notificationTitle,
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <h1 style="color: #dc2626;">${notificationTitle}</h1>
                      <p style="font-size: 18px;">${notificationBody}</p>
                      <p style="margin-top: 24px;">
                        <a href="${targetUrl}"
                           style="background-color: #dc2626; color: white; padding: 12px 24px;
                                  text-decoration: none; border-radius: 6px; display: inline-block;">
                          신청 페이지 열기
                        </a>
                      </p>
                      <p style="color: #666; font-size: 14px; margin-top: 32px;">
                        Marathon Alert - 마라톤 신청 알림 서비스
                      </p>
                    </div>
                  `,
                }),
              }
            );

            if (!emailResponse.ok) {
              console.error("Email send failed:", await emailResponse.text());
            }
          } catch (emailError) {
            console.error("Email notification failed:", emailError);
          }
        }

        // Update alert status to sent
        await supabase
          .from("scheduled_alerts")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", alert.id);

        results.push({ id: alert.id, status: "sent" });
      } catch (alertError) {
        console.error("Alert processing failed:", alertError);

        // Mark as failed
        await supabase
          .from("scheduled_alerts")
          .update({
            status: "failed",
            error_message:
              alertError instanceof Error
                ? alertError.message
                : "Unknown error",
          })
          .eq("id", alert.id);

        results.push({
          id: alert.id,
          status: "failed",
          error:
            alertError instanceof Error ? alertError.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Send alerts error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
