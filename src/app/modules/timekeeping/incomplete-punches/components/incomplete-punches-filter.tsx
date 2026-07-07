import { Form, Input, Button, Row, Col } from "antd";
import type { IncompletePunchesFilterRequest } from "../models/api/response/incomplete-punch.model";
import { INCOMPLETE_PUNCHES_LABEL } from "../constants/label.const";

interface Props {
  onFilter: (filters: IncompletePunchesFilterRequest) => void;
  onReset?: () => void;
  loading?: boolean;
}

export default function IncompletePunchesFilter({
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
      departmentId: values.departmentId || undefined,
      clientId: values.clientId || undefined,
      employeeId: values.employeeId || undefined,
      payrollGroupId: values.payrollGroupId || undefined,
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
            label={INCOMPLETE_PUNCHES_LABEL.FROM_DATE}
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
            label={INCOMPLETE_PUNCHES_LABEL.TO_DATE}
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
            name="departmentId"
            label={INCOMPLETE_PUNCHES_LABEL.DEPARTMENT}
          >
            <Input placeholder="Enter Department ID" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="clientId" label={INCOMPLETE_PUNCHES_LABEL.CLIENT}>
            <Input placeholder="Enter Client ID" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name="employeeId"
            label={INCOMPLETE_PUNCHES_LABEL.EMPLOYEE}
          >
            <Input placeholder="Enter Employee ID" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name="payrollGroupId"
            label={INCOMPLETE_PUNCHES_LABEL.PAYROLL_GROUP}
          >
            <Input placeholder="Enter Payroll Group ID" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[8, 8]} justify="start">
        <Col>
          <Button type="primary" onClick={handleFilter} loading={loading}>
            Apply Filters
          </Button>
        </Col>
        <Col>
          <Button onClick={handleReset}>Reset</Button>
        </Col>
      </Row>
    </Form>
  );
}
