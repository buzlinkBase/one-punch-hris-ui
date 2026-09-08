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
  /**
   * When provided, the +1 day offset is computed automatically:
   * if the picked time (HH:mm:ss) is earlier than this reference time,
   * the value is emitted as next-day. The manual checkbox is hidden.
   */
  referenceTime?: string | null;
  disabled?: boolean;
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
  referenceTime,
  disabled = false,
}: TimeSpanPickerProps) {
  const dayOffset = getDayOffset(value);
  const timePart = value != null ? getTimePart(value) : null;
  const isNextDay = dayOffset > 0;
  const hasValue = value != null;
  const autoMode = referenceTime != null;

  const emit = (time: string, offset: number) => {
    onChange?.(offset > 0 ? `${offset}.${time}` : time);
  };

  const handleTimeChange = (val: Dayjs | null) => {
    if (!val) {
      onChange?.(nullable ? null : "00:00:00");
      return;
    }
    const timeStr = val.format("HH:mm:ss");
    let offset = dayOffset;
    if (autoMode) {
      const refOffset = getDayOffset(referenceTime);
      const refPart = getTimePart(referenceTime);
      // If picked time is earlier than the reference's time-of-day, it's one
      // day ahead of the reference (which may itself already be +1 or more).
      offset = timeStr < refPart ? refOffset + 1 : refOffset;
    }
    emit(timeStr, offset);
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
        disabled={disabled}
      />
      {autoMode ? (
        isNextDay && (
          <span
            style={{
              fontSize: 12,
              whiteSpace: "nowrap",
              color: "#1DA081",
              fontWeight: 600,
            }}
          >
            +1 day
          </span>
        )
      ) : (
        <Checkbox
          checked={isNextDay}
          disabled={disabled || !hasValue}
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
      )}
    </div>
  );
}
