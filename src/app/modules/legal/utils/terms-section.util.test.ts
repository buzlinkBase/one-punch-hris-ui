import { describe, expect, it } from "vitest";
import { termsSectionId, termsSections } from "./terms-section.util";

describe("termsSectionId", () => {
  it("anchors a numbered heading by its number", () => {
    expect(termsSectionId("4. Customer Configuration and Compliance")).toBe(
      "section-4",
    );
  });

  it("slugs a heading without a number", () => {
    expect(termsSectionId("Contact Us!")).toBe("contact-us");
  });
});

describe("termsSections", () => {
  it("lists only the level-2 headings, in order", () => {
    const markdown = "# Title\n\n## 1. One\ntext\n### 1.1 Sub\n## 2. Two\n";

    expect(termsSections(markdown)).toEqual([
      { id: "section-1", title: "1. One" },
      { id: "section-2", title: "2. Two" },
    ]);
  });
});
