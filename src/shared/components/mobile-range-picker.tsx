import type { CSSProperties } from "react";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";

const { RangePicker } = DatePicker;

type RangePickerProps = React.ComponentProps<typeof RangePicker>;
type DayjsRange = [Dayjs | null, Dayjs | null] | null;

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
 * emitting the same `[Dayjs|null, Dayjs|null]|null` + date-strings pair
 * RangePicker's own `onChange` does, so existing callers need no other change.
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

  const [from, to] = value ?? [null, null];
  const fmt = typeof format === "string" ? format : DEFAULT_FORMAT;

  const emit = (newFrom: Dayjs | null, newTo: Dayjs | null) => {
    const next: DayjsRange = newFrom || newTo ? [newFrom, newTo] : null;
    onChange?.(next, [
      newFrom ? newFrom.format(fmt) : "",
      newTo ? newTo.format(fmt) : "",
    ]);
  };

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`} style={style}>
      <DatePicker
        style={{ width: "100%" }}
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
        style={{ width: "100%" }}
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
