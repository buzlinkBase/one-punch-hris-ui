import httpClient from "@/core/http/http-client";
import type { AssignAssetResponse } from "../models/api/response/assign-asset-response.model";
import type { CreateAssignAsset } from "../models/api/request/create-assign-asset.model";
import type { UpdateAssignAsset } from "../models/api/request/update-assign-asset.model";

const ENDPOINT = "employee-assign-assets";

const ASSET_TYPES = [
  "Laptop",
  "Desktop",
  "Mobile Phone",
  "Printer",
  "Vehicle",
  "Tools & Equipment",
];

const MOCK_ASSIGN_ASSETS: AssignAssetResponse[] = Array.from(
  { length: 18 },
  (_, i) => ({
    id: `asset-${i + 1}`,
    employeeId: `emp-${1001 + (i % 24)}`,
    assetType: ASSET_TYPES[i % ASSET_TYPES.length],
    assetDescription: `${ASSET_TYPES[i % ASSET_TYPES.length]} unit for daily operations`,
    model: `Model-${String.fromCharCode(65 + (i % 6))}${i + 1}`,
    brand: ["Dell", "HP", "Lenovo", "Samsung", "Apple", "Asus"][i % 6],
    serialNo: `SN-${String(100000 + i).padStart(6, "0")}`,
    qty: (i % 3) + 1,
    issuanceDate: `2025-${String((i % 12) + 1).padStart(2, "0")}-15`,
    returnedDate: i % 4 === 0 ? `2026-${String((i % 12) + 1).padStart(2, "0")}-15` : null,
    remarks: i % 3 === 0 ? "Handle with care" : "",
    file: "",
  }),
);

export const assignAssetApi = {
  async getAll(): Promise<AssignAssetResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<AssignAssetResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_ASSIGN_ASSETS;
    } catch {
      return MOCK_ASSIGN_ASSETS;
    }
  },

  async getById(id: string): Promise<AssignAssetResponse> {
    try {
      return await httpClient.getUnwrapped<AssignAssetResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_ASSIGN_ASSETS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Asset assignment ${id} not found`);
    }
  },

  create(data: CreateAssignAsset): Promise<AssignAssetResponse> {
    return httpClient.postUnwrapped<AssignAssetResponse>(ENDPOINT, data);
  },

  update(data: UpdateAssignAsset): Promise<AssignAssetResponse> {
    return httpClient.put<AssignAssetResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
