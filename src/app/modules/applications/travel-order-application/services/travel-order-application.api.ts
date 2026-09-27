import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { TravelOrderApplicationResponse } from "../models/api/response/travel-order-application-response.model";
import type { CreateTravelOrderApplication } from "../models/api/request/create-travel-order-application.model";
import type { UpdateTravelOrderApplication } from "../models/api/request/update-travel-order-application.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "travelorderapplications");

export const travelOrderApi = {
  async getAll(params?: {
    from?: string;
    to?: string;
  }): Promise<TravelOrderApplicationResponse[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const query = qs.toString();
    return httpClient.getUnwrapped<TravelOrderApplicationResponse[]>(
      query ? `${ENDPOINT}?${query}` : ENDPOINT,
    );
  },

  async getById(id: string): Promise<TravelOrderApplicationResponse> {
    return httpClient.getUnwrapped<TravelOrderApplicationResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(
    data: CreateTravelOrderApplication,
  ): Promise<TravelOrderApplicationResponse> {
    return httpClient.postUnwrapped<TravelOrderApplicationResponse>(
      ENDPOINT,
      data,
    );
  },

  createBatch(
    data: CreateTravelOrderApplication[],
  ): Promise<TravelOrderApplicationResponse[]> {
    return httpClient.postUnwrapped<TravelOrderApplicationResponse[]>(
      `${ENDPOINT}/batch`,
      data,
    );
  },

  update(
    data: UpdateTravelOrderApplication,
  ): Promise<TravelOrderApplicationResponse> {
    return httpClient.putUnwrapped<TravelOrderApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  // Status only changes through these (the approval engine) -- update() never touches it.
  approve(id: string, note?: string): Promise<void> {
    return httpClient.postUnwrapped<void>(`${ENDPOINT}/${id}/approve`, {
      note,
    });
  },

  decline(id: string, note?: string): Promise<void> {
    return httpClient.postUnwrapped<void>(`${ENDPOINT}/${id}/decline`, {
      note,
    });
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
