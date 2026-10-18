import { useMemo } from "react";
import { DatePicker, Form, InputNumber, Modal } from "antd";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import dayjs, { type Dayjs } from "dayjs";

export interface ScheduleRowEditValue {
  date: string;
  amount: number;
}

interface ScheduleRowEditModalProps {
  // The row being edited; null keeps the modal closed.
  row: ScheduleRowEditValue | null;
  // Inclusive bounds the payment date must stay within (YYYY-MM-DD), when the schedule has them.
  minDate?: string;
  maxDate?: string;
  // Dates already used by the schedule's other rows.
  takenDates: string[];
  onSave: (value: ScheduleRowEditValue) => void;
  onCancel: () => void;
}

const FORM_ID = "schedule-row-edit-form";

function buildSchema(
  minDate: string | undefined,
  maxDate: string | undefined,
  takenDates: string[],
) {
  return z
    .object({
      date: z.string().min(1, "Date is required"),
      amount: z.number().gt(0, "Amount must be more than 0"),
    })
    .superRefine((v, ctx) => {
      if (minDate && v.date < minDate) {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: `Date can't be before ${minDate}`,
        });
      }
      if (maxDate && v.date > maxDate) {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: `Date can't be after ${maxDate}`,
        });
      }
      if (takenDates.includes(v.date)) {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: "Another row is already scheduled on this date",
        });
      }
    });
}

function RowForm({
  row,
  minDate,
  maxDate,
  takenDates,
  onSave,
}: Omit<ScheduleRowEditModalProps, "row" | "onCancel"> & {
  row: ScheduleRowEditValue;
}) {
  const schema = useMemo(
    () => buildSchema(minDate, maxDate, takenDates),
    [minDate, maxDate, takenDates],
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleRowEditValue>({
    resolver: zodResolver(schema),
    defaultValues: row,
  });

  const isOutOfRange = (d: Dayjs) => {
    const value = d.format("YYYY-MM-DD");
    return (!!minDate && value < minDate) || (!!maxDate && value > maxDate);
  };

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSave)}>
      <Form component={false} layout="vertical">
        <Form.Item
          label="Date"
          validateStatus={errors.date ? "error" : ""}
          help={errors.date?.message}
          required
        >
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                className="w-full"
                value={field.value ? dayjs(field.value) : null}
                disabledDate={isOutOfRange}
                onChange={(d) => field.onChange(d?.format("YYYY-MM-DD") ?? "")}
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Amount"
          validateStatus={errors.amount ? "error" : ""}
          help={errors.amount?.message}
          required
        >
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
                min={0}
                precision={2}
                className="w-full!"
                addonBefore="₱"
              />
            )}
          />
        </Form.Item>
      </Form>
    </form>
  );
}

// Moves one schedule row to another date and/or changes its amount.
export function ScheduleRowEditModal({
  row,
  onCancel,
  ...rest
}: ScheduleRowEditModalProps) {
  return (
    <Modal
      title="Edit Schedule Row"
      open={!!row}
      onCancel={onCancel}
      okText="Apply"
      okButtonProps={{ htmlType: "submit", form: FORM_ID }}
      destroyOnHidden
    >
      {row && <RowForm row={row} {...rest} />}
    </Modal>
  );
}
