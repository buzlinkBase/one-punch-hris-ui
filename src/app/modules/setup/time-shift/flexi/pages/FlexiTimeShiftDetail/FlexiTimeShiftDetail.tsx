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
  flexiTimeShiftFormSchema,
  type FlexiTimeShiftFormValues,
} from "../../models/forms/flexi-time-shift-form.schema";
import {
  useFlexiTimeShift,
  useCreateFlexiTimeShift,
  useUpdateFlexiTimeShift,
} from "../../hooks/useFlexiTimeShiftQueries";
import { FLEXI_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function FlexiTimeShiftDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useFlexiTimeShift(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateFlexiTimeShift();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateFlexiTimeShift();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FlexiTimeShiftFormValues>({
    resolver: zodResolver(flexiTimeShiftFormSchema),
    defaultValues: {
      code: "",
      name: "",
      coreTimeStart: "",
      coreTimeEnd: "",
      workDuration: 8,
      status: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        coreTimeStart: selected.coreTimeStart,
        coreTimeEnd: selected.coreTimeEnd,
        workDuration: selected.workDuration,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: FlexiTimeShiftFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
    navigate({ to: "/setup/time-shift/flexi" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? FLEXI_TIME_SHIFT_LABEL.EDIT_TITLE
                : FLEXI_TIME_SHIFT_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure flexi shift windows and required core working hours.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/time-shift/flexi" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={FLEXI_TIME_SHIFT_LABEL.CODE}
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
            label={FLEXI_TIME_SHIFT_LABEL.NAME}
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
              label={FLEXI_TIME_SHIFT_LABEL.CORE_TIME_START}
              validateStatus={errors.coreTimeStart ? "error" : ""}
              help={errors.coreTimeStart?.message}
            >
              <Controller
                name="coreTimeStart"
                control={control}
                render={({ field }) => <Input {...field} placeholder="HH:MM" />}
              />
            </Form.Item>
            <Form.Item
              label={FLEXI_TIME_SHIFT_LABEL.CORE_TIME_END}
              validateStatus={errors.coreTimeEnd ? "error" : ""}
              help={errors.coreTimeEnd?.message}
            >
              <Controller
                name="coreTimeEnd"
                control={control}
                render={({ field }) => <Input {...field} placeholder="HH:MM" />}
              />
            </Form.Item>
            <Form.Item
              label={FLEXI_TIME_SHIFT_LABEL.WORK_DURATION}
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
            label={FLEXI_TIME_SHIFT_LABEL.STATUS}
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
                onClick={() => navigate({ to: "/setup/time-shift/flexi" })}
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
