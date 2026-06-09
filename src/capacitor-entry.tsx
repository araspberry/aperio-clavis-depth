import { StrictMode, startTransition } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router.capacitor";
import "./styles.css";
import { forwardNativeOAuthCallback } from "./lib/native-auth";

startTransition(() => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Root element not found");
  }

  if (forwardNativeOAuthCallback()) {
    return;
  }

  const router = getRouter();

  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
});
