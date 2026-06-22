import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { EmployeeDocRecordResponse } from "../models/api/response/employee-doc-record-response.model";
import type { CreateEmployeeDocRecord } from "../models/api/request/create-employee-doc-record.model";
import type { UpdateEmployeeDocRecord } from "../models/api/request/update-employee-doc-record.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "employeedocrecords");

const RECORD_TYPES = [
  "Employment Contract",
  "NDA",
  "Government ID",
  "SSS Record",
  "PhilHealth Record",
  "Pag-IBIG Record",
  "TIN Record",
  "Medical Certificate",
  "Training Certificate",
  "Performance Review",
];

const DESCRIPTIONS: Record<string, string> = {
  "Employment Contract": "Signed employment agreement",
  "NDA": "Non-disclosure agreement",
  "Government ID": "Valid government-issued identification",
  "SSS Record": "Social Security System membership record",
  "PhilHealth Record": "Philippine Health Insurance Corporation record",
  "Pag-IBIG Record": "Home Development Mutual Fund record",
  "TIN Record": "Tax Identification Number certificate",
  "Medical Certificate": "Pre-employment medical examination results",
  "Training Certificate": "Completed training certification",
  "Performance Review": "Annual performance evaluation form",
};

const MOCK_DOC_RECORDS: EmployeeDocRecordResponse[] = Array.from(
  { length: 22 },
  (_, i) => {
    const type = RECORD_TYPES[i % RECORD_TYPES.length];
    return {
      id: `doc-${i + 1}`,
      employeeId: `emp-${1001 + (i % 12)}`,
      recordType: type,
      description: DESCRIPTIONS[type] ?? "Document record",
      file: "",
    };
  },
);

export const employeeDocRecordApi = {
  async getAll(): Promise<EmployeeDocRecordResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<EmployeeDocRecordResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_DOC_RECORDS;
    } catch {
      return MOCK_DOC_RECORDS;
    }
  },

  async getById(id: string): Promise<EmployeeDocRecordResponse> {
    try {
      return await httpClient.getUnwrapped<EmployeeDocRecordResponse>(`${ENDPOINT}/${id}`);
    } catch {
      const match = MOCK_DOC_RECORDS.find((r) => r.id === id);
      if (match) return match;
      throw new Error(`Document record ${id} not found`);
    }
  },

  create(data: CreateEmployeeDocRecord): Promise<EmployeeDocRecordResponse> {
    return httpClient.postUnwrapped<EmployeeDocRecordResponse>(ENDPOINT, data);
  },

  update(data: UpdateEmployeeDocRecord): Promise<EmployeeDocRecordResponse> {
    return httpClient.put<EmployeeDocRecordResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
