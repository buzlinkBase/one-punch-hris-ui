import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { birthdayWhen } from "./birthday-when";

const today = dayjs("2026-10-17");

describe("birthdayWhen", () => {
  it("says Today for the day itself", () => {
    expect(birthdayWhen(0, today)).toBe("Today");
  });

  it("says Tomorrow for the next day", () => {
    expect(birthdayWhen(1, today)).toBe("Tomorrow");
  });

  it("gives the countdown and the date for later days", () => {
    expect(birthdayWhen(3, today)).toBe("In 3d · Oct 20");
    expect(birthdayWhen(7, today)).toBe("In 7d · Oct 24");
  });

  it("rolls the date over a month end", () => {
    expect(birthdayWhen(5, dayjs("2026-10-29"))).toBe("In 5d · Nov 3");
  });
});
