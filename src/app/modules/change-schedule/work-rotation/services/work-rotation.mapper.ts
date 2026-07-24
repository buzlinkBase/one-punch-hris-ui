import type { WorkRotationResponse } from "../models/api/response/work-rotation-response.model";
import type { WorkRotationFormValues } from "../models/forms/work-rotation-form.schema";

export const workRotationMapper = {
  toFormValues(response: WorkRotationResponse): WorkRotationFormValues {
    return {
      timeShiftId: response.timeShiftId,
      payrollDate: response.payrollDate,
    };
  },
};
