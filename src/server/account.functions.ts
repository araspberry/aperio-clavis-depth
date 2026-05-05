import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    // Best-effort cleanup of user-owned rows (RLS-protected tables also cascade
    // logically when the auth user is removed, but we delete explicitly here so
    // nothing is orphaned even if FKs aren't set).
    await Promise.all([
      supabaseAdmin.from("bookmarks").delete().eq("user_id", userId),
      supabaseAdmin.from("notes").delete().eq("user_id", userId),
      supabaseAdmin.from("prayers").delete().eq("user_id", userId),
      supabaseAdmin.from("profiles").delete().eq("id", userId),
    ]);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });