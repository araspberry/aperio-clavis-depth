import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export async function requireAuth(currentHref: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw redirect({ to: "/auth", search: { redirect: currentHref } });
  }
}