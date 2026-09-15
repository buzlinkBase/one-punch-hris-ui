import { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Radio, Select } from "antd";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

export interface BalanceAdjustTarget {
  employeeId: string;
  employeeName: string;
  balance: number;
}

export interface BalanceAdjustSubmitValues {
  employeeId: string;
  amount: number;
  isAddition: boolean;
  particulars: string;
}

interface FormValues {
  employeeId: string;
  amount: number;
  direction: "add" | "remove";
  particulars: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  // Row-triggered "Edit": the employee is fixed and shown read-only. Toolbar-triggered "Add":
  // null, and an employee picker is shown instead — this is what lets HR seed an opening entry
  // for an employee who has no ledger rows yet (e.g. adopting this system mid-year).
  target: BalanceAdjustTarget | null;
  onSubmit: (values: BalanceAdjustSubmitValues) => Promise<void>;
  isSubmitting: boolean;
}

// Shared by the Retirement and Uniform Allowance Ledger reports -- both need the exact same
// "adjust one employee's balance, by direction and amount, with a reason" flow, differing only
// in which mutation/entity they end up calling.
export function BalanceAdjustModal({
  open,
  onClose,
  target,
  onSubmit,
  isSubmitting,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const { data: employees = [] } = useEmployeeFilter(
    {},
    { enabled: open && !target },
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        employeeId: target?.employeeId ?? undefined,
        amount: undefined,
        direction: "add",
        particulars: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, target]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({
      employeeId: target?.employeeId ?? values.employeeId,
      amount: values.amount,
      isAddition: values.direction === "add",
      particulars: values.particulars,
    });
  };

  return (
    <Modal
      title={target ? "Adjust Balance" : "Add Entry"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      confirmLoading={isSubmitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {target ? (
          <p className="text-sm text-gray-500">
            {target.employeeName}
            <br />
            Current balance: <strong>{fmt(target.balance)}</strong>
          </p>
        ) : (
          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: "Required" }]}
          >
            <Select
              showSearch
              placeholder="Select an employee"
              optionFilterProp="label"
              options={employees.map((e) => ({
                value: e.id,
                label: e.name ?? e.id,
              }))}
            />
          </Form.Item>
        )}
        <Form.Item
          name="direction"
          label="Direction"
          rules={[{ required: true }]}
        >
          <Radio.Group
            options={[
              { label: "Add", value: "add" },
              { label: "Remove", value: "remove" },
            ]}
            optionType="button"
          />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: "Required" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0.01} step={0.5} />
        </Form.Item>
        <Form.Item
          name="particulars"
          label="Reason"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="e.g. Opening balance carried over from previous system"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
