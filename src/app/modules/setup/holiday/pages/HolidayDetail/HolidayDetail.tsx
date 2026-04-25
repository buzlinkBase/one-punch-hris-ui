import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Typography,
  Space,
  Tag,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  holidayFormSchema,
  type HolidayFormValues,
} from "../../models/forms/holiday-form.schema";
import {
  useHoliday,
  useCreateHoliday,
  useUpdateHoliday,
} from "../../hooks/useHolidayQueries";
import {
  HOLIDAY_LABEL,
  HOLIDAY_TYPE_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import dayjs from "dayjs";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function HolidayDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useHoliday(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateHoliday();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateHoliday();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: { name: "", date: "", type: "Regular", status: "" },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        name: selected.name,
        date: selected.date,
        type: selected.type,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: HolidayFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
    navigate({ to: "/setup/holiday" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? HOLIDAY_LABEL.EDIT_TITLE : HOLIDAY_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define holiday dates and types used in attendance calculations.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/holiday" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={HOLIDAY_LABEL.NAME}
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          <Form.Item
            label={HOLIDAY_LABEL.DATE}
            validateStatus={errors.date ? "error" : ""}
            help={errors.date?.message}
          >
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  className="w-full"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(d) => field.onChange(d ? d.toISOString() : "")}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            label={HOLIDAY_LABEL.TYPE}
            validateStatus={errors.type ? "error" : ""}
            help={errors.type?.message}
          >
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select {...field} options={HOLIDAY_TYPE_OPTIONS} />
              )}
            />
          </Form.Item>
          <Form.Item
            label={HOLIDAY_LABEL.STATUS}
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
              <Button onClick={() => navigate({ to: "/setup/holiday" })}>
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
