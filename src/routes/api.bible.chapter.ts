import { createFileRoute } from "@tanstack/react-router";
import { parseEsvChapter, parseNltChapter, type EsvPassageResponse } from "@/lib/esv";

export const Route = createFileRoute("/api/bible/chapter")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const book = url.searchParams.get("book");
        const chapter = Number(url.searchParams.get("chapter"));
        const translation = url.searchParams.get("translation");

        if (!book || !chapter || !translation) {
          return Response.json(
            { error: "book, chapter, and translation are required." },
            { status: 400 },
          );
        }

        if (translation === "ESV") {
          const apiKey = process.env.ESV_API_KEY;
          if (!apiKey) {
            return Response.json(
              { error: "Missing ESV_API_KEY server environment variable." },
              { status: 500 },
            );
          }

          const upstream = new URL("https://api.esv.org/v3/passage/text/");
          upstream.searchParams.set("q", `${book} ${chapter}`);
          upstream.searchParams.set("include-passage-references", "false");
          upstream.searchParams.set("include-verse-numbers", "true");
          upstream.searchParams.set("include-first-verse-numbers", "true");
          upstream.searchParams.set("include-footnotes", "false");
          upstream.searchParams.set("include-footnote-body", "false");
          upstream.searchParams.set("include-headings", "true");
          upstream.searchParams.set("include-short-copyright", "false");
          upstream.searchParams.set("include-copyright", "false");
          upstream.searchParams.set("line-length", "0");

          const response = await fetch(upstream, {
            headers: {
              Authorization: `Token ${apiKey}`,
            },
          });

          if (!response.ok) {
            const text = await response.text();
            return Response.json(
              { error: `ESV API error (${response.status}): ${text}` },
              { status: response.status },
            );
          }

          const data = (await response.json()) as EsvPassageResponse;
          const normalized = parseEsvChapter(book, chapter, data);
          return Response.json(normalized);
        }

        if (translation === "NLT") {
          const apiKey = process.env.NLT_API_KEY;
          if (!apiKey) {
            return Response.json(
              { error: "Missing NLT_API_KEY server environment variable." },
              { status: 500 },
            );
          }

          const upstream = new URL("https://api.nlt.to/api/passages");
          upstream.searchParams.set("ref", `${book}.${chapter}`);
          upstream.searchParams.set("version", "NLT");
          upstream.searchParams.set("key", apiKey);

          const response = await fetch(upstream);
          if (!response.ok) {
            const text = await response.text();
            return Response.json(
              { error: `NLT API error (${response.status}): ${text}` },
              { status: response.status },
            );
          }

          const html = await response.text();
          const normalized = parseNltChapter(book, chapter, html);
          return Response.json(normalized);
        }

        return Response.json(
          { error: `Unsupported licensed translation: ${translation}` },
          { status: 400 },
        );
      },
    },
  },
});
