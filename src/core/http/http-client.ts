import type { AxiosRequestConfig } from "axios";
import axiosInstance from "./axios.instance";
import type { ApiResponse } from "@/shared/types/api-response.model";

const httpClient = {
  get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.get<T>(endpoint, config).then((r) => r.data);
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosInstance.post<T>(endpoint, body, config).then((r) => r.data);
  },

  put<T>(
    endpoint: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosInstance.put<T>(endpoint, body, config).then((r) => r.data);
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosInstance.patch<T>(endpoint, body, config).then((r) => r.data);
  },

  delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.delete<T>(endpoint, config).then((r) => r.data);
  },

  /** Unwraps the `data` field from an ApiResponse envelope. */
  getUnwrapped<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance
      .get<ApiResponse<T>>(endpoint, config)
      .then((r) => r.data.data);
  },

  postUnwrapped<T>(
    endpoint: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosInstance
      .post<ApiResponse<T>>(endpoint, body, config)
      .then((r) => r.data.data);
  },

  putUnwrapped<T>(
    endpoint: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosInstance
      .put<ApiResponse<T>>(endpoint, body, config)
      .then((r) => r.data.data);
  },

  patchUnwrapped<T>(
    endpoint: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosInstance
      .patch<ApiResponse<T>>(endpoint, body, config)
      .then((r) => r.data.data);
  },
};

export default httpClient;
