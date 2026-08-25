import { Form, Input, Modal, TimePicker } from "antd";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  fromTimeSpan,
  toTimeSpan,
  timeSpanToSeconds,
} from "@/shared/utils/time-span.util";
import { useCreateFixedTimeShift } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import type { CreateFixedTimeShift } from "@/app/modules/setup/time-shift/fixed/models/api/request/create-fixed-time-shift.model";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

const quickTimeShiftSchema = z
  .object({
    shiftName: z.string().min(1, "Shift name is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine(
    (v) => timeSpanToSeconds(v.endTime) > timeSpanToSeconds(v.startTime),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

type QuickTimeShiftFormValues = z.infer<typeof quickTimeShiftSchema>;

export default function QuickAddTimeShiftModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickTimeShiftFormValues>({
    resolver: zodResolver(
      quickTimeShiftSchema,
    ) as Resolver<QuickTimeShiftFormValues>,
    defaultValues: {
      shiftName: "",
      startTime: "08:00:00",
      endTime: "17:00:00",
    },
  });

  const { mutateAsync: create, isPending } = useCreateFixedTimeShift();

  const onSubmit = async (values: QuickTimeShiftFormValues) => {
    try {
      // Only the essentials are captured here — grace period, breaks, and OT
      // rules default to "none" and can be refined later from Time Shift setup.
      const payload: CreateFixedTimeShift = {
        shiftName: values.shiftName,
        shiftType: "FIXED",
        startTime: values.startTime,
        endTime: values.endTime,
        gracePeriodMinutes: 0,
        withLunchBreak: "NONE",
        lunchStartTime: null,
        lunchEndTime: null,
        breakDurationMinutes: 0,
        withAMBreak: "NONE",
        amStartTime: null,
        amEndTime: null,
        withPMBreak: "NONE",
        pmStartTime: null,
        pmEndTime: null,
        maxWorkingMinutes: 480,
        minimumWorkMinutes: 0,
        withOT: false,
        otRequireTimeIn: false,
        otStart: "00:00:00",
        overTimeThreshold: 0,
      };
      const created = await create(payload);
      reset();
      onCreated(created.id);
    } catch {
      // handled by global interceptor
    }
  };

  return (
    <Modal
      title="Add Time Shift"
      open={open}
      onCancel={() => {
        reset();
        onClose();
      }}
      onOk={handleSubmit(onSubmit)}
      okText="Save"
      confirmLoading={isPending}
      destroyOnClose
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="Shift Name"
          required
          validateStatus={errors.shiftName ? "error" : ""}
          help={errors.shiftName?.message}
        >
          <Controller
            name="shiftName"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="e.g. Regular Day Shift" />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Start Time"
          required
          validateStatus={errors.startTime ? "error" : ""}
          help={errors.startTime?.message}
        >
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                className="w-full"
                value={fromTimeSpan(field.value)}
                onChange={(val) => field.onChange(toTimeSpan(val))}
                format="HH:mm"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label="End Time"
          required
          validateStatus={errors.endTime ? "error" : ""}
          help={errors.endTime?.message}
        >
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                className="w-full"
                value={fromTimeSpan(field.value)}
                onChange={(val) => field.onChange(toTimeSpan(val))}
                format="HH:mm"
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
