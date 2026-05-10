import { useState } from "react";
import { Form, Select, Button, Typography, DatePicker } from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useForPayrollRecords } from "../../hooks/useForPayrollQueries";
import ForPayrollTable from "../../components/ForPayrollTable";
import { FOR_PAYROLL_LABEL } from "../../constants/label.const";
import type { ForPayrollFilter } from "../../models/api/request/for-payroll-filter.model";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const DEPARTMENT_OPTIONS = [
  { value: "dept-1", label: "HR" },
  { value: "dept-2", label: "Finance" },
  { value: "dept-3", label: "Operations" },
  { value: "dept-4", label: "IT" },
];

const CLIENT_OPTIONS = [
  { value: "client-1", label: "Client A" },
  { value: "client-2", label: "Client B" },
  { value: "client-3", label: "Client C" },
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

export default function ForPayrollList() {
  const [filter, setFilter] = useState<ForPayrollFilter>({});
  const [pending, setPending] = useState<ForPayrollFilter>({});

  const { data: records = [], isLoading } = useForPayrollRecords(filter);

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
              {FOR_PAYROLL_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View daily time record summaries prepared for payroll processing.
            </p>
          </div>
        </div>
      </div>

      <Form layout="inline" className="mb-4 flex flex-wrap gap-2">
        <Form.Item
          label={`${FOR_PAYROLL_LABEL.FILTER_FROM_DATE} - ${FOR_PAYROLL_LABEL.FILTER_TO_DATE}`}
        >
          <RangePicker
            value={
              pending.fromDate && pending.toDate
                ? [dayjs(pending.fromDate), dayjs(pending.toDate)]
                : null
            }
            onChange={(dates) =>
              setPending((f) => ({
                ...f,
                fromDate: dates?.[0]?.format("YYYY-MM-DD"),
                toDate: dates?.[1]?.format("YYYY-MM-DD"),
              }))
            }
          />
        </Form.Item>
        <Form.Item label={FOR_PAYROLL_LABEL.FILTER_DEPARTMENT}>
          <Select
            allowClear
            placeholder="All Departments"
            options={DEPARTMENT_OPTIONS}
            value={pending.departmentId}
            onChange={(val) => setPending((f) => ({ ...f, departmentId: val }))}
            style={{ width: 180 }}
          />
        </Form.Item>
        <Form.Item label={FOR_PAYROLL_LABEL.FILTER_CLIENT}>
          <Select
            allowClear
            placeholder="All Clients"
            options={CLIENT_OPTIONS}
            value={pending.clientId}
            onChange={(val) => setPending((f) => ({ ...f, clientId: val }))}
            style={{ width: 160 }}
          />
        </Form.Item>
        <Form.Item label={FOR_PAYROLL_LABEL.FILTER_EMPLOYEE}>
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
        <Form.Item label={FOR_PAYROLL_LABEL.FILTER_PAYROLL_GROUP}>
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

      <ForPayrollTable data={records} loading={isLoading} />
    </div>
  );
}
