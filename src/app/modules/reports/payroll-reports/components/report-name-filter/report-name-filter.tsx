import { Form, Select } from "antd";

interface ReportNameFilterProps {
  label: string;
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}

// Paired with useReportNameFilter — a searchable multi-select populated from names already
// present in the current result set (not a separate master-list lookup), so it only ever
// offers choices that actually narrow the table down.
export function ReportNameFilter({
  label,
  options,
  value,
  onChange,
}: ReportNameFilterProps) {
  return (
    <Form.Item label={label} className="mb-0" style={{ minWidth: 220 }}>
      <Select
        mode="multiple"
        allowClear
        showSearch
        placeholder={`All ${label}`}
        options={options}
        value={value}
        onChange={onChange}
        maxTagCount="responsive"
        style={{ width: "100%" }}
      />
    </Form.Item>
  );
}
