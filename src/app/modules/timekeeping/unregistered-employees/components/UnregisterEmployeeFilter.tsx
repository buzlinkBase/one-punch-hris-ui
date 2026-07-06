import { Button, Col, Form, Input, Row } from "antd";
import { UNREGISTER_EMPLOYEE_LABEL } from "../constants/label.const";
import type { UnregisterEmployeeFilter } from "../models/api/request/unregister-employee-filter.model";

interface Props {
  onFilter: (filters: UnregisterEmployeeFilter) => void;
  onReset?: () => void;
  loading?: boolean;
}

export default function UnregisterEmployeeFilter({
  onFilter,
  onReset,
  loading,
}: Props) {
  const [form] = Form.useForm();

  const handleFilter = async () => {
    const values = await form.validateFields();

    onFilter({
      fromDate: values.fromDate || undefined,
      toDate: values.toDate || undefined,
    });
  };

  const handleReset = () => {
    form.resetFields();
    onFilter({});
    onReset?.();
  };

  return (
    <Form form={form} layout="vertical">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name="fromDate"
            label={UNREGISTER_EMPLOYEE_LABEL.FROM_DATE}
            rules={[
              {
                pattern: /^\d{4}-\d{2}-\d{2}$/,
                message: "Format: YYYY-MM-DD",
              },
            ]}
          >
            <Input type="date" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name="toDate"
            label={UNREGISTER_EMPLOYEE_LABEL.TO_DATE}
            rules={[
              {
                pattern: /^\d{4}-\d{2}-\d{2}$/,
                message: "Format: YYYY-MM-DD",
              },
            ]}
          >
            <Input type="date" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[8, 8]} justify="start">
        <Col>
          <Button type="primary" onClick={handleFilter} loading={loading}>
            {UNREGISTER_EMPLOYEE_LABEL.FILTER}
          </Button>
        </Col>
        <Col>
          <Button onClick={handleReset}>
            {UNREGISTER_EMPLOYEE_LABEL.RESET}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
