import { describe, expect, it } from "vitest";
import {
  NAVIGATION_ITEMS,
  flattenNavPaths,
  getPermissionForPath,
} from "./navigation.const";

describe("NAVIGATION_ITEMS", () => {
  // An untagged item is visible to every member -- including a plain Member, who holds no
  // permissions at all -- which is how the whole Security menu and Holidays & Leave Types used
  // to show up for everyone. Every page, Dashboard included, must be tagged (on itself or an
  // ancestor group).
  it("gates every page on a permission", () => {
    const ungated = flattenNavPaths(NAVIGATION_ITEMS).filter(
      (path) => !getPermissionForPath(path),
    );

    expect(ungated).toEqual([]);
  });
});
