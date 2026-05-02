import { supabase } from "@/integrations/supabase/client";
import type { ClavisCommentary } from "@/data/clavis";
import type { ClavisTone } from "@/lib/aperio-store";

export function getClavisQueryKey(
  book: string,
  chapter: number,
  selectedVerse: number | null,
  tone: ClavisTone,
) {
  return ["clavis", book, chapter, selectedVerse, tone] as const;
}

export async function fetchClavisCommentary({
  book,
  chapter,
  selectedVerse,
  tone,
  passageText,
}: {
  book: string;
  chapter: number;
  selectedVerse: number | null;
  tone: ClavisTone;
  passageText?: string;
}) {
  const { data, error } = await supabase.functions.invoke("clavis", {
    body: {
      book,
      chapter,
      verse: selectedVerse ?? undefined,
      tone,
      passageText,
    },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.commentary as ClavisCommentary;
}
