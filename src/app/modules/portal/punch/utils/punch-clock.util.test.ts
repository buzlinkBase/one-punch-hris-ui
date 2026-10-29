import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  parseWallClock,
  secondsUntilNextPunch,
} from "./punch-clock.util";

describe("secondsUntilNextPunch", () => {
  it("is zero when the next punch is already allowed", () => {
    expect(secondsUntilNextPunch(null, "2026-10-29T08:00:00", 0)).toBe(0);
  });

  it("counts down from the server's own clock", () => {
    expect(
      secondsUntilNextPunch("2026-10-29T08:05:00", "2026-10-29T08:01:00", 0),
    ).toBe(240);
  });

  it("subtracts the time since the response arrived", () => {
    expect(
      secondsUntilNextPunch(
        "2026-10-29T08:05:00",
        "2026-10-29T08:01:00",
        30_000,
      ),
    ).toBe(210);
  });

  it("never goes below zero", () => {
    expect(
      secondsUntilNextPunch(
        "2026-10-29T08:05:00",
        "2026-10-29T08:04:00",
        90_000,
      ),
    ).toBe(0);
  });
});

describe("formatCountdown", () => {
  it("pads the seconds", () => {
    expect(formatCountdown(245)).toBe("4:05");
    expect(formatCountdown(0)).toBe("0:00");
  });
});

describe("parseWallClock", () => {
  it("ignores a trailing Z so the hour is the same on any device", () => {
    expect(parseWallClock("2026-10-29T08:00:00Z").hour()).toBe(8);
    expect(parseWallClock("2026-10-29T08:00:00").hour()).toBe(8);
  });
});
