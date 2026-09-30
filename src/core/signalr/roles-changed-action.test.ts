import { describe, expect, it } from "vitest";
import { rolesChangedAction } from "./roles-changed-action";

const ACTIVE = "aaaaaaaa-0000-0000-0000-000000000001";
const OTHER = "bbbbbbbb-0000-0000-0000-000000000002";
const REACTIVATED = "cccccccc-0000-0000-0000-000000000003";

describe("rolesChangedAction", () => {
  it("refreshes and tells the user when it's the company they're working in", () => {
    expect(rolesChangedAction(ACTIVE, ACTIVE, [ACTIVE, OTHER])).toBe(
      "refresh-and-notify",
    );
    expect(
      rolesChangedAction(ACTIVE.toUpperCase(), ACTIVE, [ACTIVE, OTHER]),
    ).toBe("refresh-and-notify");
  });

  it("ignores another company the user already has", () => {
    expect(rolesChangedAction(OTHER, ACTIVE, [ACTIVE, OTHER])).toBe("ignore");
  });

  it("refreshes quietly for a company missing from the switcher (reactivated)", () => {
    expect(rolesChangedAction(REACTIVATED, ACTIVE, [ACTIVE, OTHER])).toBe(
      "refresh-silently",
    );
  });

  it("keeps the old behavior when the push has no company", () => {
    expect(rolesChangedAction(undefined, ACTIVE, [ACTIVE])).toBe(
      "refresh-and-notify",
    );
    expect(rolesChangedAction(OTHER, null, [OTHER])).toBe("refresh-and-notify");
  });
});
