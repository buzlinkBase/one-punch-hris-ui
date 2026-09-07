import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Switch,
  Radio,
  Typography,
  Space,
  Tag,
  Alert,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
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
} from "../../hooks/use-holiday-queries";
import {
  HOLIDAY_LABEL,
  HOLIDAY_TYPE_OPTIONS,
  WORK_TYPE_OPTIONS,
  WEEK_OF_MONTH_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  MONTH_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { isActiveStatus } from "@/shared/utils/status.util";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

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
      weekOfMonth: null,
      dayOfWeek: null,
      isPaid: false,
      areaId: null,
      status: "ACTIVE",
    },
  });

  const watchedHolType = useWatch({ control, name: "holType" });
  const isLegal = watchedHolType === "LEGAL";
  const isSpecial = watchedHolType === "SPECIAL";
  const watchedIsRecuring = useWatch({ control, name: "isRecuring" });
  const watchedHolDate = useWatch({ control, name: "holDate" });
  const watchedWeekOfMonth = useWatch({ control, name: "weekOfMonth" });
  const watchedDayOfWeek = useWatch({ control, name: "dayOfWeek" });
  // "Fixed date" (today's plain recurrence, month+day) vs. "Nth weekday of month" (e.g.
  // National Heroes Day = "last Monday of August") — a UI-only choice, derived straight
  // from the form's own weekOfMonth/dayOfWeek fields rather than tracked as separate
  // state, so it always reflects whatever record is loaded with no extra sync effect.
  const recurrenceMode: "fixed" | "nthWeekday" =
    watchedWeekOfMonth != null && watchedDayOfWeek != null
      ? "nthWeekday"
      : "fixed";

  useEffect(() => {
    if (isLegal) {
      setValue("workType", "NonWorking");
      setValue("areaId", null);
    }
  }, [isLegal, setValue]);

  useEffect(() => {
    setValue("isPaid", isLegal);
  }, [isLegal, setValue]);

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        description: selected.description,
        holType: (
          (selected.holidayType ?? selected.holType) as string | undefined
        )?.toUpperCase() as "LEGAL" | "SPECIAL",
        workType: selected.workType,
        holDate: selected.holDate,
        isRecuring: selected.isRecuring,
        weekOfMonth: selected.weekOfMonth ?? null,
        dayOfWeek: selected.dayOfWeek ?? null,
        isPaid: selected.isPaid,
        areaId: selected.areaId ?? null,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const handleRecurrenceModeChange = (mode: "fixed" | "nthWeekday") => {
    if (mode === "fixed") {
      setValue("weekOfMonth", null);
      setValue("dayOfWeek", null);
    } else {
      setValue("weekOfMonth", 5);
      setValue("dayOfWeek", "Monday");
    }
  };

  const handleRecurringToggle = (checked: boolean) => {
    setValue("isRecuring", checked);
    if (!checked) {
      setValue("weekOfMonth", null);
      setValue("dayOfWeek", null);
    }
  };

  const onSubmit = async (values: HolidayFormValues) => {
    const payload = {
      ...values,
      weekOfMonth: values.isRecuring ? values.weekOfMonth : null,
      dayOfWeek: values.isRecuring ? values.dayOfWeek : null,
    };
    if (isEdit && id) await update({ id, ...payload });
    else await add(payload);
    navigate({ to: "/setup/holiday" });
  };

  const areaOptions = areas
    .filter((a) => isActiveStatus(a.status))
    .map((a) => ({
      value: a.id,
      label: `${a.code} - ${a.name}`,
    }));

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
              help={
                errors.holDate?.message ??
                (watchedIsRecuring && recurrenceMode === "nthWeekday"
                  ? "Day is derived from the recurrence rule below — only the month matters here."
                  : undefined)
              }
            >
              <Controller
                name="holDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="w-full"
                    value={field.value ? dayjs(field.value) : null}
                    disabled={
                      watchedIsRecuring && recurrenceMode === "nthWeekday"
                    }
                    onChange={(d) =>
                      field.onChange(d ? d.format("YYYY-MM-DD") : "")
                    }
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
                  <Select
                    {...field}
                    options={HOLIDAY_TYPE_OPTIONS}
                    placeholder="Select type"
                  />
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
                    <Select
                      {...field}
                      options={WORK_TYPE_OPTIONS}
                      placeholder="Select work type"
                    />
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
                  <Select
                    {...field}
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                  />
                )}
              />
            </Form.Item>

            <Form.Item label={HOLIDAY_LABEL.IS_RECURING} className="col-span-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Controller
                    name="isRecuring"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={handleRecurringToggle}
                      />
                    )}
                  />
                  <span>Recurring Annually</span>
                </div>

                {watchedIsRecuring && (
                  <div className="flex flex-col gap-3">
                    <Radio.Group
                      value={recurrenceMode}
                      onChange={(e) =>
                        handleRecurrenceModeChange(e.target.value)
                      }
                      options={[
                        { value: "fixed", label: "Fixed date" },
                        {
                          value: "nthWeekday",
                          label: "nth weekday of month",
                        },
                      ]}
                    />

                    {recurrenceMode === "nthWeekday" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Form.Item label={HOLIDAY_LABEL.MONTH} className="mb-0">
                          <Select
                            value={
                              watchedHolDate
                                ? dayjs(watchedHolDate).month() + 1
                                : undefined
                            }
                            onChange={(month: number) => {
                              const year = watchedHolDate
                                ? dayjs(watchedHolDate).year()
                                : dayjs().year();
                              setValue(
                                "holDate",
                                dayjs(
                                  `${year}-${month}-01`,
                                  "YYYY-M-DD",
                                ).format("YYYY-MM-DD"),
                              );
                            }}
                            options={MONTH_OPTIONS}
                            placeholder="Select month"
                          />
                        </Form.Item>
                        <Form.Item
                          label={HOLIDAY_LABEL.WEEK_OF_MONTH}
                          className="mb-0"
                        >
                          <Controller
                            name="weekOfMonth"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                value={field.value ?? undefined}
                                onChange={(v) => field.onChange(v)}
                                options={WEEK_OF_MONTH_OPTIONS}
                                placeholder="Select week"
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item
                          label={HOLIDAY_LABEL.DAY_OF_WEEK}
                          className="mb-0"
                        >
                          <Controller
                            name="dayOfWeek"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                value={field.value ?? undefined}
                                onChange={(v) => field.onChange(v)}
                                options={DAY_OF_WEEK_OPTIONS}
                                placeholder="Select day"
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    )}
                  </div>
                )}
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
