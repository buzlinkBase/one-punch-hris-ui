import { Select } from "antd";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";

interface Props {
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
}

// Searchable picker over the company's employees; clearing yields null.
export function EmployeeSelect({ value, onChange, placeholder }: Props) {
  const { data: employees = [], isLoading } = useEmployees();
  const options = employees.map((e) => ({
    value: e.id,
    label: `${e.lastName}, ${e.firstName}`,
  }));

  return (
    <Select
      value={value ?? undefined}
      onChange={(v) => onChange?.(v ?? null)}
      options={options}
      loading={isLoading}
      allowClear
      showSearch={{
        filterOption: (input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase()),
      }}
      placeholder={placeholder}
    />
  );
}
