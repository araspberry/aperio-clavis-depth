// Clavis Search — topical/thematic Bible search via Lovable AI Gateway.
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
      name: "render_search",
      description: "Return a short topical answer and the most relevant Bible passages.",
      parameters: {
        type: "object",
        properties: {
          answer: {
            type: "string",
            description: "2-4 sentences directly answering the user's query. Cite specific scripture references inline. Do not invent verses.",
          },
          passages: {
            type: "array",
            description: "5-8 of the most relevant Bible passages across the canon.",
            items: {
              type: "object",
              properties: {
                book: { type: "string" },
                chapter: { type: "number" },
                verse: { type: "string", description: "Verse or verse-range, e.g. '16' or '4-7'." },
                ref: { type: "string", description: "Display reference, e.g. 'Isaiah 53:5'." },
                text: { type: "string", description: "The verse text in a respected English translation. Be accurate." },
                why: { type: "string", description: "One short sentence on why this passage answers the query." },
              },
              required: ["book", "chapter", "verse", "ref", "text", "why"],
              additionalProperties: false,
            },
          },
        },
        required: ["answer", "passages"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = [
      "You are Clavis — the AI commentary engine inside the Aperio Bible app.",
      "Given a user's topical, thematic, or word-level question, return a concise scholarly answer plus the strongest relevant Bible passages.",
      "Draw on evangelical and historic Christian scholarship.",
      "NEVER invent verse references that do not exist. NEVER fabricate verse text.",
      "Prefer well-known, canonical passages. Vary the books across both testaments where relevant.",
    ].join(" ");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Query: ${query}` },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "render_search" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Clavis is at capacity. Try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Clavis credits exhausted. Add AI credits in your workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Clavis encountered an upstream error." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    if (!args) {
      console.error("No tool call returned:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "Clavis did not return results." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(args, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("clavis-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
