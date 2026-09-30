// After a deploy, a tab that was already open still runs the old build and asks for the old,
// content-hashed page chunks, which the new server no longer has. A reload fetches the new
// index.html (served no-cache, see nginx.conf) and with it the new chunk names -- so on that
// specific failure the app reloads itself instead of showing an error.

const LAST_RELOAD_KEY = "app-update:last-reload";
/** A second failure this soon after reloading means the file is really missing -- stop. */
export const RELOAD_COOLDOWN_MS = 30_000;

// Each browser words a failed dynamic import differently.
const CHUNK_LOAD_MESSAGES = [
  "failed to fetch dynamically imported module", // Chrome, Edge
  "importing a module script failed", // Safari
  "error loading dynamically imported module", // Firefox
  "unable to preload css", // Vite's CSS preload
];

export function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const lower = message.toLowerCase();
  return CHUNK_LOAD_MESSAGES.some((m) => lower.includes(m));
}

type SessionStore = Pick<Storage, "getItem" | "setItem">;

/** Whether reloading now is safe: not already tried within the cooldown. */
export function shouldReloadForNewVersion(
  storage: SessionStore,
  now: number,
): boolean {
  try {
    const last = Number(storage.getItem(LAST_RELOAD_KEY) ?? 0);
    return now - last > RELOAD_COOLDOWN_MS;
  } catch {
    // Storage blocked: we couldn't tell a loop apart, so don't risk one.
    return false;
  }
}

function markReloaded(storage: SessionStore, now: number) {
  try {
    storage.setItem(LAST_RELOAD_KEY, String(now));
  } catch {
    // Ignore -- shouldReloadForNewVersion already refuses when storage is unusable.
  }
}

/** Reloads once to pick up the new build. False when a reload was just tried. */
export function reloadForNewVersion(): boolean {
  const now = Date.now();
  if (!shouldReloadForNewVersion(window.sessionStorage, now)) return false;
  markReloaded(window.sessionStorage, now);
  window.location.reload();
  return true;
}
