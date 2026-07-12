import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { BiometricDeviceModel } from "../models/api/response/device-response.model";
import type { CreateBiometricDevice } from "../models/api/request/create-device.model";
import type { UpdateBiometricDevice } from "../models/api/request/update-device.model";

const ENDPOINT = buildApiUrl(API_PREFIX.adms, "device");

export const deviceApi = {
  getAll(): Promise<BiometricDeviceModel[]> {
    return httpClient.getUnwrapped<BiometricDeviceModel[]>(ENDPOINT);
  },

  getById(id: string): Promise<BiometricDeviceModel> {
    return httpClient.getUnwrapped<BiometricDeviceModel>(`${ENDPOINT}/${id}`);
  },

  getBySerial(sn: string): Promise<BiometricDeviceModel> {
    return httpClient.getUnwrapped<BiometricDeviceModel>(
      `${ENDPOINT}/serial/${sn}`,
    );
  },

  create(data: CreateBiometricDevice): Promise<UpdateBiometricDevice> {
    return httpClient.postUnwrapped<UpdateBiometricDevice>(ENDPOINT, data);
  },

  update(data: UpdateBiometricDevice): Promise<UpdateBiometricDevice> {
    return httpClient.put<UpdateBiometricDevice>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
