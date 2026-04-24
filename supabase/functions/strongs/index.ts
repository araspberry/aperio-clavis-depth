// Strong's tagger — returns per-word Strong's numbers + lexicon for a single verse.
// Designed so we can later swap to a proper tagged corpus (STEPBible, OpenScriptures)
// without changing the client contract.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "tag_verse",
      description: "Tag each significant word in the verse with Strong's number, original-language form, and gloss.",
      parameters: {
        type: "object",
        properties: {
          words: {
            type: "array",
            description: "One entry per significant English word in the verse, in order. Skip articles like 'a', 'the', and pure connectives unless they carry weight.",
            items: {
              type: "object",
              properties: {
                word: { type: "string", description: "The English word as it appears in the verse." },
                strongs: { type: "string", description: "Strong's number, e.g. G3056 or H3068. Empty string if uncertain." },
                original: { type: "string", description: "Greek or Hebrew form, e.g. λόγος" },
                translit: { type: "string", description: "Transliteration, e.g. logos" },
                language: { type: "string", enum: ["Greek", "Hebrew", ""] },
                gloss: { type: "string", description: "One-line gloss of the original word's range of meaning." },
              },
              required: ["word", "strongs", "original", "translit", "language", "gloss"],
              additionalProperties: false,
            },
          },
        },
        required: ["words"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { book, chapter, verse, text } = await req.json();
    if (!book || !chapter || !verse || !text) {
      return new Response(JSON.stringify({ error: "book, chapter, verse, text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isOT = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"].includes(book);
    const lang = isOT ? "Hebrew" : "Greek";

    const systemPrompt = [
      "You are a textual scholar tagging an English Bible verse with the underlying original-language data.",
      `This verse is from ${book}, originally written in ${lang}.`,
      "For each significant English word in order, return the Strong's number (G#### for Greek, H#### for Hebrew), the original-language form, transliteration, language, and a short gloss.",
      "Use accurate, well-attested Strong's numbers. If genuinely uncertain about a particular word, return an empty strongs string for it rather than fabricating one.",
      "Skip pure articles ('a', 'an', 'the') and English-grammar connectives that have no original-language equivalent.",
      "Preserve the order of the verse so the client can align tags to words.",
    ].join(" ");

    const userPrompt = `Tag this verse — ${book} ${chapter}:${verse}\n\n"${text}"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "tag_verse" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Strong's tagger is at capacity. Try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Tagger upstream error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No tagged words returned");
    const parsed = JSON.parse(args);
    return new Response(JSON.stringify({ ref: `${book} ${chapter}:${verse}`, ...parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("strongs error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
