import { useRef } from "react";
import { ConfigProvider } from "antd";

export interface PayModeOption {
  value: string;
  label: string;
  description: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: PayModeOption[];
}

// "How is it given?" as equal-height selectable cards. A real radiogroup: one tab stop, arrow keys
// move the selection, so it works from the keyboard as well as by clicking.
export function PayModeSelector({ value, onChange, options }: Props) {
  const { componentDisabled: disabled } = ConfigProvider.useConfig();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (from: number, step: number) => {
    const next = (from + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="How it is given"
      className="grid grid-cols-1 gap-3 md:grid-cols-3"
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(index, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(index, -1);
              }
            }}
            className={`flex h-full cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
              selected
                ? "border-teal-600 bg-teal-50 dark:bg-teal-950"
                : "border-gray-200 bg-transparent hover:border-teal-400 dark:border-gray-700"
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                selected ? "border-teal-600" : "border-gray-300"
              }`}
            >
              {selected && <span className="size-2 rounded-full bg-teal-600" />}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-sm leading-tight font-medium">
                {option.label}
              </span>
              <span className="text-xs leading-snug text-gray-500">
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
