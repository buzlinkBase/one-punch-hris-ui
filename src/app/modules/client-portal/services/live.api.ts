import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { AgencyLive, LiveToday } from "../models/api/live.model";

const base = (resource: string) =>
  buildApiUrl(API_PREFIX.clientPortal, resource);

/** Live attendance in the Client Portal: every client right now, one client's shifts, and who gets the "post not covered" emails. */
export const liveApi = {
  agency(): Promise<AgencyLive> {
    return httpClient.getUnwrapped(base("live/agency"));
  },

  today(clientId: string): Promise<LiveToday> {
    return httpClient.getUnwrapped(
      base(`live/today?clientId=${encodeURIComponent(clientId)}`),
    );
  },

  alertSettings(): Promise<{ emails: string }> {
    return httpClient.getUnwrapped(base("live/alert-settings"));
  },

  saveAlertSettings(emails: string): Promise<{ emails: string }> {
    return httpClient.putUnwrapped(base("live/alert-settings"), { emails });
  },
};
