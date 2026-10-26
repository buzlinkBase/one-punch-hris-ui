import { describe, expect, it } from "vitest";
import { adjacentIds } from "./adjacent-employees";

describe("adjacentIds", () => {
  const ids = ["a", "b", "c"];

  it("returns both neighbours for a middle record", () => {
    expect(adjacentIds(ids, "b")).toEqual({ prev: "a", next: "c" });
  });

  it("has no previous at the start and no next at the end", () => {
    expect(adjacentIds(ids, "a")).toEqual({ prev: null, next: "b" });
    expect(adjacentIds(ids, "c")).toEqual({ prev: "b", next: null });
  });

  it("returns nothing when the record is not in the list or no id is given", () => {
    expect(adjacentIds(ids, "z")).toEqual({ prev: null, next: null });
    expect(adjacentIds(ids, undefined)).toEqual({ prev: null, next: null });
    expect(adjacentIds([], "a")).toEqual({ prev: null, next: null });
  });
});
