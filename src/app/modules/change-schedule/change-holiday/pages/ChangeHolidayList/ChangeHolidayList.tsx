import { useState } from "react";
import {
  Button,
  Typography,
  Select,
  Form,
  DatePicker,
  Card,
  Badge,
  type SelectProps,
} from "antd";
import { PlusOutlined, FilterOutlined, ClearOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/usePayrollGroupQueries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/useEmployeeQueries";
import ChangeHolidayTable from "../../components/ChangeHolidayTable";
import { CHANGE_HOLIDAY_LABEL } from "../../constants/label.const";
import {
  useChangeHolidays,
  useDeleteChangeHoliday,
} from "../../hooks/useChangeHolidayQueries";
import type { ChangeHolidayFilter } from "../../models/api/request/change-holiday-filter.model";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function ChangeHolidayList() {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState<ChangeHolidayFilter>({});
  const [pending, setPending] = useState<ChangeHolidayFilter>({});

  const activeFilterCount = [
    filter.payrollGroupId,
    filter.employeeId,
    filter.fromPayrollDate,
  ].filter(Boolean).length;

  const { data: records = [], isLoading } = useChangeHolidays(filter);
  const { mutate: remove } = useDeleteChangeHoliday();

  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: employees = [] } = useEmployees();

  const payrollGroupOptions: SelectProps["options"] = payrollGroups.map(
    (item) => ({
      value: item.id,
      label: item.name,
    }),
  );

  const employeeOptions: SelectProps["options"] = employees.map((item) => ({
    value: item.id,
    label: `${item.employeeNo} - ${item.lastName}, ${item.firstName}`,
  }));

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
              {CHANGE_HOLIDAY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure holiday changes by employee, payroll group, or selected
              employee group.
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
                navigate({ to: "/change-schedule/change-holiday/create" })
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
              <Form.Item
                label={CHANGE_HOLIDAY_LABEL.FILTER_PAYROLL_GROUP}
                className="mb-0"
              >
                <Select
                  allowClear
                  placeholder="All"
                  options={payrollGroupOptions}
                  value={pending.payrollGroupId}
                  onChange={(value) =>
                    setPending((state) => ({ ...state, payrollGroupId: value }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label={CHANGE_HOLIDAY_LABEL.FILTER_EMPLOYEE}
                className="mb-0"
              >
                <Select
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="All"
                  options={employeeOptions}
                  value={pending.employeeId}
                  onChange={(value) =>
                    setPending((state) => ({ ...state, employeeId: value }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label={`${CHANGE_HOLIDAY_LABEL.FILTER_FROM_PAYROLL_DATE} – ${CHANGE_HOLIDAY_LABEL.FILTER_TO_PAYROLL_DATE}`}
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
                    setPending((state) => ({
                      ...state,
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

      <ChangeHolidayTable
        data={records}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
