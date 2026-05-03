import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/read/$book")({
  head: ({ params }) => ({ meta: [{ title: `${params.book} — Chapters | Aperio` }] }),
  component: ReadBookLayout,
});

function ReadBookLayout() {
  return <Outlet />;
}
