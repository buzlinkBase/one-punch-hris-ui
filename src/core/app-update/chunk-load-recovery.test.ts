import { describe, expect, it } from "vitest";
import {
  RELOAD_COOLDOWN_MS,
  isChunkLoadError,
  shouldReloadForNewVersion,
} from "./chunk-load-recovery";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("isChunkLoadError", () => {
  it.each([
    "Failed to fetch dynamically imported module: https://hris.onepunch.site/assets/work-rotation-list-Gq46qPMX.js",
    "Importing a module script failed.",
    "error loading dynamically imported module: https://x/assets/a.js",
    "Unable to preload CSS for /assets/a.css",
  ])("recognises %s", (message) => {
    expect(isChunkLoadError(new TypeError(message))).toBe(true);
  });

  it("ignores other errors", () => {
    expect(isChunkLoadError(new Error("Request failed with status 500"))).toBe(
      false,
    );
    expect(isChunkLoadError(undefined)).toBe(false);
  });
});

describe("shouldReloadForNewVersion", () => {
  const now = 1_000_000;

  it("allows the first reload", () => {
    expect(shouldReloadForNewVersion(memoryStorage(), now)).toBe(true);
  });

  it("refuses a second reload within the cooldown, so a missing file can't loop", () => {
    const storage = memoryStorage({
      "app-update:last-reload": String(now - 5_000),
    });
    expect(shouldReloadForNewVersion(storage, now)).toBe(false);
  });

  it("allows another reload once the cooldown has passed (e.g. the next deploy)", () => {
    const storage = memoryStorage({
      "app-update:last-reload": String(now - RELOAD_COOLDOWN_MS - 1),
    });
    expect(shouldReloadForNewVersion(storage, now)).toBe(true);
  });

  it("refuses when storage is unavailable", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {},
    };
    expect(shouldReloadForNewVersion(blocked, now)).toBe(false);
  });
});
