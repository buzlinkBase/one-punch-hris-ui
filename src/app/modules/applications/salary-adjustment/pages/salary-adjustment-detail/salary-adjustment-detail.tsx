import { useEffect, useMemo } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import {
  useCreateSalaryAdjustment,
  useSalaryAdjustment,
  useUpdateSalaryAdjustment,
} from "../../hooks/use-salary-adjustment-queries";
import { ADJUSTMENT_TYPE_OPTIONS } from "../../constants/label.const";

const { Title } = Typography;

interface FormValues {
  employeeId: string;
  adjustmentType: number;
  payrollDate: dayjs.Dayjs;
  amount: number;
  remarks?: string;
}

export default function SalaryAdjustmentDetail() {
  const navigate = useNavigate();
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = !!id;
  const [form] = Form.useForm<FormValues>();

  const { data: existing, isLoading: loadingExisting } =
    useSalaryAdjustment(id);
  const { data: rawEmployees = [] } = useEmployees();
  const { mutate: create, isPending: creating } = useCreateSalaryAdjustment();
  const { mutate: update, isPending: updating } = useUpdateSalaryAdjustment();

  const empOptions = useMemo(
    () =>
      rawEmployees.map((e) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName}`,
      })),
    [rawEmployees],
  );

  useEffect(() => {
    if (existing) {
      form.setFieldsValue({
        employeeId: existing.employeeId,
        adjustmentType: existing.adjustmentType,
        payrollDate: dayjs(existing.payrollDate),
        amount: existing.amount,
        remarks: existing.remarks,
      });
    }
  }, [existing, form]);

  const handleSubmit = (values: FormValues) => {
    const payload = {
      employeeId: values.employeeId,
      adjustmentType: values.adjustmentType,
      payrollDate: values.payrollDate.format("YYYY-MM-DD"),
      amount: values.amount,
      remarks: values.remarks,
    };

    if (isEdit) {
      update(
        { id: id!, payload: { ...payload, id: id! } },
        {
          onSuccess: () => {
            message.success("Updated.");
            navigate({ to: "/applications/salary-adjustment" });
          },
          onError: () => message.error("Update failed."),
        },
      );
    } else {
      create(payload, {
        onSuccess: () => {
          message.success("Created.");
          navigate({ to: "/applications/salary-adjustment" });
        },
        onError: () => message.error("Create failed."),
      });
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? "Edit Salary Adjustment" : "New Salary Adjustment"}
            </Title>
            <p className="page-toolbar-subtitle">
              One-time salary, allowance, or deduction correction applied during
              payroll run.
            </p>
          </div>
          <Space>
            <Button
              onClick={() =>
                navigate({ to: "/applications/salary-adjustment" })
              }
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={creating || updating}
            >
              Save
            </Button>
          </Space>
        </div>
      </div>

      <Card loading={isEdit && loadingExisting}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 560 }}
        >
          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: "Select an employee" }]}
          >
            <Select
              showSearch
              options={empOptions}
              filterOption={(input, opt) =>
                (opt?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              placeholder="Search employee"
            />
          </Form.Item>

          <Form.Item
            name="adjustmentType"
            label="Adjustment Type"
            rules={[{ required: true, message: "Select a type" }]}
          >
            <Select
              options={ADJUSTMENT_TYPE_OPTIONS}
              placeholder="Select type"
            />
          </Form.Item>

          <Form.Item
            name="payrollDate"
            label="Payroll Date"
            rules={[{ required: true, message: "Select a payroll date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Enter an amount" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0.01}
              precision={2}
              prefix="₱"
            />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={2} placeholder="Optional remarks" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
