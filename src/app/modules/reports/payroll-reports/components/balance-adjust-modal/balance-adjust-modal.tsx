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
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { formatMoney } from "@/shared/utils/money.util";
import {
  buildBalanceAdjustFormSchema,
  type BalanceAdjustFormValues,
} from "../../models/forms/balance-adjust-form.schema";

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
  const { data: employees = [] } = useEmployeeFilter(
    {},
    { enabled: open && !target },
  );
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BalanceAdjustFormValues>({
    resolver: zodResolver(
      buildBalanceAdjustFormSchema({
        pickEmployee: !target,
        askEntryDate: showEntryDate,
      }),
    ),
    defaultValues: { direction: "add", particulars: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        employeeId: target?.employeeId ?? undefined,
        amount: undefined,
        direction: "add",
        particulars: "",
        entryDate: dayjs(),
      });
    }
  }, [open, target, reset]);

  const submit = async (values: BalanceAdjustFormValues) => {
    await onSubmit({
      employeeId: target?.employeeId ?? values.employeeId ?? "",
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
      onOk={handleSubmit(submit)}
      okText="Save"
      confirmLoading={isSubmitting}
      destroyOnClose
    >
      <Form layout="vertical">
        {target ? (
          <p className="text-sm text-gray-500">
            {target.employeeName}
            <br />
            Current balance: <strong>{formatMoney(target.balance)}</strong>
          </p>
        ) : (
          <Form.Item
            label="Employee"
            required
            validateStatus={errors.employeeId ? "error" : ""}
            help={errors.employeeId?.message}
          >
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select an employee"
                  optionFilterProp="label"
                  options={employees.map((e) => ({
                    value: e.id,
                    label: e.name ?? e.id,
                  }))}
                />
              )}
            />
          </Form.Item>
        )}
        <Form.Item label="Direction" required>
          <Controller
            name="direction"
            control={control}
            render={({ field }) => (
              <Radio.Group
                {...field}
                options={[
                  { label: "Add", value: "add" },
                  { label: "Remove", value: "remove" },
                ]}
                optionType="button"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={amountLabel}
          required
          validateStatus={errors.amount ? "error" : ""}
          help={errors.amount?.message}
        >
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                value={field.value}
                onChange={(v) => field.onChange(v ?? undefined)}
                className="w-full"
                min={0.0001}
                step={amountStep}
                precision={4}
                // Drops precision's trailing zeros ("0.2500" → "0.25") without fighting typing.
                formatter={(v, { userTyping, input }) =>
                  userTyping ? input : v === undefined ? "" : String(Number(v))
                }
              />
            )}
          />
        </Form.Item>
        {showEntryDate && (
          <Form.Item
            label="Entry Date"
            required
            validateStatus={errors.entryDate ? "error" : ""}
            help={errors.entryDate?.message}
            extra="Counts toward the total from this date onward."
          >
            <Controller
              name="entryDate"
              control={control}
              render={({ field }) => (
                <DatePicker {...field} className="w-full" allowClear={false} />
              )}
            />
          </Form.Item>
        )}
        <Form.Item
          label="Reason"
          required
          validateStatus={errors.particulars ? "error" : ""}
          help={errors.particulars?.message}
        >
          <Controller
            name="particulars"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={3}
                placeholder="e.g. Opening balance carried over from previous system"
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
