import { useState } from "react";
import { Form, Select, Button, Typography, Card, Badge } from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import { useTardinessRecords } from "../../hooks/use-tardiness-queries";
import TardinessTable from "../../components/tardiness-table";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState<TardinessFilter>({});
  const [pending, setPending] = useState<TardinessFilter>({});

  const activeFilterCount = [
    filter.departmentId,
    filter.employeeId,
    filter.payrollGroupId,
  ].filter(Boolean).length;

  const { data: records = [], isLoading } = useTardinessRecords(filter);

  const handleSearch = () => setFilter(pending);

  const handleClear = () => {
    setPending({});
    setFilter({});
    setFiltersOpen(false);
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
          <div className="flex gap-2">
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen((v) => !v)}
                type={filtersOpen ? "default" : "text"}
              >
                Filters
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <Card size="small" className="mb-4">
          <Form layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
              <Form.Item
                label={TARDINESS_LABEL.FILTER_DEPARTMENT}
                className="mb-0"
              >
                <Select
                  allowClear
                  placeholder="All Departments"
                  options={DEPARTMENT_OPTIONS}
                  value={pending.departmentId}
                  onChange={(val) =>
                    setPending((f) => ({ ...f, departmentId: val }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={TARDINESS_LABEL.FILTER_EMPLOYEE}
                className="mb-0"
              >
                <Select
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="All Employees"
                  options={EMPLOYEE_OPTIONS}
                  value={pending.employeeId}
                  onChange={(val) =>
                    setPending((f) => ({ ...f, employeeId: val }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={TARDINESS_LABEL.FILTER_PAYROLL_GROUP}
                className="mb-0"
              >
                <Select
                  allowClear
                  placeholder="All Payroll Groups"
                  options={PAYROLL_GROUP_OPTIONS}
                  value={pending.payrollGroupId}
                  onChange={(val) =>
                    setPending((f) => ({ ...f, payrollGroupId: val }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button icon={<ClearOutlined />} onClick={handleClear}>
                Clear
              </Button>
              <Button
                icon={<FilterOutlined />}
                type="primary"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <TardinessTable data={records} loading={isLoading} />
    </div>
  );
}
