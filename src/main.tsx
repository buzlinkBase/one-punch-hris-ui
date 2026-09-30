import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.tsx";
import { reloadForNewVersion } from "./core/app-update/chunk-load-recovery";

// A page chunk from the previous deploy is gone: reload once to get the new build. When a
// reload was just tried, let the error through so the route's error screen shows instead.
window.addEventListener("vite:preloadError", (event) => {
  if (reloadForNewVersion()) event.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
