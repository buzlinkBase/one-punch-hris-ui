import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  TimePicker,
  Typography,
  Space,
  Tag,
  Alert,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  batchOvertimeFormSchema,
  type BatchOvertimeFormValues,
} from "../../models/forms/overtime-application-batch-form.schema";
import type { CreateOvertimeApplication } from "../../models/api/request/create-overtime-application.model";
import { useCreateOvertimeApplicationBatch } from "../../hooks/use-overtime-application-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;

const MODE_OPTIONS = [
  { label: "Time Range", value: "datetime" },
  { label: "Hours", value: "hours" },
];

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

function buildStartDateTime(date: string, time: string): string {
  if (!date || !time) return "";
  return dayjs(`${date}T${time}`).format("YYYY-MM-DDTHH:mm:ss");
}

function buildEndDateTime(date: string, startT: string, endT: string): string {
  if (!date || !endT) return "";
  const end = dayjs(`${date}T${endT}`);
  return (endT <= startT ? end.add(1, "day") : end).format(
    "YYYY-MM-DDTHH:mm:ss",
  );
}

const defaultEntry = () => ({
  employeeId: "",
  mode: "datetime" as "hours" | "datetime",
  startTime: "",
  endTime: "",
  otHours: undefined as number | undefined,
  remarks: "",
});

