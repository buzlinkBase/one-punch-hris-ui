import { describe, expect, it } from "vitest";
import { keepAvailable, recordVisit, togglePinned } from "./nav-shortcuts.util";

describe("recordVisit", () => {
  it("puts the newest visit first without duplicates", () => {
    expect(recordVisit(["/a", "/b", "/c"], "/c")).toEqual(["/c", "/a", "/b"]);
  });

  it("caps the list", () => {
    expect(recordVisit(["/a", "/b"], "/c", 2)).toEqual(["/c", "/a"]);
  });

  it("leaves the list alone when the page is already first", () => {
    expect(recordVisit(["/a", "/b"], "/a")).toEqual(["/a", "/b"]);
  });
});

describe("togglePinned", () => {
  it("pins and unpins", () => {
    expect(togglePinned(["/a"], "/b")).toEqual(["/a", "/b"]);
    expect(togglePinned(["/a", "/b"], "/a")).toEqual(["/b"]);
  });

  it("refuses a new pin past the cap but still allows unpinning", () => {
    expect(togglePinned(["/a", "/b"], "/c", 2)).toEqual(["/a", "/b"]);
    expect(togglePinned(["/a", "/b"], "/a", 2)).toEqual(["/b"]);
  });
});

describe("keepAvailable", () => {
  it("drops pages the user can no longer open, keeping order", () => {
    expect(keepAvailable(["/a", "/b", "/c"], new Set(["/c", "/a"]))).toEqual([
      "/a",
      "/c",
    ]);
  });
});
