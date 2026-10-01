import { describe, expect, it } from "vitest";
import {
  IMAGE_MAX_BYTES,
  IMAGE_SOURCE_MAX_BYTES,
  imageFileProblem,
  imageSourceProblem,
} from "./image-file";

describe("imageSourceProblem", () => {
  it("lets a large photo through to be cropped and shrunk", () => {
    expect(
      imageSourceProblem({ type: "image/jpeg", size: IMAGE_SOURCE_MAX_BYTES }),
    ).toBeNull();
  });

  it("refuses files over 20 MB and other types", () => {
    expect(
      imageSourceProblem({
        type: "image/jpeg",
        size: IMAGE_SOURCE_MAX_BYTES + 1,
      }),
    ).toMatch(/20 MB/);
    expect(imageSourceProblem({ type: "image/gif", size: 10 })).toMatch(
      /PNG, JPG or WebP/,
    );
  });
});

describe("imageFileProblem", () => {
  it("accepts PNG, JPG and WebP up to 2 MB", () => {
    expect(imageFileProblem({ type: "image/png", size: 1000 })).toBeNull();
    expect(
      imageFileProblem({ type: "image/jpeg", size: IMAGE_MAX_BYTES }),
    ).toBeNull();
    expect(imageFileProblem({ type: "image/webp", size: 10 })).toBeNull();
  });

  it("refuses other types, empty files and files over 2 MB", () => {
    expect(imageFileProblem({ type: "image/svg+xml", size: 10 })).toMatch(
      /PNG, JPG or WebP/,
    );
    expect(imageFileProblem({ type: "application/pdf", size: 10 })).toMatch(
      /PNG, JPG or WebP/,
    );
    expect(imageFileProblem({ type: "image/png", size: 0 })).toBe(
      "The file is empty.",
    );
    expect(
      imageFileProblem({ type: "image/png", size: IMAGE_MAX_BYTES + 1 }),
    ).toMatch(/2 MB/);
  });
});
