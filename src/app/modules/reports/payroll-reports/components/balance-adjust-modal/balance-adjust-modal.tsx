import { useEffect } from "react";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
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
  /** YYYY-MM-DD; only sent when the modal shows the entry date field. */
  entryDate?: string;
}

interface FormValues {
  employeeId: string;
  amount: number;
  direction: "add" | "remove";
  particulars: string;
  entryDate?: Dayjs;
}

interface Props {
  open: boolean;
  onClose: () => void;
  // "Adjust" from a ledger's details: the employee is fixed and shown read-only. Toolbar "Add":
  // null, and an employee picker is shown instead — this is what lets HR seed an opening entry
  // for an employee who has no ledger rows yet (e.g. adopting this system mid-year).
  target: BalanceAdjustTarget | null;
  onSubmit: (values: BalanceAdjustSubmitValues) => Promise<void>;
  isSubmitting: boolean;
  // For balances reported "as of" a date (Cash Bond): lets HR date the entry, e.g. an opening
  // balance dated before any payroll in this system. Defaults to today.
  showEntryDate?: boolean;
  // What the amount is counted in, e.g. "Days" for leave credits. Defaults to "Amount" (pesos).
  amountLabel?: string;
  // Spinner increment; any value down to 0.0001 can still be typed (e.g. 0.25 or 0.125 days).
  amountStep?: number;
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
  showEntryDate = false,
  amountLabel = "Amount",
  amountStep = 1,
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
        entryDate: dayjs(),
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
      entryDate:
        showEntryDate && values.entryDate
          ? values.entryDate.format("YYYY-MM-DD")
          : undefined,
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
          label={amountLabel}
          rules={[{ required: true, message: "Required" }]}
        >
          <InputNumber
            className="w-full"
            min={0.0001}
            step={amountStep}
            precision={4}
            // Drops precision's trailing zeros ("0.2500" → "0.25") without fighting typing.
            formatter={(v, { userTyping, input }) =>
              userTyping ? input : v === undefined ? "" : String(Number(v))
            }
          />
        </Form.Item>
        {showEntryDate && (
          <Form.Item
            name="entryDate"
            label="Entry Date"
            rules={[{ required: true, message: "Required" }]}
            extra="Counts toward the total from this date onward."
          >
            <DatePicker className="w-full" allowClear={false} />
          </Form.Item>
        )}
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
