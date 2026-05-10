import type { ChangeHolidayResponse } from "../models/api/response/change-holiday-response.model";
import type { ChangeHolidayFormValues } from "../models/forms/change-holiday-form.schema";

export const changeHolidayMapper = {
  toFormValues(response: ChangeHolidayResponse): ChangeHolidayFormValues {
    return {
      targetType: response.targetType,
      employeeId: response.employeeId,
      payrollGroupId: response.payrollGroupId,
      employeeIds: response.employeeIds ?? [],
      holidayId: response.holidayId,
      fromDate: response.fromDate,
      toDate: response.toDate,
    };
  },
};
