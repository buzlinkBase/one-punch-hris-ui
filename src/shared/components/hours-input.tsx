import type { CSSProperties } from "react";
import { InputNumber } from "antd";

interface HoursInputProps {
  /** Underlying value in minutes — matches what the API/schema expects. */
  value?: number | null;
  /** Emits the new value in minutes. */
  onChange?: (minutes: number) => void;
  min?: number;
  step?: number;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}

/**
 * InputNumber for a minutes-based field, displayed and edited in hours for a friendlier
 * input (e.g. "8" instead of "480"). Converts on the way in/out — the value passed to
 * onChange (and therefore to the API) stays whole minutes, unchanged from before.
 */
export function HoursInput({
  value,
  onChange,
  min = 0,
  step = 0.5,
  className,
  style,
  placeholder,
}: HoursInputProps) {
  const hours = value != null ? value / 60 : undefined;

  return (
    <InputNumber
      className={className}
      style={style}
      value={hours}
      min={min}
      step={step}
      suffix="hrs"
      placeholder={placeholder}
      onChange={(v) => onChange?.(Math.round((v ?? 0) * 60))}
    />
  );
}
