import type { EmployeeResponse } from "../models/api/response/employee-response.model";
import type { EmployeeFormValues } from "../models/forms/employee-form.schema";
import dayjs from "dayjs";

export const employeeMapper = {
  toFormValues(response: EmployeeResponse): EmployeeFormValues {
    return {
      firstName: response.firstName,
      lastName: response.lastName,
      middleName: response.middleName ?? "",
      suffix: response.suffix ?? "",
      gender: response.gender ?? "",
      civilStatus: response.civilStatus ?? "",
      dob: response.dob ?? null,
      age: response.age ?? undefined,
      bloodType: response.bloodType ?? "",
      contact: response.contact ?? "",
      address1: response.address1 ?? "",
      address2: response.address2 ?? "",
      bioId: response.bioId ?? null,
      employeeNo: response.employeeNo,
      departmentId: response.departmentId ?? null,
      areaId: response.areaId ?? null,
      payrollGroupId: response.payrollGroupId ?? null,
      clientId: response.clientId ?? null,
      branchId: response.branchId ?? null,
      sectionId: response.sectionId ?? null,
      positionId: response.positionId ?? null,
      jobLevel: response.jobLevel,
      timeShiftId: response.timeShiftId ?? null,
      employmentStatus: response.employmentStatus,
      hiringEntity: response.hiringEntity ?? "",
      dateRegistered: response.dateRegistered,
      hireDate: response.hireDate,
      contractStart: response.contractStart ?? null,
      contractEnd: response.contractEnd ?? null,
      dateResigned: response.dateResigned ?? null,
      status: response.status,
      restDays: response.restDays?.map((r) => r.dayName) ?? [],
      modeOfPayment: response.modeOfPayment,
      salaryType: response.salaryType,
      monthlyRate: response.monthlyRate ?? 0,
      dailyRate: response.dailyRate ?? 0,
      cola: response.cola ?? 0,
      bankName: response.bankName ?? "",
      bankNo: response.bankNo ?? "",
      sssNo: response.sssNo ?? "",
      phicNo: response.phicNo ?? "",
      hdmfNo: response.hdmfNo ?? "",
      tin: response.tin ?? "",
      settings: {
        id: response.settings?.id,
        isEligibleForOvertime:
          response.settings?.isEligibleForOvertime ?? false,
        isEligibleForHolidayPay:
          response.settings?.isEligibleForHolidayPay ?? false,
        isEligibleForNightDifferential:
          response.settings?.isEligibleForNightDifferential ?? false,
        isEligibleForLeaveCredits:
          response.settings?.isEligibleForLeaveCredits ?? false,
        isEligibleFor13thMonth:
          response.settings?.isEligibleFor13thMonth ?? false,
      },
    };
  },

  toDefaultValues(): Partial<EmployeeFormValues> {
    return {
      bioId: null,
      dateRegistered: dayjs().toISOString(),
      modeOfPayment: "ATM",
      salaryType: "MONTHLY_VARIABLE",
      employmentStatus: "Probationary",
      jobLevel: "RankandFile",
      status: "ACTIVE",
      monthlyRate: 0,
      dailyRate: 0,
      cola: 0,
      restDays: [],
      settings: {
        isEligibleForOvertime: false,
        isEligibleForHolidayPay: false,
        isEligibleForNightDifferential: false,
        isEligibleForLeaveCredits: false,
        isEligibleFor13thMonth: false,
      },
    };
  },
};
