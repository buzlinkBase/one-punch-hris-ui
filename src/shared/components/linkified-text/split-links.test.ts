import { describe, expect, it } from "vitest";
import { splitLinks } from "./split-links";

describe("splitLinks", () => {
  it("keeps plain text as a single part", () => {
    expect(splitLinks("Office closed\nFriday")).toEqual([
      { value: "Office closed\nFriday", isLink: false },
    ]);
  });

  it("separates http(s) links from the text around them", () => {
    expect(
      splitLinks("Read https://intranet/notice and http://x.io/a?b=1 today"),
    ).toEqual([
      { value: "Read ", isLink: false },
      { value: "https://intranet/notice", isLink: true },
      { value: " and ", isLink: false },
      { value: "http://x.io/a?b=1", isLink: true },
      { value: " today", isLink: false },
    ]);
  });

  it("does not treat other schemes as links", () => {
    expect(splitLinks("javascript:alert(1)")).toEqual([
      { value: "javascript:alert(1)", isLink: false },
    ]);
  });
});
