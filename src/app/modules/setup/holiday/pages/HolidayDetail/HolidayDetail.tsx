import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Switch,
  Typography,
  Space,
  Tag,
  Alert,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
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
  WORK_TYPE_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/useOperationAreaQueries";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const filterByLabel = (input: string, option?: { label?: string | number | boolean }) =>
  String(option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export default function HolidayDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useHoliday(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateHoliday();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateHoliday();
  const { data: areas = [], isLoading: isAreasLoading } = useOperationAreas();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema) as Resolver<HolidayFormValues>,
    defaultValues: {
      description: "",
      holType: "LEGAL",
      workType: "NonWorking",
      holDate: "",
      isRecuring: false,
      isPaid: false,
      areaId: null,
      status: "ACTIVE",
    },
  });

  const watchedHolType = useWatch({ control, name: "holType" });
  const isLegal = watchedHolType === "LEGAL";
  const isSpecial = watchedHolType === "SPECIAL";

  useEffect(() => {
    if (isLegal) {
      setValue("workType", "NonWorking");
      setValue("areaId", null);
    }
  }, [isLegal, setValue]);

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        description: selected.description,
        holType: selected.holType,
        workType: selected.workType,
        holDate: selected.holDate,
        isRecuring: selected.isRecuring,
        isPaid: selected.isPaid,
        areaId: selected.areaId ?? null,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: HolidayFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
    navigate({ to: "/setup/holiday" });
  };

  const areaOptions = areas.map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }));

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
          <div className="form-grid-2">

            <Form.Item
              label={HOLIDAY_LABEL.DESCRIPTION}
              validateStatus={errors.description ? "error" : ""}
              help={errors.description?.message}
              className="col-span-2"
            >
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item
              label={HOLIDAY_LABEL.HOL_DATE}
              validateStatus={errors.holDate ? "error" : ""}
              help={errors.holDate?.message}
            >
              <Controller
                name="holDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="w-full"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) => field.onChange(d ? d.format("YYYY-MM-DD") : "")}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={HOLIDAY_LABEL.HOL_TYPE}
              validateStatus={errors.holType ? "error" : ""}
              help={errors.holType?.message}
            >
              <Controller
                name="holType"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={HOLIDAY_TYPE_OPTIONS} />
                )}
              />
            </Form.Item>

            <Form.Item label={HOLIDAY_LABEL.WORK_TYPE}>
              {isLegal ? (
                <Alert
                  message="Legal holidays are always non-working."
                  type="info"
                  showIcon
                  className="py-1"
                />
              ) : (
                <Controller
                  name="workType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={WORK_TYPE_OPTIONS} />
                  )}
                />
              )}
            </Form.Item>

            {isSpecial && (
              <Form.Item label={HOLIDAY_LABEL.AREA}>
                <Controller
                  name="areaId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? undefined}
                      onChange={(v) => field.onChange(v ?? null)}
                      options={areaOptions}
                      loading={isAreasLoading}
                      allowClear
                      showSearch
                      filterOption={filterByLabel}
                      placeholder="Select area (leave blank for nationwide)"
                    />
                  )}
                />
              </Form.Item>
            )}

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

            <Form.Item label={HOLIDAY_LABEL.IS_PAID} className="col-span-2">
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <Controller
                    name="isPaid"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                  <span>Paid Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <Controller
                    name="isRecuring"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                  <span>Recurring Annually</span>
                </div>
              </div>
            </Form.Item>

          </div>

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
