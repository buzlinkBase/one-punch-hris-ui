import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DeviceCommandRecord } from "../models/api/response/device-command-record.model";
import type { SetEmployeeCommandPayload } from "../models/api/request/set-employee-command.model";
import type { SyncBioPayload } from "../models/api/request/sync-bio.model";
import type { EnrollFPPayload } from "../models/api/request/enroll-fp.model";
import type { EnrollFacePayload } from "../models/api/request/enroll-face.model";
import type { PullAttPayload } from "../models/api/request/pull-att.model";

const ENDPOINT = buildApiUrl(API_PREFIX.adms, "commands");

export const commandsApi = {
  getPending(sn: string): Promise<DeviceCommandRecord[]> {
    return httpClient.getUnwrapped<DeviceCommandRecord[]>(
      `${ENDPOINT}?SN=${encodeURIComponent(sn)}`,
    );
  },

  syncEmployees(
    sn: string,
    payload: SetEmployeeCommandPayload[],
  ): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/sync-employees?SN=${encodeURIComponent(sn)}`,
      payload,
    );
  },

  syncBiometric(sn: string, payload: SyncBioPayload[]): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/sync-biometric?SN=${encodeURIComponent(sn)}`,
      payload,
    );
  },

  syncFace(sn: string, payload: SyncBioPayload[]): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/sync-face?SN=${encodeURIComponent(sn)}`,
      payload,
    );
  },

  enrollFingerprint(sn: string, payload: EnrollFPPayload): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/enroll-fp?SN=${encodeURIComponent(sn)}`,
      payload,
    );
  },

  enrollFace(sn: string, payload: EnrollFacePayload): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/enroll-face?SN=${encodeURIComponent(sn)}`,
      payload,
    );
  },

  reboot(sn: string): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/reboot?SN=${encodeURIComponent(sn)}`,
    );
  },

  clearLogs(sn: string): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/clear-logs?SN=${encodeURIComponent(sn)}`,
    );
  },

  setTime(sn: string, autoServerTime: boolean): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/set-time?SN=${encodeURIComponent(sn)}&autoServerTime=${autoServerTime}`,
    );
  },

  enableAttendance(sn: string, enable: number): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/enable-attendance?SN=${encodeURIComponent(sn)}&enable=${enable}`,
    );
  },

  clearAdmin(sn: string): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/clear-admin?SN=${encodeURIComponent(sn)}`,
    );
  },

  pullAttendance(payload: PullAttPayload): Promise<void> {
    const { sn, startDate, endDate } = payload;
    return httpClient.post<void>(
      `${ENDPOINT}/pull-attendance?SN=${encodeURIComponent(sn)}&StartDate=${encodeURIComponent(startDate)}&EndDate=${encodeURIComponent(endDate)}`,
    );
  },

  queryTemplates(sn: string, pin?: string, fid?: number): Promise<void> {
    const params = new URLSearchParams();
    if (pin) params.set("pin", pin);
    if (fid !== undefined) params.set("fid", String(fid));
    const qs = params.toString();
    return httpClient.post<void>(
      `${ENDPOINT}/${encodeURIComponent(sn)}/query-templates${qs ? `?${qs}` : ""}`,
    );
  },

  registryReset(sn: string): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/registry?sn=${encodeURIComponent(sn)}`,
    );
  },

  deleteEmployee(sn: string, pin: string): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/delete-employee?SN=${encodeURIComponent(sn)}&pin=${encodeURIComponent(pin)}`,
    );
  },

  deleteFingerprint(
    sn: string,
    pin: string,
    fingerIndex?: number,
  ): Promise<void> {
    const params = new URLSearchParams({ SN: sn, pin });
    if (fingerIndex !== undefined)
      params.set("fingerIndex", String(fingerIndex));
    return httpClient.post<void>(
      `${ENDPOINT}/delete-fingerprint?${params.toString()}`,
    );
  },

  deleteCommand(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}?id=${id}`);
  },
};
