import { Form, Input, Button, Row, Col } from "antd";
import type { RawLogsFilterRequest } from "../models/api/response/raw-attendance-log.model";
import { RAW_LOGS_LABEL } from "../constants/label.const";

interface Props {
  onFilter: (filters: RawLogsFilterRequest) => void;
  loading?: boolean;
}

export default function RawLogsFilter({ onFilter, loading }: Props) {
  const [form] = Form.useForm();

  const handleFilter = async () => {
    const values = await form.validateFields();
    onFilter({
      fromDate: values.fromDate || undefined,
      toDate: values.toDate || undefined,
      clientId: values.clientId || undefined,
      employeeId: values.employeeId || undefined,
    });
  };

  const handleReset = () => {
    form.resetFields();
    onFilter({});
  };

  return (
    <Form form={form} layout="vertical" className="bg-white p-4 rounded-lg">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name="fromDate"
            label={RAW_LOGS_LABEL.FROM_DATE}
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
            label={RAW_LOGS_LABEL.TO_DATE}
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
          <Form.Item name="clientId" label={RAW_LOGS_LABEL.CLIENT}>
            <Input placeholder="Enter Client ID" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="employeeId" label={RAW_LOGS_LABEL.EMPLOYEE_FILTER}>
            <Input placeholder="Enter Employee ID" />
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
