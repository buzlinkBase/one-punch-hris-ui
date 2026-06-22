import type { ChangeHolidayResponse } from "../models/api/response/change-holiday-response.model";
import type { ChangeHolidayFormValues } from "../models/forms/change-holiday-form.schema";

export const changeHolidayMapper = {
  toFormValues(response: ChangeHolidayResponse): ChangeHolidayFormValues {
    return {
      targetType: "employee",
      employeeId: undefined,
      payrollGroupId: undefined,
      employeeIds: [],
      holidayId: "",
      fromDate: response.fromDate,
      toDate: response.toDate,
    };
  },
};
