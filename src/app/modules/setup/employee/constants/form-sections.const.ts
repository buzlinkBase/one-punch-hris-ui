import { EMPLOYEE_LABEL } from "./label.const";

/** The employee form's tabs, in display order (keys match the page's Tabs items). */
export const EMPLOYEE_FORM_TABS = [
  { key: "personal", label: "Personal Information" },
  { key: "employment", label: "Employment Details" },
  { key: "compensation", label: "Compensation" },
  { key: "govids", label: "Gov't IDs & Rates" },
  { key: "settings", label: "Eligibility" },
] as const;

export type EmployeeFormTab = (typeof EMPLOYEE_FORM_TABS)[number]["key"];

export interface FieldSection {
  tab: EmployeeFormTab;
  label: string;
}

const L = EMPLOYEE_LABEL;

/**
 * Where each form field lives and what it's called -- so a validation message can say
 * "Personal Information › Email Address" and open that tab. Keyed by the top-level field name;
 * nested fields (sssRate.eE, settings.…) use their group. Order within a tab = order on screen.
 */
export const EMPLOYEE_FIELD_SECTIONS: Record<string, FieldSection> = {
  firstName: { tab: "personal", label: L.FIRST_NAME },
  lastName: { tab: "personal", label: L.LAST_NAME },
  middleName: { tab: "personal", label: L.MIDDLE_NAME },
  suffix: { tab: "personal", label: L.SUFFIX },
  gender: { tab: "personal", label: L.GENDER },
  civilStatus: { tab: "personal", label: L.CIVIL_STATUS },
  dob: { tab: "personal", label: L.DOB },
  bloodType: { tab: "personal", label: L.BLOOD_TYPE },
  contact: { tab: "personal", label: L.CONTACT },
  address1: { tab: "personal", label: L.ADDRESS1 },
  address2: { tab: "personal", label: L.ADDRESS2 },
  email: { tab: "personal", label: L.EMAIL },

  employeeNo: { tab: "employment", label: L.EMPLOYEE_NO },
  bioId: { tab: "employment", label: L.BIO_ID },
  departmentId: { tab: "employment", label: L.DEPARTMENT },
  managerId: { tab: "employment", label: L.MANAGER },
  sectionId: { tab: "employment", label: L.SECTION },
  areaId: { tab: "employment", label: L.AREA },
  payrollGroupId: { tab: "employment", label: L.PAYROLL_GROUP },
  clientId: { tab: "employment", label: L.CLIENT },
  branchId: { tab: "employment", label: L.BRANCH },
  positionId: { tab: "employment", label: L.POSITION },
  jobLevel: { tab: "employment", label: L.JOB_LEVEL },
  timeShiftId: { tab: "employment", label: L.TIME_SHIFT },
  employmentStatus: { tab: "employment", label: L.EMPLOYMENT_STATUS },
  isConfidential: { tab: "employment", label: L.CONFIDENTIAL },
  hiringEntity: { tab: "employment", label: L.HIRING_ENTITY },
  dateRegistered: { tab: "employment", label: L.DATE_REGISTERED },
  hireDate: { tab: "employment", label: L.HIRE_DATE },
  contractStart: { tab: "employment", label: L.CONTRACT_START },
  contractEnd: { tab: "employment", label: L.CONTRACT_END },
  dateResigned: { tab: "employment", label: L.DATE_RESIGNED },
  restDays: { tab: "employment", label: L.REST_DAYS },

  salaryType: { tab: "compensation", label: L.SALARY_TYPE },
  monthlyRate: { tab: "compensation", label: L.MONTHLY_RATE },
  dailyRateMode: { tab: "compensation", label: L.DAILY_RATE_MODE },
  factorDays: { tab: "compensation", label: L.FACTOR_DAYS },
  useActualMonthDays: { tab: "compensation", label: "Use Actual Month Days" },
  dailyRate: { tab: "compensation", label: L.DAILY_RATE },
  cola: { tab: "compensation", label: L.COLA },
  cashBond: { tab: "compensation", label: L.CASH_BOND },
  isRestDayPaid: { tab: "compensation", label: "Rest Day Paid" },
  isRegularHolidayIncluded: {
    tab: "compensation",
    label: "Regular Holiday Included",
  },
  isSpecialNonWorkingIncluded: {
    tab: "compensation",
    label: "Special Non-Working Included",
  },
  modeOfPayment: { tab: "compensation", label: L.MODE_OF_PAYMENT },
  bankName: { tab: "compensation", label: L.BANK_NAME },
  bankNo: { tab: "compensation", label: L.BANK_NO },

  sssNo: { tab: "govids", label: L.SSS_NO },
  sssRate: { tab: "govids", label: "SSS Rate" },
  phicNo: { tab: "govids", label: L.PHIC_NO },
  phicRate: { tab: "govids", label: "PhilHealth Rate" },
  hdmfNo: { tab: "govids", label: L.HDMF_NO },
  hdmfRate: { tab: "govids", label: "Pag-IBIG Rate" },
  tin: { tab: "govids", label: L.TIN },
  rdoCode: { tab: "govids", label: L.RDO_CODE },
  taxRate: { tab: "govids", label: "Tax Rate" },

  settings: { tab: "settings", label: "Eligibility" },
};
