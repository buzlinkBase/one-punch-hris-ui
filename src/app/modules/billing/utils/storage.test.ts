import { describe, expect, it } from "vitest";
import {
  blockPrice,
  blocksToMb,
  cycleBreakdown,
  describeBlocks,
  exceedsLimit,
  formatStorage,
  gaugePercent,
  limitAfterReduction,
  perCycle,
  storageBannerKind,
  storageHeadline,
} from "./storage";

describe("formatStorage", () => {
  it("shows MB below a gigabyte and GB above", () => {
    expect(formatStorage(512)).toBe("512 MB");
    expect(formatStorage(1024)).toBe("1 GB");
    expect(formatStorage(51200)).toBe("50 GB");
    expect(formatStorage(1536)).toBe("1.5 GB");
    expect(formatStorage(112640)).toBe("110 GB");
  });

  it("calls no maximum unlimited", () => {
    expect(formatStorage(null)).toBe("Unlimited");
    expect(formatStorage(undefined)).toBe("Unlimited");
  });
});

describe("storageHeadline", () => {
  it("reads like the product spec: used of total, and what is left", () => {
    expect(
      storageHeadline({ usedMb: 46080, limitMb: 112640, availableMb: 66560 }),
    ).toBe("45 GB used of 110 GB -- 65 GB available");
  });

  it("does not pretend usage is zero when it could not be measured", () => {
    expect(
      storageHeadline({ usedMb: null, limitMb: 20480, availableMb: null }),
    ).toBe("Usage unavailable -- 20 GB in total");
  });

  it("has nothing left to show for an unlimited plan", () => {
    expect(
      storageHeadline({ usedMb: 2048, limitMb: null, availableMb: null }),
    ).toBe("2 GB used of Unlimited");
  });
});

describe("storageBannerKind", () => {
  const at = (level: "Normal" | "Warning" | "Critical") => ({
    level,
    usedMb: 1,
    limitMb: 10,
  });

  it("stays quiet below 80%", () => {
    expect(storageBannerKind(at("Normal"))).toBeNull();
  });

  it("is a subtle warning from 80% and high-priority from 95%", () => {
    expect(storageBannerKind(at("Warning"))).toBe("warning");
    expect(storageBannerKind(at("Critical"))).toBe("critical");
  });

  it("says nothing when usage is unknown, the plan is unlimited, or nothing loaded", () => {
    expect(
      storageBannerKind({ level: "Critical", usedMb: null, limitMb: 10 }),
    ).toBeNull();
    expect(
      storageBannerKind({ level: "Critical", usedMb: 9, limitMb: null }),
    ).toBeNull();
    expect(storageBannerKind(undefined)).toBeNull();
  });
});

describe("gaugePercent", () => {
  it("keeps the bar inside its track", () => {
    expect(gaugePercent(65)).toBe(65);
    expect(gaugePercent(130)).toBe(100);
    expect(gaugePercent(-3)).toBe(0);
    expect(gaugePercent(null)).toBe(0);
  });
});

describe("reducing blocks", () => {
  const holding = { blocks: 3, blockMb: 51200 };

  it("takes the dropped blocks off the limit", () => {
    expect(limitAfterReduction(174080, holding, 1)).toBe(71680);
    expect(limitAfterReduction(174080, holding, 0)).toBe(20480);
  });

  it("has no limit to reduce while unlimited", () => {
    expect(limitAfterReduction(null, holding, 1)).toBeNull();
  });

  it("flags usage that would no longer fit", () => {
    expect(exceedsLimit(80000, 71680)).toBe(true);
    expect(exceedsLimit(71680, 71680)).toBe(false);
    expect(exceedsLimit(null, 71680)).toBe(false);
    expect(exceedsLimit(80000, null)).toBe(false);
  });
});

describe("blocks", () => {
  it("adds blocks x size", () => {
    expect(blocksToMb(2, 51200)).toBe(102400);
  });

  it("describes a purchase", () => {
    expect(describeBlocks(1, 51200)).toBe("1 x 50 GB block");
    expect(describeBlocks(2, 51200)).toBe("2 x 50 GB blocks");
  });

  it("adds the plan and the storage add-ons into one total per billing cycle", () => {
    expect(cycleBreakdown({ planPrice: 2500, addOnsTotal: 800 })).toEqual({
      plan: 2500,
      addOns: 800,
      total: 3300,
    });
  });
});

describe("billing cycle prices", () => {
  const offering = { monthlyPrice: 400, annualPrice: 4000 };

  it("charges a monthly account the monthly price and an annual one the annual price", () => {
    expect(blockPrice(offering, "Monthly")).toBe(400);
    expect(blockPrice(offering, "Annual")).toBe(4000);
  });

  it("labels the amount per month or per year", () => {
    expect(perCycle("Monthly")).toBe("/ month");
    expect(perCycle("Annual")).toBe("/ year");
  });
});
