import { Button } from "antd";
import dayjs from "dayjs";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { QUICK_RANGES } from "@/shared/utils/quick-date-ranges.util";

const DATE_FORMAT = "YYYY-MM-DD";

interface Props {
  dateRange: [string, string];
  onDateRangeChange: (range: [string, string]) => void;
}

// The date-range shortcuts (Current cutoff, This month, Last month...) plus a custom range picker,
// the same as the Saved DTR / Saved Payroll filter bars. Presentational only.
export function QuickRangeBar({ dateRange, onDateRangeChange }: Props) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-1">
        {QUICK_RANGES.map((q) => {
          const [from, to] = q.range();
          const active = dateRange[0] === from && dateRange[1] === to;
          return (
            <Button
              key={q.key}
              size="small"
              type={active ? "primary" : "default"}
              onClick={() => onDateRangeChange([from, to])}
            >
              {q.label}
            </Button>
          );
        })}
      </div>
      <MobileRangePicker
        allowClear={false}
        value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
        onChange={(dates) => {
          if (dates?.[0] && dates[1])
            onDateRangeChange([
              dates[0].format(DATE_FORMAT),
              dates[1].format(DATE_FORMAT),
            ]);
        }}
      />
    </div>
  );
}
