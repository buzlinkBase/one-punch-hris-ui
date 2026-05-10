import { useState } from "react";
import { Form, Select, Button, Typography } from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import { useTardinessRecords } from "../../hooks/useTardinessQueries";
import TardinessTable from "../../components/TardinessTable";
import { TARDINESS_LABEL } from "../../constants/label.const";
import type { TardinessFilter } from "../../models/api/request/tardiness-filter.model";

const { Title } = Typography;

const DEPARTMENT_OPTIONS = [
  { value: "dept-1", label: "HR" },
  { value: "dept-2", label: "Finance" },
  { value: "dept-3", label: "Operations" },
  { value: "dept-4", label: "IT" },
];

const EMPLOYEE_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: `emp-${1001 + i}`,
  label: `Employee ${i + 1}`,
}));

const PAYROLL_GROUP_OPTIONS = [
  { value: "pg-1", label: "Payroll Group 1" },
  { value: "pg-2", label: "Payroll Group 2" },
  { value: "pg-3", label: "Payroll Group 3" },
];

export default function TardinessList() {
  const [filter, setFilter] = useState<TardinessFilter>({});
  const [pending, setPending] = useState<TardinessFilter>({});

  const { data: records = [], isLoading } = useTardinessRecords(filter);

  const handleSearch = () => setFilter(pending);

  const handleClear = () => {
    setPending({});
    setFilter({});
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {TARDINESS_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View employee tardiness records including late and under time.
            </p>
          </div>
        </div>
      </div>

      <Form layout="inline" className="mb-4 flex flex-wrap gap-2">
        <Form.Item label={TARDINESS_LABEL.FILTER_DEPARTMENT}>
          <Select
            allowClear
            placeholder="All Departments"
            options={DEPARTMENT_OPTIONS}
            value={pending.departmentId}
            onChange={(val) => setPending((f) => ({ ...f, departmentId: val }))}
            style={{ width: 180 }}
          />
        </Form.Item>
        <Form.Item label={TARDINESS_LABEL.FILTER_EMPLOYEE}>
          <Select
            allowClear
            placeholder="All Employees"
            options={EMPLOYEE_OPTIONS}
            value={pending.employeeId}
            onChange={(val) => setPending((f) => ({ ...f, employeeId: val }))}
            style={{ width: 200 }}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item label={TARDINESS_LABEL.FILTER_PAYROLL_GROUP}>
          <Select
            allowClear
            placeholder="All Payroll Groups"
            options={PAYROLL_GROUP_OPTIONS}
            value={pending.payrollGroupId}
            onChange={(val) =>
              setPending((f) => ({ ...f, payrollGroupId: val }))
            }
            style={{ width: 180 }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={handleSearch}
          >
            Filter
          </Button>
        </Form.Item>
        <Form.Item>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            Clear
          </Button>
        </Form.Item>
      </Form>

      <TardinessTable data={records} loading={isLoading} />
    </div>
  );
}
