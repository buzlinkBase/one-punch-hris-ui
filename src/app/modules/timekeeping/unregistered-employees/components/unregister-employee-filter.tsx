import { Button, DatePicker, Form } from "antd";
import dayjs from "dayjs";
import { UNREGISTER_EMPLOYEE_LABEL } from "../constants/label.const";
import type { UnregisterEmployeeFilter } from "../models/api/request/unregister-employee-filter.model";

const { RangePicker } = DatePicker;

interface Props {
  onFilter: (filters: UnregisterEmployeeFilter) => void;
  loading?: boolean;
  defaultValues?: UnregisterEmployeeFilter;
}

export default function UnregisterEmployeeFilter({
  onFilter,
  loading,
  defaultValues,
}: Props) {
  const [form] = Form.useForm();

  const handleFilter = async () => {
    const values = await form.validateFields();
    const [from, to] = values.dateRange ?? [];
    onFilter({
      fromDate: from ? dayjs(from).format("YYYY-MM-DD") : undefined,
      toDate: to ? dayjs(to).format("YYYY-MM-DD") : undefined,
    });
  };

  const initial =
    defaultValues?.fromDate && defaultValues?.toDate
      ? {
          dateRange: [
            dayjs(defaultValues.fromDate),
            dayjs(defaultValues.toDate),
          ],
        }
      : undefined;

  return (
    <Form form={form} layout="vertical" initialValues={initial}>
      <div className="flex flex-wrap gap-3 items-end">
        <Form.Item
          name="dateRange"
          label={UNREGISTER_EMPLOYEE_LABEL.DATE_RANGE}
          className="mb-0"
        >
          <RangePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item className="mb-0">
          <Button type="primary" onClick={handleFilter} loading={loading}>
            {UNREGISTER_EMPLOYEE_LABEL.FILTER}
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
}
