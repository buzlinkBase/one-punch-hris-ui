import type { ChangeRestDayResponse } from "../models/api/response/change-rest-day-response.model";
import type { ChangeRestDayFormValues } from "../models/forms/change-rest-day-form.schema";

export const changeRestDayMapper = {
  toFormValues(response: ChangeRestDayResponse): ChangeRestDayFormValues {
    return {
      employeeId: response.employeeId,
      fromDate: response.fromDate,
      toDate: response.fromDate,
      newDate: response.toDate,
    };
  },
};
