import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  TimePicker,
  Typography,
  Space,
  Tag,
  Card,
  Descriptions,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  travelOrderFormSchema,
  type TravelOrderFormValues,
} from "../../models/forms/travel-order-application-form.schema";
import {
  useTravelOrder,
  useCreateTravelOrder,
  useUpdateTravelOrder,
} from "../../hooks/use-travel-order-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import {
  TRAVEL_ORDER_LABEL,
  TRAVEL_CLASSIFICATION_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";

const { Title } = Typography;
const { TextArea } = Input;

const MODE_OPTIONS = [
  { label: "Time Range", value: "timerange" },
  { label: "Hours", value: "hours" },
];

const APPROVAL_STATUS_OPTIONS = [
  { value: "ForApproval", label: "For Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Declined", label: "Declined" },
  { value: "Withdrawn", label: "Withdrawn" },
];

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
  Withdrawn: "default",
};

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

function isCrossMidnight(start: string, end: string): boolean {
  return !!start && !!end && end < start;
}

function buildStartDateTime(date: string, time: string): string {
  if (!date || !time) return "";
  return dayjs(`${date}T${time}`).format("YYYY-MM-DDTHH:mm:ss");
}

function buildEndDateTime(
  _startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
): string {
  const end = dayjs(`${endDate}T${endTime}`);
  const adjusted = endTime < startTime ? end.add(1, "day") : end;
  return adjusted.format("YYYY-MM-DDTHH:mm:ss");
}

