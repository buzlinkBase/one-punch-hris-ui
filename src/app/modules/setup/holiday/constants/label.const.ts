export const HOLIDAY_LABEL = {
  TITLE: "Holiday",
  DESCRIPTION: "Description",
  HOL_TYPE: "Holiday Type",
  WORK_TYPE: "Work Type",
  HOL_DATE: "Holiday Date",
  IS_RECURING: "Recurring",
  RECURRENCE_MODE: "Recurrence Pattern",
  MONTH: "Month",
  WEEK_OF_MONTH: "Week of Month",
  DAY_OF_WEEK: "Day of Week",
  AREA: "Site (Localized)",
  STATUS: "Status",
  CREATE_TITLE: "Create Holiday",
  EDIT_TITLE: "Edit Holiday",
};

export const HOLIDAY_TYPE_OPTIONS = [
  { value: "LEGAL", label: "Legal Holiday" },
  { value: "SPECIAL", label: "Special Holiday" },
];

export const WORK_TYPE_OPTIONS = [
  { value: "NonWorking", label: "Non-Working" },
  { value: "Working", label: "Working" },
];

// WeekOfMonth convention (matches backend HolidayRecurrenceCalculator): 1-4 = first..fourth
// occurrence of the chosen weekday in the month, 5 = last occurrence in the month.
export const WEEK_OF_MONTH_OPTIONS = [
  { value: 1, label: "First" },
  { value: 2, label: "Second" },
  { value: 3, label: "Third" },
  { value: 4, label: "Fourth" },
  { value: 5, label: "Last" },
];

export const DAY_OF_WEEK_OPTIONS = [
  { value: "Sunday", label: "Sunday" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
];

export const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];
