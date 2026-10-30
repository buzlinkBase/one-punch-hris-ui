import type { AxiosRequestConfig } from "axios";
import { apiErrorBody, httpStatusOf } from "./api-error";
import {
  useDeviationAckStore,
  type StatutoryDeviation,
} from "@/core/stores/deviation-ack.store";

/** hrms-api's ProblemDetails type for a save that brings in an unacknowledged DOLE deviation. */
export const DEVIATION_ACK_PROBLEM_TYPE = "statutory-deviation-ack-required";

/** The admin closed the acknowledgment without confirming: nothing was saved, and nothing to report. */
export class DeviationAckCancelledError extends Error {
  constructor() {
    super("The change was not saved.");
    this.name = "DeviationAckCancelledError";
  }
}

export function isDeviationAckCancelled(err: unknown): boolean {
  return err instanceof DeviationAckCancelledError;
}

/** The deviations a 409 lists, or null when the error is anything else. */
export function deviationsOf(err: unknown): StatutoryDeviation[] | null {
  if (httpStatusOf(err) !== 409) return null;
  const problem = apiErrorBody<{ data?: Record<string, unknown> }>(err)?.data;
  if (problem?.type !== DEVIATION_ACK_PROBLEM_TYPE) return null;
  return Array.isArray(problem.deviations)
    ? (problem.deviations as StatutoryDeviation[])
    : [];
}

/**
 * Decorator for a save that hrms-api checks against the statutory (DOLE) defaults: sends it; when
 * the server answers that it brings in a deviation nobody acknowledged yet, asks the admin (the
 * acknowledgment modal), then sends it again with `acknowledgeDeviations=true` -- which the server
 * records as evidence. Cancelling rejects with DeviationAckCancelledError.
 */
export async function withDeviationAck<T>(
  send: (config: AxiosRequestConfig) => Promise<T>,
): Promise<T> {
  try {
    return await send({});
  } catch (err) {
    const deviations = deviationsOf(err);
    if (!deviations) throw err;
    const acknowledged = await useDeviationAckStore
      .getState()
      .request(deviations);
    if (!acknowledged) throw new DeviationAckCancelledError();
    return send({ params: { acknowledgeDeviations: true } });
  }
}
