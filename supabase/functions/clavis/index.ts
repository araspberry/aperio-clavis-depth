// Clavis — AI commentary engine for Aperio.
// Generates structured commentary for any Bible passage via Lovable AI Gateway.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Tone = "scholarly" | "devotional" | "balanced" | "auto";

function tonePrompt(tone: Tone): string {
  switch (tone) {
    case "scholarly":
      return "Write with the rigor of a seminary professor — engage Greek/Hebrew, manuscript history, theological tradition, and exegetical detail.";
    case "devotional":
      return "Write warmly and pastorally — speak to the heart, draw out invitation and comfort, while staying anchored in the text.";
    case "auto":
      return "Adapt your tone to the passage: rigorous where the text invites study, tender where it invites contemplation.";
    case "balanced":
    default:
      return "Write with both scholarly precision and pastoral warmth — combine careful exegesis with accessible application.";
  }
}

const tools = [
  {
    type: "function",
    function: {
      name: "render_commentary",
      description: "Return structured Clavis commentary for a Bible passage.",
      parameters: {
        type: "object",
        properties: {
          overview: { type: "string", description: "2-4 sentences summarizing what the passage is doing in its larger context." },
          theology: { type: "string", description: "2-4 sentences on the theological significance and how it fits the larger biblical story." },
          context: { type: "string", description: "2-4 sentences on the historical, cultural, and literary background." },
          application: { type: "string", description: "2-3 sentences inviting the reader to apply the passage today." },
          lexicon: {
            type: "array",
            description: "2-4 of the most important original-language words in this passage.",
            items: {
              type: "object",
              properties: {
                word: { type: "string", description: "English gloss" },
                original: { type: "string", description: "Original Greek or Hebrew word" },
                language: { type: "string", enum: ["Greek", "Hebrew"] },
                strongs: { type: "string", description: "Strong's number, e.g. G3056 or H3068" },
                translit: { type: "string" },
                definition: { type: "string" },
                usage: { type: "string", description: "How the word is used in this passage and across Scripture" },
                occurrences: { type: "number", description: "Approximate occurrences in the canon (estimate is fine)" },
              },
              required: ["word", "original", "language", "strongs", "translit", "definition", "usage", "occurrences"],
              additionalProperties: false,
            },
          },
          crossRefs: {
            type: "array",
            description: "3-5 of the strongest cross references.",
            items: {
              type: "object",
              properties: {
                ref: { type: "string", description: "e.g. 'Genesis 1:1'" },
                text: { type: "string", description: "The cross-reference verse text (short)" },
                why: { type: "string", description: "One sentence explaining the connection" },
              },
              required: ["ref", "text", "why"],
              additionalProperties: false,
            },
          },
          manuscript: {
            type: "object",
            properties: {
              tradition: { type: "string", description: "What text family / critical edition this comes from." },
              variants: { type: "string", description: "Notable textual variants in this passage, or 'none significant'." },
              transmission: { type: "string", description: "Earliest manuscripts attesting this passage." },
            },
            required: ["tradition", "variants", "transmission"],
            additionalProperties: false,
          },
        },
        required: ["overview", "theology", "context", "application", "lexicon", "crossRefs", "manuscript"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { book, chapter, verse, tone = "balanced", passageText } = await req.json();
    if (!book || !chapter) {
      return new Response(JSON.stringify({ error: "book and chapter are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const ref = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

    const systemPrompt = [
      "You are Clavis — the AI commentary engine inside the Aperio Bible app.",
      "You produce trustworthy, christ-centered, historically grounded commentary on Scripture.",
      "You draw on the consensus of evangelical and historic Christian scholarship.",
      "You are honest about textual variants and uncertainty when they exist.",
      "Never invent verse references that do not exist. Never fabricate Strong's numbers — if unsure, say so plainly in the usage notes.",
      tonePrompt(tone as Tone),
    ].join(" ");

    // Note: do NOT quote the passage text verbatim at length — Gemini may block with
    // finish_reason "RECITATION" when scripture is quoted back. Use it only as grounding.
    const groundingBlock = passageText
      ? `\n\nGrounding text (for your reference only — do NOT quote at length, paraphrase or reference by clause):\n"""${String(passageText).slice(0, 1200)}"""`
      : "";

    const userPrompt = verse
      ? [
          `Generate Clavis verse-level micro-commentary on ${ref}.`,
          `\n\nThis is a SINGLE-VERSE request. Your entire commentary MUST focus on ${book} ${chapter}:${verse} specifically.`,
          `\nDO NOT summarize the whole chapter. DO NOT drift into chapter-level overview. Stay anchored to this one verse.`,
          `\n\nRequirements for each field:`,
          `\n- overview: the central claim or main point of verse ${verse} itself (not the chapter).`,
          `\n- theology: the doctrinal significance of verse ${verse} read in its context.`,
          `\n- context: the immediate literary and historical context surrounding verse ${verse} (what comes just before and after, the setting).`,
          `\n- application: practical meaning anchored specifically to what verse ${verse} says.`,
          `\n\nLexicon entries must be drawn from words actually present in verse ${verse}.`,
          `\nCross-references should illuminate verse ${verse} specifically.`,
          `\n\nDo not quote the verse verbatim — paraphrase or reference by clause.`,
          groundingBlock,
        ].join("")
      : [
          `Generate Clavis commentary on ${ref}.`,
          `\nProvide chapter-level commentary covering the whole chapter's flow and themes.`,
          `\nDo not quote the passage verbatim — paraphrase or reference by clause.`,
          groundingBlock,
        ].join("");

    const callModel = (model: string) =>
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools,
          tool_choice: { type: "function", function: { name: "render_commentary" } },
        }),
      });

    let response = await callModel("google/gemini-2.5-flash");

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Clavis is at capacity right now. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Clavis credits exhausted. Please add AI credits in your workspace settings." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Clavis encountered an upstream error." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let data = await response.json();
    let toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    let args = toolCall?.function?.arguments;
    const finish = data?.choices?.[0]?.finish_reason;
    const native = data?.choices?.[0]?.native_finish_reason;

    // Retry on Gemini RECITATION block or any missing tool call, using GPT as fallback.
    if (!args || finish === "error" || native === "RECITATION") {
      console.warn("Primary model failed (finish:", finish, native, "), retrying with openai/gpt-5-mini");
      response = await callModel("openai/gpt-5-mini");
      if (response.ok) {
        data = await response.json();
        toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
        args = toolCall?.function?.arguments;
      }
    }

    if (!args) {
      console.error("No tool call returned:", JSON.stringify(data).slice(0, 800));
      return new Response(JSON.stringify({ error: "Clavis did not return structured commentary." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const commentary = JSON.parse(args);
    return new Response(JSON.stringify({ commentary, ref, tone }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("clavis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});