export default function OvertimeApplicationBatch() {
  const navigate = useNavigate();
  const { mutateAsync: createBatch, isPending } =
    useCreateOvertimeApplicationBatch();
  const { data: employees = [] } = useEmployeeFilter();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BatchOvertimeFormValues>({
    resolver: zodResolver(batchOvertimeFormSchema),
    defaultValues: {
      otDate: "",
      entries: [defaultEntry()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const otDate = watch("otDate");
  const entries = watch("entries");

  const onSubmit = async (values: BatchOvertimeFormValues) => {
    const payload: CreateOvertimeApplication[] = values.entries.map((entry) =>
      entry.mode === "datetime"
        ? {
            employeeId: entry.employeeId,
            otDate: values.otDate,
            startTime: buildStartDateTime(values.otDate, entry.startTime ?? ""),
            endTime: buildEndDateTime(
              values.otDate,
              entry.startTime ?? "",
              entry.endTime ?? "",
            ),
            manualOtMinutes: 0,
            isManualEntry: false,
            remarks: entry.remarks,
          }
        : {
            employeeId: entry.employeeId,
            otDate: values.otDate,
            startTime: null,
            endTime: null,
            manualOtMinutes: (entry.otHours ?? 0) * 60,
            isManualEntry: true,
            remarks: entry.remarks,
          },
    );
    await createBatch(payload);
    navigate({ to: "/applications/overtime" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Overtime
            </Title>
            <p className="page-toolbar-subtitle">
              File overtime for multiple employees. Each row can use a different
              entry mode.
            </p>
          </div>
          <Space>
            <Button onClick={() => navigate({ to: "/applications/overtime" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Shared OT Date */}
          <Form.Item
            label="OT Date"
            validateStatus={errors.otDate ? "error" : ""}
            help={errors.otDate?.message}
            style={{ width: 200 }}
          >
            <DatePicker
              style={{ width: "100%" }}
              value={otDate ? dayjs(otDate) : null}
              onChange={(date) =>
                setValue("otDate", date?.format("YYYY-MM-DD") ?? "")
              }
            />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            className="mb-3"
            message="OT applications are capped to the employee's actual overtime rendered — any excess entered here will not be paid out."
          />

          {/* Table */}
          <div className="rounded-lg border border-(--ant-color-border) overflow-hidden">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_110px_1fr_1fr_36px] gap-2 px-3 py-2 bg-(--ant-color-fill-quaternary) text-xs font-medium text-(--ant-color-text-secondary) border-b border-(--ant-color-border)">
              <span>Employee</span>
              <span>Mode</span>
              <span>OT Entry</span>
              <span>Remarks</span>
              <span />
            </div>

            {/* Rows */}
            <div className="divide-y divide-(--ant-color-border-secondary)">
              {fields.map((field, index) => {
                const entryErrors = errors.entries?.[index];
                const rowMode = entries[index]?.mode ?? "hours";
                const startT = entries[index]?.startTime ?? "";
                const endT = entries[index]?.endTime ?? "";
                const crossMidnight =
                  rowMode === "datetime" &&
                  !!startT &&
                  !!endT &&
                  endT <= startT;

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 gap-3 px-3 py-3 sm:grid-cols-[1fr_110px_1fr_1fr_36px] sm:gap-2 sm:py-2 sm:items-start"
                  >
                    {/* Employee */}
                    <Form.Item
                      label="Employee"
                      className="mb-0 sm:[&_.ant-form-item-label]:hidden"
                      validateStatus={entryErrors?.employeeId ? "error" : ""}
                      help={entryErrors?.employeeId?.message}
                    >
                      <Controller
                        name={`entries.${index}.employeeId`}
                        control={control}
                        render={({ field: f }) => (
                          <Select
                            {...f}
                            showSearch
                            placeholder="Select employee"
                            options={employeeOptions}
                            filterOption={filterOption}
                            value={f.value || undefined}
                          />
                        )}
                      />
                    </Form.Item>

                    {/* Mode */}
                    <Form.Item
                      label="Mode"
                      className="mb-0 sm:[&_.ant-form-item-label]:hidden"
                    >
                      <Controller
                        name={`entries.${index}.mode`}
                        control={control}
                        render={({ field: f }) => (
                          <Select
                            {...f}
                            options={MODE_OPTIONS}
                            onChange={(val) => {
                              f.onChange(val);
                              setValue(`entries.${index}.startTime`, "");
                              setValue(`entries.${index}.endTime`, "");
                              setValue(`entries.${index}.otHours`, undefined);
                            }}
                          />
                        )}
                      />
                    </Form.Item>

                    {/* OT Entry — hours or time range */}
                    <Form.Item
                      label="OT Entry"
                      className="mb-0 sm:[&_.ant-form-item-label]:hidden"
                      validateStatus={
                        entryErrors?.otHours ||
                        entryErrors?.startTime ||
                        entryErrors?.endTime
                          ? "error"
                          : ""
                      }
                      help={
                        entryErrors?.otHours?.message ??
                        entryErrors?.startTime?.message ??
                        entryErrors?.endTime?.message
                      }
                    >
                      {rowMode === "hours" ? (
                        <Controller
                          name={`entries.${index}.otHours`}
                          control={control}
                          render={({ field: f }) => (
                            <InputNumber
                              {...f}
                              style={{ width: "100%" }}
                              min={0.25}
                              max={24}
                              step={0.25}
                              precision={2}
                              addonAfter="hrs"
                              placeholder="0"
                              onChange={(val) => f.onChange(val ?? undefined)}
                            />
                          )}
                        />
                      ) : (
                        <div className="flex gap-1">
                          <Controller
                            name={`entries.${index}.startTime`}
                            control={control}
                            render={({ field: f }) => (
                              <TimePicker
                                use12Hours
                                format="hh:mm A"
                                style={{ flex: 1 }}
                                placeholder="Start"
                                value={
                                  f.value ? dayjs(f.value, "HH:mm:ss") : null
                                }
                                onChange={(t) =>
                                  f.onChange(t?.format("HH:mm:ss") ?? "")
                                }
                                onBlur={f.onBlur}
                              />
                            )}
                          />
                          <Controller
                            name={`entries.${index}.endTime`}
                            control={control}
                            render={({ field: f }) => (
                              <TimePicker
                                use12Hours
                                format="hh:mm A"
                                style={{ flex: 1 }}
                                placeholder={crossMidnight ? "End +1d" : "End"}
                                value={
                                  f.value ? dayjs(f.value, "HH:mm:ss") : null
                                }
                                onChange={(t) =>
                                  f.onChange(t?.format("HH:mm:ss") ?? "")
                                }
                                onBlur={f.onBlur}
                              />
                            )}
                          />
                          {crossMidnight && (
                            <Tag
                              color="blue"
                              className="self-center text-[11px] leading-none whitespace-nowrap"
                            >
                              +1d
                            </Tag>
                          )}
                        </div>
                      )}
                    </Form.Item>

                    {/* Remarks */}
                    <Form.Item
                      label="Remarks"
                      className="mb-0 sm:[&_.ant-form-item-label]:hidden"
                    >
                      <Controller
                        name={`entries.${index}.remarks`}
                        control={control}
                        render={({ field: f }) => (
                          <TextArea
                            {...f}
                            rows={1}
                            placeholder="Remarks"
                            style={{ resize: "none" }}
                          />
                        )}
                      />
                    </Form.Item>

                    {/* Remove */}
                    <div className="flex justify-end sm:block sm:pt-1">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            className="mt-3 w-full"
            onClick={() => append(defaultEntry())}
          >
            Add Row
          </Button>

          <div className="form-action-footer mt-4">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: "/applications/overtime" })}
              >
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button type="primary" htmlType="submit" loading={isPending}>
                Submit {fields.length > 1 ? `(${fields.length} entries)` : ""}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
