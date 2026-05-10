import { useState } from "react";
import {
  Button,
  Typography,
  Select,
  Form,
  DatePicker,
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

const TARGET_TYPE_OPTIONS: SelectProps["options"] = [
  { value: "employee", label: CHANGE_HOLIDAY_LABEL.TARGET_EMPLOYEE },
  {
    value: "payroll-group",
    label: CHANGE_HOLIDAY_LABEL.TARGET_PAYROLL_GROUP,
  },
  {
    value: "employee-group",
    label: CHANGE_HOLIDAY_LABEL.TARGET_EMPLOYEE_GROUP,
  },
];

export default function ChangeHolidayList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ChangeHolidayFilter>({});
  const [pending, setPending] = useState<ChangeHolidayFilter>({});

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

      <Form layout="inline" className="mb-4 flex flex-wrap gap-2">
        <Form.Item label={CHANGE_HOLIDAY_LABEL.TARGET_TYPE}>
          <Select
            allowClear
            placeholder="All"
            options={TARGET_TYPE_OPTIONS}
            value={pending.targetType}
            onChange={(value) =>
              setPending((state) => ({
                ...state,
                targetType: value,
              }))
            }
            style={{ width: 220 }}
          />
        </Form.Item>
        <Form.Item label={CHANGE_HOLIDAY_LABEL.FILTER_PAYROLL_GROUP}>
          <Select
            allowClear
            placeholder="All"
            options={payrollGroupOptions}
            value={pending.payrollGroupId}
            onChange={(value) =>
              setPending((state) => ({
                ...state,
                payrollGroupId: value,
              }))
            }
            style={{ width: 180 }}
          />
        </Form.Item>

        <Form.Item label={CHANGE_HOLIDAY_LABEL.FILTER_EMPLOYEE}>
          <Select
            allowClear
            showSearch
            placeholder="All"
            options={employeeOptions}
            value={pending.employeeId}
            onChange={(value) =>
              setPending((state) => ({
                ...state,
                employeeId: value,
              }))
            }
            style={{ width: 280 }}
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label={`${CHANGE_HOLIDAY_LABEL.FILTER_FROM_PAYROLL_DATE} - ${CHANGE_HOLIDAY_LABEL.FILTER_TO_PAYROLL_DATE}`}
        >
          <RangePicker
            value={
              pending.fromPayrollDate && pending.toPayrollDate
                ? [dayjs(pending.fromPayrollDate), dayjs(pending.toPayrollDate)]
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

        <Form.Item>
          <Button
            icon={<FilterOutlined />}
            onClick={handleSearch}
            type="primary"
          >
            Search
          </Button>
        </Form.Item>
        <Form.Item>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            Clear
          </Button>
        </Form.Item>
      </Form>

      <ChangeHolidayTable
        data={records}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
