import { useState } from "react";
import {
  Button,
  Typography,
  Form,
  Select,
  DatePicker,
  Card,
  Badge,
} from "antd";
import { PlusOutlined, FilterOutlined, ClearOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useChangeRestDays,
  useDeleteChangeRestDay,
} from "../../hooks/use-change-rest-day-queries";
import ChangeRestDayTable from "../../components/change-rest-day-table";
import { CHANGE_REST_DAY_LABEL } from "../../constants/label.const";
import type { ChangeRestDayFilter } from "../../models/api/request/change-rest-day-filter.model";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const PAYROLL_GROUP_OPTIONS = [
  { value: "pg-1", label: "Payroll Group 1" },
  { value: "pg-2", label: "Payroll Group 2" },
  { value: "pg-3", label: "Payroll Group 3" },
];

const EMPLOYEE_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: `emp-${1001 + i}`,
  label: `Employee ${i + 1}`,
}));

const CLIENT_OPTIONS = [
  { value: "client-1", label: "Client A" },
  { value: "client-2", label: "Client B" },
  { value: "client-3", label: "Client C" },
];

export default function ChangeRestDayList() {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState<ChangeRestDayFilter>({});
  const [pending, setPending] = useState<ChangeRestDayFilter>({});

  const activeFilterCount = [
    filter.payrollGroupId,
    filter.employeeId,
    filter.clientId,
    filter.fromPayrollDate,
  ].filter(Boolean).length;

  const { data: records = [], isLoading } = useChangeRestDays(filter);
  const { mutate: remove } = useDeleteChangeRestDay();

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
              {CHANGE_REST_DAY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage employee rest day schedule changes.
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                navigate({ to: "/change-schedule/change-rest-day/create" })
              }
            >
              Add Entry
            </Button>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <Card size="small" className="mb-4">
          <Form layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4">
              <Form.Item
                label={CHANGE_REST_DAY_LABEL.FILTER_PAYROLL_GROUP}
                className="mb-0"
              >
                <Select
                  allowClear
                  placeholder="All"
                  options={PAYROLL_GROUP_OPTIONS}
                  value={pending.payrollGroupId}
                  onChange={(val) =>
                    setPending((f) => ({ ...f, payrollGroupId: val }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={CHANGE_REST_DAY_LABEL.FILTER_EMPLOYEE}
                className="mb-0"
              >
                <Select
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="All"
                  options={EMPLOYEE_OPTIONS}
                  value={pending.employeeId}
                  onChange={(val) =>
                    setPending((f) => ({ ...f, employeeId: val }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={CHANGE_REST_DAY_LABEL.FILTER_CLIENT}
                className="mb-0"
              >
                <Select
                  allowClear
                  placeholder="All"
                  options={CLIENT_OPTIONS}
                  value={pending.clientId}
                  onChange={(val) =>
                    setPending((f) => ({ ...f, clientId: val }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={`${CHANGE_REST_DAY_LABEL.FILTER_FROM_PAYROLL_DATE} – ${CHANGE_REST_DAY_LABEL.FILTER_TO_PAYROLL_DATE}`}
                className="mb-0"
              >
                <RangePicker
                  style={{ width: "100%" }}
                  value={
                    pending.fromPayrollDate && pending.toPayrollDate
                      ? [
                          dayjs(pending.fromPayrollDate),
                          dayjs(pending.toPayrollDate),
                        ]
                      : null
                  }
                  onChange={(dates) =>
                    setPending((f) => ({
                      ...f,
                      fromPayrollDate: dates?.[0]?.format("YYYY-MM-DD"),
                      toPayrollDate: dates?.[1]?.format("YYYY-MM-DD"),
                    }))
                  }
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

      <ChangeRestDayTable
        data={records}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
