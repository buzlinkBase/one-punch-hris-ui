import { AxiosError, AxiosHeaders, type AxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEVIATION_ACK_PROBLEM_TYPE,
  DeviationAckCancelledError,
  withDeviationAck,
} from "./deviation-ack";
import { useDeviationAckStore } from "@/core/stores/deviation-ack.store";

const deviation = {
  key: "rate.OVERTIME",
  label: "OVERTIME rate multiplier",
  statutoryValue: "1.25",
  configuredValue: "1.10",
  note: "Below the DOLE minimum.",
};

function conflict(type = DEVIATION_ACK_PROBLEM_TYPE): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("Conflict", "ERR_BAD_REQUEST", config, null, {
    status: 409,
    statusText: "Conflict",
    headers: {},
    config,
    data: { status: 409, data: { type, deviations: [deviation] } },
  });
}

function answerWith(acknowledged: boolean) {
  return useDeviationAckStore.subscribe((state) => {
    if (state.pending) state.answer(acknowledged);
  });
}

afterEach(() => useDeviationAckStore.setState({ pending: null }));

describe("withDeviationAck", () => {
  it("sends once when the server accepts", async () => {
    const send = vi.fn().mockResolvedValue("ok");

    await expect(withDeviationAck(send)).resolves.toBe("ok");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("asks, then resends with acknowledgeDeviations when confirmed", async () => {
    const send = vi
      .fn<(config: AxiosRequestConfig) => Promise<string>>()
      .mockRejectedValueOnce(conflict())
      .mockResolvedValueOnce("saved");
    const unsubscribe = answerWith(true);

    await expect(withDeviationAck(send)).resolves.toBe("saved");
    expect(send).toHaveBeenLastCalledWith({
      params: { acknowledgeDeviations: true },
    });
    unsubscribe();
  });

  it("saves nothing when the admin cancels", async () => {
    const send = vi.fn().mockRejectedValueOnce(conflict());
    const unsubscribe = answerWith(false);

    await expect(withDeviationAck(send)).rejects.toBeInstanceOf(
      DeviationAckCancelledError,
    );
    expect(send).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("passes any other error through", async () => {
    const send = vi.fn().mockRejectedValueOnce(conflict("something-else"));

    await expect(withDeviationAck(send)).rejects.toBeInstanceOf(AxiosError);
  });
});
