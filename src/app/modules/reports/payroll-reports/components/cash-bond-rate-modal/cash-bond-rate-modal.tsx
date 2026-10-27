import { useEffect } from "react";
import { Form, Input, InputNumber, Modal } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatMoney } from "@/shared/utils/money.util";
import {
  cashBondRateFormSchema,
  type CashBondRateFormValues,
} from "../../models/forms/cash-bond-rate-form.schema";

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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CashBondRateFormValues>({
    resolver: zodResolver(cashBondRateFormSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (open && target) {
      reset({ newRate: target.currentRate, reason: "" });
    }
  }, [open, target, reset]);

  const submit = async (values: CashBondRateFormValues) => {
    if (!target) return;
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
      onOk={handleSubmit(submit)}
      okText="Save"
      confirmLoading={isSubmitting}
      destroyOnHidden
    >
      <Form layout="vertical">
        {target && (
          <p className="text-sm text-gray-500">
            {target.employeeName}
            <br />
            Current rate per payroll:{" "}
            <strong>{formatMoney(target.currentRate)}</strong>
          </p>
        )}
        <Form.Item
          label="New rate per payroll"
          required
          validateStatus={errors.newRate ? "error" : ""}
          help={errors.newRate?.message}
          extra="Applies from the next payroll run. Payrolls already generated keep their amounts, and the cash bond collected so far does not change."
        >
          <Controller
            name="newRate"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                value={field.value}
                onChange={(v) => field.onChange(v ?? undefined)}
                className="w-full"
                min={0}
                step={50}
                precision={2}
                prefix="₱"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Reason"
          required
          validateStatus={errors.reason ? "error" : ""}
          help={errors.reason?.message}
        >
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={3}
                placeholder="e.g. Employee asked to increase savings"
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
