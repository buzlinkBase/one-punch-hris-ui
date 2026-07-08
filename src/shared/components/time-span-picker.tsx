import type { CSSProperties } from "react";
import { TimePicker, Checkbox } from "antd";
import type { Dayjs } from "dayjs";
import {
  fromTimeSpan,
  getDayOffset,
  getTimePart,
} from "@/shared/utils/time-span.util";

interface TimeSpanPickerProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  /** When true, clearing the picker emits null instead of "00:00:00". */
  nullable?: boolean;
  format?: string;
  style?: CSSProperties;
  className?: string;
  placeholder?: string;
}

/**
 * TimePicker extended with a "+1 day" checkbox for cross-date TimeSpan fields.
 * Reads and writes .NET TimeSpan strings: "HH:mm:ss" or "d.HH:mm:ss".
 */
export function TimeSpanPicker({
  value,
  onChange,
  nullable = false,
  format = "HH:mm",
  style,
  className,
  placeholder,
}: TimeSpanPickerProps) {
  const dayOffset = getDayOffset(value);
  const timePart = value != null ? getTimePart(value) : null;
  const isNextDay = dayOffset > 0;
  const hasValue = value != null;

  const emit = (time: string, offset: number) => {
    onChange?.(offset > 0 ? `${offset}.${time}` : time);
  };

  const handleTimeChange = (val: Dayjs | null) => {
    if (!val) {
      onChange?.(nullable ? null : "00:00:00");
      return;
    }
    emit(val.format("HH:mm:ss"), dayOffset);
  };

  const handleNextDayChange = (checked: boolean) => {
    emit(timePart ?? "00:00:00", checked ? 1 : 0);
  };

  return (
    <div
      style={{ display: "flex", gap: 8, alignItems: "center", ...style }}
      className={className}
    >
      <TimePicker
        style={{ flex: 1 }}
        value={timePart ? fromTimeSpan(timePart) : null}
        onChange={handleTimeChange}
        format={format}
        placeholder={placeholder}
      />
      <Checkbox
        checked={isNextDay}
        disabled={!hasValue}
        onChange={(e) => handleNextDayChange(e.target.checked)}
      >
        <span
          style={{
            fontSize: 12,
            whiteSpace: "nowrap",
            color: isNextDay ? "#1DA081" : "#9ca3af",
          }}
        >
          +1 day
        </span>
      </Checkbox>
    </div>
  );
}
