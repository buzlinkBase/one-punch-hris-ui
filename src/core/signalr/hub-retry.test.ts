import { describe, expect, it, vi } from "vitest";
import { persistentRetryPolicy, startWithRetry } from "./hub-retry";

const delayAfter = (previousRetryCount: number) =>
  persistentRetryPolicy.nextRetryDelayInMilliseconds({
    previousRetryCount,
    elapsedMilliseconds: 0,
    retryReason: new Error("drop"),
  });

describe("persistentRetryPolicy", () => {
  it("backs off and never gives up", () => {
    expect(delayAfter(0)).toBe(0);
    expect(delayAfter(2)).toBe(5_000);
    expect(delayAfter(4)).toBe(30_000);
    expect(delayAfter(500)).toBe(30_000);
  });
});

describe("startWithRetry", () => {
  it("retries a failed start until it succeeds", async () => {
    vi.useFakeTimers();
    const start = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce();

    const done = startWithRetry(start, () => true);
    await vi.runAllTimersAsync();
    await done;

    expect(start).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("stops retrying once inactive", async () => {
    vi.useFakeTimers();
    let active = true;
    const start = vi.fn<() => Promise<void>>().mockImplementation(() => {
      active = false;
      return Promise.reject(new Error("aborted"));
    });

    const done = startWithRetry(start, () => active);
    await vi.runAllTimersAsync();
    await done;

    expect(start).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
