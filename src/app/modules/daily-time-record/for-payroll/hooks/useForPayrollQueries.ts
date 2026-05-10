import { useQuery } from "@tanstack/react-query";
import { forPayrollApi } from "../services/for-payroll.api";
import type { ForPayrollFilter } from "../models/api/request/for-payroll-filter.model";

const QUERY_KEY = ["daily-time-record", "for-payroll"];

export function useForPayrollRecords(filter: ForPayrollFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => forPayrollApi.getAll(filter),
  });
}
