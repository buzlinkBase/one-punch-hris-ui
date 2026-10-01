import { describe, expect, it } from "vitest";
import { CROP_PRESETS, fitWithin } from "./image-processing";

describe("fitWithin", () => {
  it("shrinks to the bounds, keeping the shape", () => {
    expect(fitWithin(4000, 3000, 1024, 512)).toEqual({
      width: 683,
      height: 512,
    });
    expect(fitWithin(3000, 4000, 512, 512)).toEqual({
      width: 384,
      height: 512,
    });
    expect(fitWithin(3000, 3000, 512, 512)).toEqual({
      width: 512,
      height: 512,
    });
  });

  it("never enlarges a small image", () => {
    expect(fitWithin(200, 100, 1024, 512)).toEqual({ width: 200, height: 100 });
  });

  it("handles a very wide logo and an empty area", () => {
    expect(fitWithin(3000, 300, 1024, 512)).toEqual({
      width: 1024,
      height: 102,
    });
    expect(fitWithin(0, 100, 512, 512)).toEqual({ width: 0, height: 0 });
  });
});

describe("CROP_PRESETS", () => {
  it("makes square photos and keeps logos in their own shape", () => {
    expect(CROP_PRESETS.photo.aspect).toBe(1);
    expect(CROP_PRESETS.photo.cropShape).toBe("round");
    expect(CROP_PRESETS.logo.aspect).toBeNull();
    expect(CROP_PRESETS.logo.fallbackType).toBe("image/png");
  });
});
