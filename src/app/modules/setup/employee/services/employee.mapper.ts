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
      bloodType: response.bloodType ?? "",
      email: response.email ?? "",
      contact: response.contact ?? "",
      address1: response.address1 ?? "",
      address2: response.address2 ?? "",
      bioId: response.bioId ?? null,
      employeeNo: response.employeeNo,
      departmentId: response.departmentId ?? null,
      areaId: response.areaId ?? null,
      payrollGroupId: response.payrollGroupId ?? "",
      clientId: response.clientId ?? null,
      branchId: response.branchId ?? null,
      sectionId: response.sectionId ?? null,
      positionId: response.positionId ?? null,
      jobLevel: response.jobLevel ?? "RankandFile",
      timeShiftId: response.timeShiftId ?? null,
      employmentStatus: response.employmentStatus,
      hiringEntity: response.hiringEntity ?? "",
      dateRegistered: response.dateRegistered,
      hireDate: response.hireDate,
      contractStart: response.contractStart ?? null,
      contractEnd: response.contractEnd ?? null,
      dateResigned: response.dateResigned ?? null,
      restDays: response.restDays?.map((r) => r.dayName) ?? [],
      modeOfPayment: response.modeOfPayment,
      salaryType: response.salaryType,
      monthlyRate: response.monthlyRate ?? 0,
      dailyRate: response.dailyRate ?? 0,
      cola: response.cola ?? 0,
      dailyRateMode: response.dailyRateMode ?? "Manual",
      factorDays: response.factorDays ?? null,
      useActualMonthDays: response.useActualMonthDays ?? false,
      isRestDayPaid: response.isRestDayPaid ?? false,
      isRegularHolidayIncluded: response.isRegularHolidayIncluded ?? false,
      isSpecialNonWorkingIncluded:
        response.isSpecialNonWorkingIncluded ?? false,
      isNightDiffIncluded: response.isNightDiffIncluded ?? false,
      useEmployeeOverride: response.useEmployeeOverride ?? true,
      bankName: response.bankName ?? "",
      bankNo: response.bankNo ?? "",
      sssNo: response.sssNo ?? "",
      phicNo: response.phicNo ?? "",
      hdmfNo: response.hdmfNo ?? "",
      tin: response.tin ?? "",
      rdoCode: response.rdoCode ?? "",
      sssRate: response.sssRate
        ? {
            computationType: response.sssRate.computationType ?? "Table",
            eE: response.sssRate.eE ?? 0,
            eR: response.sssRate.eR ?? 0,
            eC: response.sssRate.eC ?? 0,
            addOns: response.sssRate.addOns ?? 0,
          }
        : { computationType: "Table", eE: 0, eR: 0, eC: 0, addOns: 0 },
      phicRate: response.phicRate
        ? {
            computationType: response.phicRate.computationType ?? "Table",
            eE: response.phicRate.eE ?? 0,
            eR: response.phicRate.eR ?? 0,
            addOns: response.phicRate.addOns ?? 0,
          }
        : { computationType: "Table", eE: 0, eR: 0, addOns: 0 },
      hdmfRate: response.hdmfRate
        ? {
            computationType: response.hdmfRate.computationType ?? "Table",
            eE: response.hdmfRate.eE ?? 0,
            eR: response.hdmfRate.eR ?? 0,
            addOns: response.hdmfRate.addOns ?? 0,
          }
        : { computationType: "Table", eE: 0, eR: 0, addOns: 0 },
      taxRate: response.taxRate
        ? {
            computationType: response.taxRate.computationType ?? "Table",
            eE: response.taxRate.eE ?? 0,
            addOns: response.taxRate.addOns ?? 0,
          }
        : { computationType: "Table", eE: 0, addOns: 0 },
      profileImg: response.profileImg ?? "",
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
      dateRegistered: dayjs().format("YYYY-MM-DD"),
      modeOfPayment: "ATM",
      salaryType: "VARIABLE",
      employmentStatus: "Probationary",
      monthlyRate: 0,
      dailyRate: 0,
      cola: 0,
      dailyRateMode: "Manual",
      factorDays: null,
      useActualMonthDays: false,
      isRestDayPaid: false,
      isRegularHolidayIncluded: false,
      isSpecialNonWorkingIncluded: false,
      isNightDiffIncluded: false,
      useEmployeeOverride: false,
      restDays: [],
      sssRate: { computationType: "Table", eE: 0, eR: 0, eC: 0, addOns: 0 },
      phicRate: { computationType: "Table", eE: 0, eR: 0, addOns: 0 },
      hdmfRate: { computationType: "Table", eE: 0, eR: 0, addOns: 0 },
      taxRate: { computationType: "Table", eE: 0, addOns: 0 },
      settings: {
        isEligibleForOvertime: true,
        isEligibleForHolidayPay: true,
        isEligibleForNightDifferential: true,
        isEligibleForLeaveCredits: true,
        isEligibleFor13thMonth: true,
      },
    };
  },
};
