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

  changeStatus(
    record: TravelOrderApplicationResponse,
    status: string,
  ): Promise<TravelOrderApplicationResponse> {
    return httpClient.putUnwrapped<TravelOrderApplicationResponse>(
      `${ENDPOINT}/${record.id}`,
      {
        id: record.id,
        employeeId: record.employeeId,
        startDate: record.startDate,
        endDate: record.endDate,
        isManualEntry: record.isManualEntry ?? false,
        startTime: record.startTime,
        endTime: record.endTime,
        totalMinutes: record.totalMinutes,
        destination: record.destination,
        classification: record.classification,
        purpose: record.purpose,
        cost: record.cost,
        applicationRemarks: record.applicationRemarks,
        approvalStatus: status,
      },
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