export default function TravelOrderDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useTravelOrder(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateTravelOrder();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateTravelOrder();
  const { data: employees = [] } = useEmployeeFilter();
  const { data: timeShifts = [] } = useFixedTimeShifts();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));
  const employeeMap = new Map(employees.map((e) => [e.id, e.name ?? e.id]));

  const timeShiftOptions = timeShifts.map((s) => ({
    value: s.id,
    label: s.shiftName,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TravelOrderFormValues>({
    resolver: zodResolver(travelOrderFormSchema),
    defaultValues: {
      employeeId: "",
      startDate: "",
      endDate: "",
      mode: "timerange",
      timeShiftId: undefined,
      startTime: "",
      endTime: "",
      totalHours: undefined,
      destination: "",
      classification: "",
      purpose: "",
      cost: 0,
      applicationRemarks: "",
      approvalStatus: "Approved",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const mode = watch("mode");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  useEffect(() => {
    if (isEdit && selected) {
      const editMode = selected.isManualEntry ? "hours" : "timerange";
      reset({
        employeeId: selected.employeeId,
        startDate: selected.startDate,
        endDate: selected.endDate,
        mode: editMode,
        timeShiftId: undefined,
        startTime:
          editMode === "timerange" && selected.startTime
            ? dayjs(selected.startTime).format("HH:mm:ss")
            : "",
        endTime:
          editMode === "timerange" && selected.endTime
            ? dayjs(selected.endTime).format("HH:mm:ss")
            : "",
        totalHours:
          editMode === "hours" && selected.totalMinutes != null
            ? selected.totalMinutes / 60
            : undefined,
        destination: selected.destination,
        classification: selected.classification,
        purpose: selected.purpose,
        cost: selected.cost ?? 0,
        applicationRemarks: selected.applicationRemarks ?? "",
        approvalStatus: selected.approvalStatus,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: TravelOrderFormValues) => {
    const timePayload =
      values.mode === "timerange"
        ? {
            isManualEntry: false,
            startTime: buildStartDateTime(
              values.startDate,
              values.startTime ?? "",
            ),
            endTime: buildEndDateTime(
              values.startDate,
              values.endDate,
              values.startTime ?? "",
              values.endTime ?? "",
            ),
            totalMinutes: 0,
          }
        : {
            isManualEntry: true,
            startTime: null,
            endTime: null,
            totalMinutes: Math.round((values.totalHours ?? 0) * 60),
          };

    const payload = {
      employeeId: values.employeeId,
      startDate: values.startDate,
      endDate: values.endDate,
      destination: values.destination,
      classification: values.classification,
      purpose: values.purpose,
      cost: 0,
      applicationRemarks: values.applicationRemarks,
      ...timePayload,
    };

    if (isEdit && id) {
      await update({
        id,
        approvalStatus: values.approvalStatus,
        ...payload,
      });
    } else {
      await add({ ...payload, approvalStatus: values.approvalStatus });
    }
    navigate({ to: "/applications/official-business" });
  };

  const crossMidnight =
    mode === "timerange" && isCrossMidnight(startTime ?? "", endTime ?? "");

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? TRAVEL_ORDER_LABEL.EDIT_TITLE
                : TRAVEL_ORDER_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File an official business or travel order request for approval.
            </p>
          </div>
          <Space>
            {isEdit && selected ? (
              <Tag color={STATUS_COLOR[selected.approvalStatus] ?? "default"}>
                {selected.approvalStatus === "ForApproval"
                  ? "For Approval"
                  : selected.approvalStatus}
              </Tag>
            ) : (
              <Tag color="success">New Record</Tag>
            )}
            <Button
              onClick={() =>
                navigate({ to: "/applications/official-business" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        {isEdit && selected && (
          <Card size="small" className="mb-4">
            <Descriptions size="small" column={3}>
              <Descriptions.Item label={TRAVEL_ORDER_LABEL.STATUS}>
                <Tag color={STATUS_COLOR[selected.approvalStatus] ?? "default"}>
                  {selected.approvalStatus === "ForApproval"
                    ? "For Approval"
                    : selected.approvalStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={TRAVEL_ORDER_LABEL.DAYS}>
                {selected.days != null
                  ? `${selected.days} day${selected.days !== 1 ? "s" : ""}`
                  : "-"}
              </Descriptions.Item>
              {selected.reference && (
                <Descriptions.Item label={TRAVEL_ORDER_LABEL.REFERENCE}>
                  {selected.reference}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {isEdit && selected && (
          <Card size="small" title="Approval Progress" className="mb-4">
            <ApprovalTimeline
              applicationType="OfficialBusiness"
              applicationId={selected.id}
              resolveEmployeeName={(empId) => employeeMap.get(empId)}
            />
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Row 1: Employee | Date Range | Entry Mode — mirrors OT's 3-col top row */}
          <div className="form-grid-3">
            <Form.Item
              label={TRAVEL_ORDER_LABEL.EMPLOYEE}
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
                    placeholder="Select employee"
                    options={employeeOptions}
                    filterOption={filterOption}
                    value={field.value || undefined}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Travel Date Range"
              validateStatus={errors.startDate || errors.endDate ? "error" : ""}
              help={errors.startDate?.message ?? errors.endDate?.message}
            >
              <MobileRangePicker
                style={{ width: "100%" }}
                value={
                  startDate && endDate
                    ? [dayjs(startDate), dayjs(endDate)]
                    : null
                }
                onChange={(dates) => {
                  setValue("startDate", dates?.[0]?.format("YYYY-MM-DD") ?? "");
                  setValue("endDate", dates?.[1]?.format("YYYY-MM-DD") ?? "");
                }}
              />
            </Form.Item>

            <Form.Item label="Entry Mode">
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={MODE_OPTIONS}
                    onChange={(val) => {
                      field.onChange(val);
                      setValue("startTime", "");
                      setValue("endTime", "");
                      setValue("totalHours", undefined);
                      setValue("timeShiftId", undefined);
                    }}
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* Time entry group */}
          <div className="rounded-lg border border-(--ant-color-border) bg-(--ant-color-fill-quaternary) px-4 pt-4 pb-1 mb-6">
            {mode === "timerange" ? (
              <>
                <Form.Item
                  label={TRAVEL_ORDER_LABEL.TIME_SHIFT}
                  style={{ maxWidth: 400 }}
                >
                  <Controller
                    name="timeShiftId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        allowClear
                        showSearch
                        placeholder="Select shift to pre-fill times (optional)"
                        options={timeShiftOptions}
                        filterOption={filterOption}
                        value={field.value || undefined}
                        onChange={(val) => {
                          field.onChange(val);
                          const shift = timeShiftOptions.find(
                            (s) => s.value === val,
                          );
                          if (shift) {
                            const fmt = (t: string) =>
                              dayjs(t, ["HH:mm:ss", "HH:mm"]).format(
                                "HH:mm:ss",
                              );
                            setValue("startTime", fmt(shift.startTime));
                            setValue("endTime", fmt(shift.endTime));
                          } else {
                            setValue("startTime", "");
                            setValue("endTime", "");
                          }
                        }}
                      />
                    )}
                  />
                </Form.Item>

                <div className="form-grid-2">
                  <Form.Item
                    label={TRAVEL_ORDER_LABEL.START_TIME}
                    validateStatus={errors.startTime ? "error" : ""}
                    help={errors.startTime?.message}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      use12Hours
                      format="hh:mm A"
                      value={startTime ? dayjs(startTime, "HH:mm:ss") : null}
                      onChange={(t) =>
                        setValue("startTime", t?.format("HH:mm:ss") ?? "")
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        {TRAVEL_ORDER_LABEL.END_TIME}
                        {crossMidnight && (
                          <Tag
                            color="blue"
                            className="text-[11px] leading-none"
                          >
                            +1 day
                          </Tag>
                        )}
                      </span>
                    }
                    validateStatus={errors.endTime ? "error" : ""}
                    help={errors.endTime?.message}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      use12Hours
                      format="hh:mm A"
                      value={endTime ? dayjs(endTime, "HH:mm:ss") : null}
                      onChange={(t) =>
                        setValue("endTime", t?.format("HH:mm:ss") ?? "")
                      }
                    />
                  </Form.Item>
                </div>
              </>
            ) : (
              <Form.Item
                label={TRAVEL_ORDER_LABEL.TOTAL_HOURS}
                validateStatus={errors.totalHours ? "error" : ""}
                help={
                  errors.totalHours?.message ??
                  "Enter the total hours for this travel (e.g. 4, 1.5 for 1 hr 30 min)."
                }
              >
                <Controller
                  name="totalHours"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: 200 }}
                      min={0.25}
                      max={999}
                      step={0.25}
                      precision={2}
                      addonAfter="hrs"
                      placeholder="e.g. 8"
                      onChange={(val) => field.onChange(val ?? undefined)}
                    />
                  )}
                />
              </Form.Item>
            )}
          </div>

          {/* Destination | Classification */}
          <div className="form-grid-2">
            <Form.Item
              label={TRAVEL_ORDER_LABEL.DESTINATION}
              validateStatus={errors.destination ? "error" : ""}
              help={errors.destination?.message}
            >
              <Controller
                name="destination"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="City, Province or Address" />
                )}
              />
            </Form.Item>

            <Form.Item
              label={TRAVEL_ORDER_LABEL.CLASSIFICATION}
              validateStatus={errors.classification ? "error" : ""}
              help={errors.classification?.message}
            >
              <Controller
                name="classification"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select classification"
                    options={TRAVEL_CLASSIFICATION_OPTIONS}
                    value={field.value || undefined}
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* Purpose */}
          <Form.Item
            label={TRAVEL_ORDER_LABEL.PURPOSE}
            validateStatus={errors.purpose ? "error" : ""}
            help={errors.purpose?.message}
          >
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={3}
                  placeholder="Describe the purpose of this official business"
                />
              )}
            />
          </Form.Item>

          <PermissionGate permission="Official Business:Approve">
            <Form.Item label={TRAVEL_ORDER_LABEL.STATUS}>
              <Controller
                name="approvalStatus"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={APPROVAL_STATUS_OPTIONS} />
                )}
              />
            </Form.Item>
          </PermissionGate>

          <Form.Item
            label={TRAVEL_ORDER_LABEL.REMARKS}
            validateStatus={errors.applicationRemarks ? "error" : ""}
            help={errors.applicationRemarks?.message}
          >
            <Controller
              name="applicationRemarks"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={2}
                  placeholder="Additional notes or instructions"
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() =>
                  navigate({ to: "/applications/official-business" })
                }
              >
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <PermissionGate
                permission={[
                  "Official Business:Edit",
                  "Official Business:Approve",
                ]}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                >
                  {NAVIGATION_BUTTON_LABEL.SAVE}
                </Button>
              </PermissionGate>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
