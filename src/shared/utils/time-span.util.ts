import dayjs, { type Dayjs } from "dayjs";

/** Parse a .NET TimeSpan string ("HH:mm:ss" or "HH:mm") into a dayjs object for TimePicker. */
export function fromTimeSpan(value: string | null | undefined): Dayjs | null {
  if (!value) return null;
  const d = dayjs(`1970-01-01T${value}`);
  return d.isValid() ? d : null;
}

/** Serialize a dayjs TimePicker value to .NET TimeSpan string "HH:mm:ss". Returns "00:00:00" when null. */
export function toTimeSpan(value: Dayjs | null | undefined): string {
  if (!value?.isValid()) return "00:00:00";
  return value.format("HH:mm:ss");
}

/** Serialize a dayjs value to nullable TimeSpan string. Returns null when empty. */
export function toOptionalTimeSpan(value: Dayjs | null | undefined): string | null {
  if (!value?.isValid()) return null;
  return value.format("HH:mm:ss");
}
