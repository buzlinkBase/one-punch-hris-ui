import httpClient from "@/core/http/http-client";
import axiosInstance from "@/core/http/axios.instance";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  AttachmentLinkResponse,
  AttachmentOwnerType,
  AttachmentResponse,
  AttachmentSettingResponse,
} from "../types/attachment.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "attachments");

export const attachmentApi = {
  getSettings(): Promise<AttachmentSettingResponse[]> {
    return httpClient.getUnwrapped<AttachmentSettingResponse[]>(
      `${ENDPOINT}/settings`,
    );
  },

  saveSettings(settings: AttachmentSettingResponse[]): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/settings`, settings);
  },

  /** Attached to the record when `ownerId` is given; otherwise staged until the record is saved. */
  upload(
    ownerType: AttachmentOwnerType,
    file: File,
    ownerId?: string,
  ): Promise<AttachmentResponse> {
    const form = new FormData();
    form.append("file", file);
    return httpClient.postUnwrapped<AttachmentResponse>(
      `${ENDPOINT}/${ownerType}`,
      form,
      {
        params: ownerId ? { ownerId } : undefined,
        headers: { "Content-Type": undefined },
      },
    );
  },

  list(
    ownerType: AttachmentOwnerType,
    ownerId: string,
  ): Promise<AttachmentResponse[]> {
    return httpClient.getUnwrapped<AttachmentResponse[]>(
      `${ENDPOINT}/${ownerType}/${ownerId}`,
    );
  },

  /** The caller's own uploaded-but-unsaved files of this type. */
  listStaged(ownerType: AttachmentOwnerType): Promise<AttachmentResponse[]> {
    return httpClient.getUnwrapped<AttachmentResponse[]>(
      `${ENDPOINT}/${ownerType}/staged`,
    );
  },

  /** Attaches the caller's staged files to a record that was just created. */
  link(
    ownerType: AttachmentOwnerType,
    ownerId: string,
    attachmentIds: string[],
  ): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${ownerType}/${ownerId}/link`, {
      attachmentIds,
    });
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },

  getLink(id: string): Promise<AttachmentLinkResponse> {
    return httpClient.getUnwrapped<AttachmentLinkResponse>(
      `${ENDPOINT}/${id}/link`,
    );
  },

  /** The file's content, for storage that can't hand out links. */
  async download(id: string): Promise<Blob> {
    const response = await axiosInstance.get<Blob>(
      `${ENDPOINT}/${id}/download`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  },
};
