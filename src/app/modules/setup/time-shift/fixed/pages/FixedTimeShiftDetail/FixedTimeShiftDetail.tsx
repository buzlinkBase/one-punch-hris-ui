import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Typography,
  Space,
  Tag,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fixedTimeShiftFormSchema,
  type FixedTimeShiftFormValues,
} from "../../models/forms/fixed-time-shift-form.schema";
import {
  useFixedTimeShift,
  useCreateFixedTimeShift,
  useUpdateFixedTimeShift,
} from "../../hooks/useFixedTimeShiftQueries";
import { FIXED_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function FixedTimeShiftDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useFixedTimeShift(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateFixedTimeShift();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateFixedTimeShift();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FixedTimeShiftFormValues>({
    resolver: zodResolver(fixedTimeShiftFormSchema),
    defaultValues: {
      code: "",
      name: "",
      timeIn: "",
      timeOut: "",
      breakDuration: 60,
      workDuration: 8,
      status: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        timeIn: selected.timeIn,
        timeOut: selected.timeOut,
        breakDuration: selected.breakDuration,
        workDuration: selected.workDuration,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: FixedTimeShiftFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
    navigate({ to: "/setup/time-shift/fixed" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? FIXED_TIME_SHIFT_LABEL.EDIT_TITLE
                : FIXED_TIME_SHIFT_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Maintain fixed shift templates with consistent start and end time.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/time-shift/fixed" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={FIXED_TIME_SHIFT_LABEL.CODE}
            validateStatus={errors.code ? "error" : ""}
            help={errors.code?.message}
          >
            <Controller
              name="code"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          <Form.Item
            label={FIXED_TIME_SHIFT_LABEL.NAME}
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          <div className="form-grid-2">
            <Form.Item
              label={FIXED_TIME_SHIFT_LABEL.TIME_IN}
              validateStatus={errors.timeIn ? "error" : ""}
              help={errors.timeIn?.message}
            >
              <Controller
                name="timeIn"
                control={control}
                render={({ field }) => <Input {...field} placeholder="HH:MM" />}
              />
            </Form.Item>
            <Form.Item
              label={FIXED_TIME_SHIFT_LABEL.TIME_OUT}
              validateStatus={errors.timeOut ? "error" : ""}
              help={errors.timeOut?.message}
            >
              <Controller
                name="timeOut"
                control={control}
                render={({ field }) => <Input {...field} placeholder="HH:MM" />}
              />
            </Form.Item>
            <Form.Item
              label={FIXED_TIME_SHIFT_LABEL.BREAK_DURATION}
              validateStatus={errors.breakDuration ? "error" : ""}
              help={errors.breakDuration?.message}
            >
              <Controller
                name="breakDuration"
                control={control}
                render={({ field }) => (
                  <InputNumber className="w-full" {...field} min={0} />
                )}
              />
            </Form.Item>
            <Form.Item
              label={FIXED_TIME_SHIFT_LABEL.WORK_DURATION}
              validateStatus={errors.workDuration ? "error" : ""}
              help={errors.workDuration?.message}
            >
              <Controller
                name="workDuration"
                control={control}
                render={({ field }) => (
                  <InputNumber className="w-full" {...field} min={1} />
                )}
              />
            </Form.Item>
          </div>
          <Form.Item
            label={FIXED_TIME_SHIFT_LABEL.STATUS}
            validateStatus={errors.status ? "error" : ""}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} options={STATUS_OPTIONS} />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: "/setup/time-shift/fixed" })}
              >
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating || isCreating}
              >
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
