import { useState } from "react";
import {
  Form,
  Select,
  Button,
  Typography,
  DatePicker,
  Card,
  Badge,
} from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDtrSummaryRecords } from "../../hooks/use-dtr-summary-queries";
import DtrSummaryTable from "../../components/dtr-summary-table";
import { DTR_SUMMARY_LABEL } from "../../constants/label.const";
import type { DtrSummaryFilter } from "../../models/api/request/dtr-summary-filter.model";

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

export default function DtrSummaryList() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState<DtrSummaryFilter>({});
  const [pending, setPending] = useState<DtrSummaryFilter>({});

  const activeFilterCount = [
    filter.fromDate,
    filter.departmentId,
    filter.clientId,
    filter.employeeId,
    filter.payrollGroupId,
  ].filter(Boolean).length;

  const { data: records = [], isLoading } = useDtrSummaryRecords(filter);

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
              {DTR_SUMMARY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View daily time record summaries per employee for the selected
              period.
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
                label={`${DTR_SUMMARY_LABEL.FILTER_FROM_DATE} – ${DTR_SUMMARY_LABEL.FILTER_TO_DATE}`}
                className="mb-0"
              >
                <RangePicker
                  style={{ width: "100%" }}
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
              <Form.Item
                label={DTR_SUMMARY_LABEL.FILTER_DEPARTMENT}
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
                label={DTR_SUMMARY_LABEL.FILTER_CLIENT}
                className="mb-0"
              >
                <Select
                  allowClear
                  placeholder="All Clients"
                  options={CLIENT_OPTIONS}
                  value={pending.clientId}
                  onChange={(val) =>
                    setPending((f) => ({ ...f, clientId: val }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={DTR_SUMMARY_LABEL.FILTER_EMPLOYEE}
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
                label={DTR_SUMMARY_LABEL.FILTER_PAYROLL_GROUP}
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

      <DtrSummaryTable data={records} loading={isLoading} />
    </div>
  );
}
