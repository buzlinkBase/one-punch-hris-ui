import { describe, expect, it } from "vitest";
import { shouldSignOut, signedOutMessage } from "./signed-out-action";

// An unsigned JWT is enough here -- only the payload's jti is read.
const tokenWithId = (jti: string) =>
  ["header", btoa(JSON.stringify({ jti })), "signature"].join(".");

describe("shouldSignOut", () => {
  it("keeps the session that changed the password", () => {
    expect(
      shouldSignOut(
        { exceptTokenId: "abc", reason: "PasswordChanged" },
        tokenWithId("abc"),
      ),
    ).toBe(false);
  });

  it("signs out every other session", () => {
    expect(
      shouldSignOut(
        { exceptTokenId: "abc", reason: "PasswordChanged" },
        tokenWithId("xyz"),
      ),
    ).toBe(true);
    expect(
      shouldSignOut({ exceptTokenId: "abc", reason: "PasswordChanged" }, null),
    ).toBe(true);
  });

  it("signs out everywhere after a reset", () => {
    expect(
      shouldSignOut(
        { exceptTokenId: null, reason: "PasswordReset" },
        tokenWithId("abc"),
      ),
    ).toBe(true);
  });
});

describe("signedOutMessage", () => {
  it("explains why", () => {
    expect(signedOutMessage("PasswordChanged")).toMatch(
      /changed on another device/,
    );
    expect(signedOutMessage("PasswordReset")).toMatch(/reset/);
    expect(signedOutMessage(undefined)).toBe(
      "You were signed out. Please sign in again.",
    );
  });
});
