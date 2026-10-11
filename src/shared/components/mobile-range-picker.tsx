import { useState, type CSSProperties } from "react";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";
import {
  pickRange,
  rangeKey,
  shownRange,
  type DateRange,
  type RangeDraft,
} from "./mobile-range-draft";

const { RangePicker } = DatePicker;

type RangePickerProps = React.ComponentProps<typeof RangePicker>;

interface MobileRangePickerProps extends Pick<
  RangePickerProps,
  | "value"
  | "onChange"
  | "size"
  | "status"
  | "format"
  | "allowClear"
  | "placeholder"
> {
  showTime?: boolean | { format?: string };
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}

const DEFAULT_FORMAT = "YYYY-MM-DD";

/**
 * Drop-in replacement for antd's `DatePicker.RangePicker`. RangePicker's
 * dual-month popup overflows/clips on phone-width viewports, so below the
 * app's mobile breakpoint this renders two stacked single DatePickers
 * (From/Start, To/End) instead, each with a normal single-panel popup —
 * emitting the same `[Dayjs, Dayjs]|null` + date-strings pair RangePicker's
 * own `onChange` does, and like it only once both ends are picked (a lone end
 * is held here until then), so existing callers need no other change.
 */
export function MobileRangePicker({
  value,
  onChange,
  style,
  className,
  size,
  status,
  format,
  showTime,
  allowClear = true,
  placeholder,
  disabled,
}: MobileRangePickerProps) {
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState<RangeDraft | null>(null);

  if (!isMobile) {
    return (
      <RangePicker
        value={value}
        onChange={onChange}
        style={style}
        className={className}
        size={size}
        status={status}
        format={format}
        showTime={showTime}
        allowClear={allowClear}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  const current: DateRange | null = value
    ? [value[0] ?? null, value[1] ?? null]
    : null;
  const [from, to] = shownRange(current, draft);
  const fmt = typeof format === "string" ? format : DEFAULT_FORMAT;

  const emit = (newFrom: Dayjs | null, newTo: Dayjs | null) => {
    const pick = pickRange([newFrom, newTo]);
    if (pick.kind === "draft") {
      setDraft({ range: pick.range, basis: rangeKey(current) });
      return;
    }
    setDraft(null);
    onChange?.(pick.range, [
      newFrom ? newFrom.format(fmt) : "",
      newTo ? newTo.format(fmt) : "",
    ]);
  };

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`} style={style}>
      <DatePicker
        className="w-full!"
        size={size}
        status={status}
        format={format}
        showTime={showTime}
        allowClear={allowClear}
        disabled={disabled}
        placeholder={placeholder?.[0] ?? "Start date"}
        value={from}
        disabledDate={(d) => (to ? d.isAfter(to, "day") : false)}
        onChange={(d) => emit(d ?? null, to ?? null)}
      />
      <DatePicker
        className="w-full!"
        size={size}
        status={status}
        format={format}
        showTime={showTime}
        allowClear={allowClear}
        disabled={disabled}
        placeholder={placeholder?.[1] ?? "End date"}
        value={to}
        disabledDate={(d) => (from ? d.isBefore(from, "day") : false)}
        onChange={(d) => emit(from ?? null, d ?? null)}
      />
    </div>
  );
}
