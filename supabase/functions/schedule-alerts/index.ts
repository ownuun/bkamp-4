// Marathon Alert - Schedule Alerts Edge Function
// This function creates scheduled alert records when a user sets up alerts for a marathon

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AlertSettings {
  marathon_id: string;
  alert_10min: boolean;
  alert_5min: boolean;
  alert_1min: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get the authorization header to identify the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from the token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const settings: AlertSettings = await req.json();

    if (!settings.marathon_id) {
      return new Response(
        JSON.stringify({ error: "marathon_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get marathon registration time
    const { data: marathon, error: marathonError } = await supabase
      .from("marathons")
      .select("registration_opens_at")
      .eq("id", settings.marathon_id)
      .single();

    if (marathonError || !marathon) {
      return new Response(JSON.stringify({ error: "Marathon not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const regTime = new Date(marathon.registration_opens_at);
    const now = new Date();

    // Don't create alerts for past events
    if (regTime <= now) {
      return new Response(
        JSON.stringify({ error: "Registration has already opened" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Delete existing scheduled alerts for this user and marathon
    await supabase
      .from("scheduled_alerts")
      .delete()
      .eq("user_id", user.id)
      .eq("marathon_id", settings.marathon_id)
      .eq("status", "pending");

    // Create new scheduled alerts based on settings
    const alertsToCreate: {
      user_id: string;
      marathon_id: string;
      alert_type: string;
      scheduled_for: string;
      status: string;
    }[] = [];

    if (settings.alert_10min) {
      const alertTime = new Date(regTime.getTime() - 10 * 60 * 1000);
      if (alertTime > now) {
        alertsToCreate.push({
          user_id: user.id,
          marathon_id: settings.marathon_id,
          alert_type: "10min",
          scheduled_for: alertTime.toISOString(),
          status: "pending",
        });
      }
    }

    if (settings.alert_5min) {
      const alertTime = new Date(regTime.getTime() - 5 * 60 * 1000);
      if (alertTime > now) {
        alertsToCreate.push({
          user_id: user.id,
          marathon_id: settings.marathon_id,
          alert_type: "5min",
          scheduled_for: alertTime.toISOString(),
          status: "pending",
        });
      }
    }

    if (settings.alert_1min) {
      const alertTime = new Date(regTime.getTime() - 1 * 60 * 1000);
      if (alertTime > now) {
        alertsToCreate.push({
          user_id: user.id,
          marathon_id: settings.marathon_id,
          alert_type: "1min",
          scheduled_for: alertTime.toISOString(),
          status: "pending",
        });
      }
    }

    // Insert new alerts
    if (alertsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("scheduled_alerts")
        .insert(alertsToCreate);

      if (insertError) {
        throw insertError;
      }
    }

    // Also update the alert_settings table
    const { error: upsertError } = await supabase
      .from("alert_settings")
      .upsert(
        {
          user_id: user.id,
          marathon_id: settings.marathon_id,
          alert_10min: settings.alert_10min,
          alert_5min: settings.alert_5min,
          alert_1min: settings.alert_1min,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,marathon_id",
        }
      );

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertsCreated: alertsToCreate.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Schedule alerts error:", error);
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
