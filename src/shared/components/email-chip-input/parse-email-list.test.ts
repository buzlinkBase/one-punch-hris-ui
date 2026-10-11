import { describe, expect, it } from "vitest";
import { isValidEmail, parseEmailList } from "./parse-email-list";

describe("parseEmailList", () => {
  it("splits on commas, semicolons, spaces, tabs and newlines", () => {
    const result = parseEmailList(
      "a@site.com, b@site.com;c@site.com d@site.com\te@site.com\nf@site.com",
      [],
    );
    expect(result.added).toEqual([
      "a@site.com",
      "b@site.com",
      "c@site.com",
      "d@site.com",
      "e@site.com",
      "f@site.com",
    ]);
  });

  it("keeps one of each address, ignoring case and spacing", () => {
    const result = parseEmailList(
      "alex@site.com, ALEX@site.com ; invalid-email, sam@site.com",
      [],
    );
    expect(result.added).toEqual([
      "alex@site.com",
      "invalid-email",
      "sam@site.com",
    ]);
    expect(result.duplicates).toBe(1);
  });

  it("skips addresses already in the list", () => {
    const result = parseEmailList("sam@site.com, new@site.com", [
      "Sam@Site.com",
    ]);
    expect(result.added).toEqual(["new@site.com"]);
    expect(result.duplicates).toBe(1);
  });

  it("stops at the limit and says so", () => {
    const text = Array.from({ length: 105 }, (_, i) => `u${i}@site.com`).join(
      ",",
    );
    const result = parseEmailList(text, []);
    expect(result.added).toHaveLength(100);
    expect(result.truncated).toBe(true);
  });

  it("counts existing addresses toward the limit", () => {
    const existing = Array.from({ length: 99 }, (_, i) => `e${i}@site.com`);
    const result = parseEmailList("a@site.com, b@site.com", existing);
    expect(result.added).toEqual(["a@site.com"]);
    expect(result.truncated).toBe(true);
  });
});

describe("isValidEmail", () => {
  it.each(["jane.doe@example.com", "a+tag@sub.example.co"])(
    "accepts %s",
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(["invalid-email", "a@b", "a..b@site.com", "@site.com", "a@site."])(
    "rejects %s",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});
