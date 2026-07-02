// delete-account — permanently deletes the signed-in user's account and data.
// Called from the app (native and web) via supabase.functions.invoke, so it
// works in the Capacitor build where TanStack server functions are unavailable.
// Required for App Store Guideline 5.1.1(v): in-app account deletion.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Identify the caller from their JWT — a user may only delete themselves.
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Not authenticated" }, 401);

    const { data, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    const user = data?.user;
    if (userError || !user) return json({ error: "Not authenticated" }, 401);

    // Explicitly remove user-owned rows so nothing is orphaned.
    await Promise.all([
      supabaseAdmin.from("bookmarks").delete().eq("user_id", user.id),
      supabaseAdmin.from("notes").delete().eq("user_id", user.id),
      supabaseAdmin.from("prayers").delete().eq("user_id", user.id),
      supabaseAdmin.from("profiles").delete().eq("id", user.id),
    ]);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return json({ error: message }, 500);
  }
});
