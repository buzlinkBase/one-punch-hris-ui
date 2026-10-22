import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const PH_TZ = "Asia/Manila";

// The current moment on the Philippine clock, whatever the device's own time zone is.
export function phNow(): Dayjs {
  return dayjs().tz(PH_TZ);
}

// A server timestamp (UTC ISO string) shown in Philippine time.
export function toPh(value: string | Date): Dayjs {
  return dayjs.utc(value).tz(PH_TZ);
}
