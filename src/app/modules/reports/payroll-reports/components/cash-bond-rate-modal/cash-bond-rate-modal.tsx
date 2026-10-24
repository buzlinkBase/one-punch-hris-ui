import { useEffect } from "react";
import { Form, Input, InputNumber, Modal } from "antd";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

export interface CashBondRateTarget {
  employeeId: string;
  employeeName: string;
  currentRate: number;
}

export interface CashBondRateSubmitValues {
  employeeId: string;
  newRate: number;
  reason: string;
}

interface FormValues {
  newRate: number;
  reason: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  target: CashBondRateTarget | null;
  onSubmit: (values: CashBondRateSubmitValues) => Promise<void>;
  isSubmitting: boolean;
}

// HR's quick edit of an employee's per-run cash bond. The new rate is used by the next payroll
// run; runs already generated keep their amounts, and the collected total is not touched.
export function CashBondRateModal({
  open,
  onClose,
  target,
  onSubmit,
  isSubmitting,
}: Props) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (open && target) {
      form.setFieldsValue({ newRate: target.currentRate, reason: "" });
    }
  }, [open, target, form]);

  const handleOk = async () => {
    if (!target) return;
    const values = await form.validateFields();
    await onSubmit({
      employeeId: target.employeeId,
      newRate: values.newRate,
      reason: values.reason,
    });
  };

  return (
    <Modal
      title="Edit Cash Bond Rate"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      confirmLoading={isSubmitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        {target && (
          <p className="text-sm text-gray-500">
            {target.employeeName}
            <br />
            Current rate per payroll: <strong>{fmt(target.currentRate)}</strong>
          </p>
        )}
        <Form.Item
          name="newRate"
          label="New rate per payroll"
          rules={[{ required: true, message: "Required" }]}
          extra="Applies from the next payroll run. Payrolls already generated keep their amounts, and the cash bond collected so far does not change."
        >
          <InputNumber
            className="w-full"
            min={0}
            step={50}
            precision={2}
            prefix="₱"
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Reason"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="e.g. Employee asked to increase savings"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
