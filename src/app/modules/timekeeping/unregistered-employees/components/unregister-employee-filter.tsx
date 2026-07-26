import { Button, Col, DatePicker, Form, Row } from "antd";
import dayjs from "dayjs";
import { UNREGISTER_EMPLOYEE_LABEL } from "../constants/label.const";
import type { UnregisterEmployeeFilter } from "../models/api/request/unregister-employee-filter.model";

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
    onFilter({
      fromDate: values.fromDate
        ? dayjs(values.fromDate).format("YYYY-MM-DD")
        : undefined,
      toDate: values.toDate
        ? dayjs(values.toDate).format("YYYY-MM-DD")
        : undefined,
    });
  };

  const initial = defaultValues
    ? {
        fromDate: defaultValues.fromDate ? dayjs(defaultValues.fromDate) : null,
        toDate: defaultValues.toDate ? dayjs(defaultValues.toDate) : null,
      }
    : undefined;

  return (
    <Form form={form} layout="vertical" initialValues={initial}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name="fromDate"
            label={UNREGISTER_EMPLOYEE_LABEL.FROM_DATE}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="toDate" label={UNREGISTER_EMPLOYEE_LABEL.TO_DATE}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[8, 8]} justify="start">
        <Col>
          <Button type="primary" onClick={handleFilter} loading={loading}>
            {UNREGISTER_EMPLOYEE_LABEL.FILTER}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
