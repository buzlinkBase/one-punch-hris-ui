import { Select } from "antd";

export interface FilterSelectOption {
  value: string;
  label: string;
  /** Long name shown beside a short code, e.g. "HR - Human Resources". */
  fullLabel?: string;
}

interface Props {
  options: FilterSelectOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder: string;
}

// Searchable, clearable select used by filter panels. Matches on both the short label (code)
// and the full name.
export function FilterSelect({ options, value, onChange, placeholder }: Props) {
  return (
    <Select
      allowClear
      showSearch
      filterOption={(input, opt) => {
        const q = input.toLowerCase();
        const o = opt as FilterSelectOption | undefined;
        return (
          String(o?.label ?? "")
            .toLowerCase()
            .includes(q) ||
          String(o?.fullLabel ?? "")
            .toLowerCase()
            .includes(q)
        );
      }}
      placeholder={placeholder}
      options={options}
      optionRender={(opt) =>
        opt.data.fullLabel
          ? `${opt.data.label} - ${opt.data.fullLabel}`
          : String(opt.data.label ?? "")
      }
      value={value}
      onChange={(v) => onChange(v)}
    />
  );
}
