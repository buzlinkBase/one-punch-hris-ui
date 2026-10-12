import { describe, expect, it } from "vitest";
import {
  ATTACHMENT_MAX_BYTES,
  attachmentFileProblem,
  formatFileSize,
} from "./attachment-file.util";

describe("attachmentFileProblem", () => {
  it("accepts images and PDF up to 5 MB", () => {
    expect(
      attachmentFileProblem({
        type: "application/pdf",
        size: ATTACHMENT_MAX_BYTES,
      }),
    ).toBeNull();
    expect(attachmentFileProblem({ type: "image/png", size: 10 })).toBeNull();
  });

  it("refuses other types, empty files and files over 5 MB", () => {
    expect(
      attachmentFileProblem({ type: "application/zip", size: 10 }),
    ).toMatch(/PDF/);
    expect(attachmentFileProblem({ type: "image/png", size: 0 })).toMatch(
      /empty/,
    );
    expect(
      attachmentFileProblem({
        type: "image/png",
        size: ATTACHMENT_MAX_BYTES + 1,
      }),
    ).toMatch(/5 MB/);
  });

  it("refuses a PDF where only images are allowed", () => {
    expect(
      attachmentFileProblem({ type: "application/pdf", size: 10 }, true),
    ).toMatch(/image/);
  });
});

describe("formatFileSize", () => {
  it("shows KB below a megabyte and MB above", () => {
    expect(formatFileSize(340 * 1024)).toBe("340 KB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
});
