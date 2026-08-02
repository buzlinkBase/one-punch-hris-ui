import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { TravelOrderApplicationResponse } from "../models/api/response/travel-order-application-response.model";
import type { CreateTravelOrderApplication } from "../models/api/request/create-travel-order-application.model";
import type { UpdateTravelOrderApplication } from "../models/api/request/update-travel-order-application.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "travelorderapplications");

export const travelOrderApi = {
  async getAll(): Promise<TravelOrderApplicationResponse[]> {
    return httpClient.getUnwrapped<TravelOrderApplicationResponse[]>(ENDPOINT);
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

  update(
    data: UpdateTravelOrderApplication,
  ): Promise<TravelOrderApplicationResponse> {
    return httpClient.put<TravelOrderApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
