import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Radio,
  Skeleton,
  Space,
  TimePicker,
  Typography,
} from "antd";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useCreateMyTravelOrderApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import {
  travelOrderFormSchema,
  type TravelOrderFormValues,
} from "@/app/modules/applications/travel-order-application/models/forms/travel-order-application-form.schema";
import { TRAVEL_CLASSIFICATION_OPTIONS } from "@/app/modules/applications/travel-order-application/constants/label.const";
import {
  buildStartDateTime,
  buildEndDateTime,
  isCrossMidnight,
} from "@/shared/utils/duration.util";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { Title } = Typography;
const { TextArea } = Input;

const MODE_OPTIONS = [
  { label: "Time Range", value: "timerange" },
  { label: "Total Hours", value: "hours" },
];

export default function PortalOfficialBusinessCreate() {
  const navigate = useNavigate();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { mutateAsync: create, isPending } =
    useCreateMyTravelOrderApplication();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TravelOrderFormValues>({
    resolver: zodResolver(travelOrderFormSchema),
    defaultValues: {
      employeeId: employee?.id ?? "",
      startDate: "",
      endDate: "",
      mode: "timerange",
      startTime: "",
      endTime: "",
      totalHours: undefined,
      destination: "",
      classification: "",
      purpose: "",
      cost: 0,
      applicationRemarks: "",
      approvalStatus: "ForApproval",
    },
  });

  const mode = useWatch({ control, name: "mode" });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

  const crossMidnight =
    mode === "timerange" && isCrossMidnight(startTime ?? "", endTime ?? "");

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

    await create({
      employeeId: employee!.id,
      startDate: values.startDate,
      endDate: values.endDate,
      destination: values.destination,
      classification: values.classification,
      purpose: values.purpose,
      cost: 0,
      applicationRemarks: values.applicationRemarks,
      approvalStatus: "ForApproval",
      ...timePayload,
    });
    navigate({ to: "/portal/official-business" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Official Business
            </Title>
            <p className="page-toolbar-subtitle">
              Submit an official business / travel application for approval.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        {employeeLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !employee ? (
          <Empty description="No employee profile is linked to your account yet. Contact HR if you believe this is a mistake." />
        ) : (
          <Card>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              <Form.Item
                label="Dates"
                validateStatus={
                  errors.startDate || errors.endDate ? "error" : ""
                }
                help={errors.startDate?.message || errors.endDate?.message}
              >
                <MobileRangePicker
                  value={[
                    startDate ? dayjs(startDate) : null,
                    endDate ? dayjs(endDate) : null,
                  ]}
                  onChange={(dates) => {
                    setValue(
                      "startDate",
                      dates?.[0]?.format("YYYY-MM-DD") ?? "",
                    );
                    setValue("endDate", dates?.[1]?.format("YYYY-MM-DD") ?? "");
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Destination"
                validateStatus={errors.destination ? "error" : ""}
                help={errors.destination?.message}
              >
                <Controller
                  name="destination"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Where are you going?" />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Classification"
                validateStatus={errors.classification ? "error" : ""}
                help={errors.classification?.message}
              >
                <Controller
                  name="classification"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      options={TRAVEL_CLASSIFICATION_OPTIONS}
                      optionType="button"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Purpose"
                validateStatus={errors.purpose ? "error" : ""}
                help={errors.purpose?.message}
              >
                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={2}
                      placeholder="Why is this trip needed?"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item label="Duration">
                <Controller
                  name="mode"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      options={MODE_OPTIONS}
                      optionType="button"
                    />
                  )}
                />
              </Form.Item>

              {mode === "timerange" ? (
                <Space size="large" wrap align="start">
                  <Form.Item
                    label="Start Time"
                    validateStatus={errors.startTime ? "error" : ""}
                    help={errors.startTime?.message}
                  >
                    <Controller
                      name="startTime"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          value={
                            field.value ? dayjs(field.value, "HH:mm") : null
                          }
                          format="HH:mm"
                          onChange={(t) =>
                            field.onChange(t ? t.format("HH:mm") : "")
                          }
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    label="End Time"
                    validateStatus={errors.endTime ? "error" : ""}
                    help={errors.endTime?.message}
                  >
                    <Controller
                      name="endTime"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          value={
                            field.value ? dayjs(field.value, "HH:mm") : null
                          }
                          format="HH:mm"
                          onChange={(t) =>
                            field.onChange(t ? t.format("HH:mm") : "")
                          }
                        />
                      )}
                    />
                  </Form.Item>
                  {crossMidnight && (
                    <Form.Item label=" ">
                      <span className="text-(--ant-color-text-tertiary)">
                        Ends the next day
                      </span>
                    </Form.Item>
                  )}
                </Space>
              ) : (
                <Form.Item
                  label="Total Hours"
                  validateStatus={errors.totalHours ? "error" : ""}
                  help={errors.totalHours?.message}
                >
                  <Controller
                    name="totalHours"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        min={0}
                        step={0.5}
                        onChange={(v) => field.onChange(v ?? undefined)}
                      />
                    )}
                  />
                </Form.Item>
              )}

              <Form.Item label="Remarks">
                <Controller
                  name="applicationRemarks"
                  control={control}
                  render={({ field }) => <TextArea {...field} rows={2} />}
                />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  Submit Application
                </Button>
                <Button
                  onClick={() => navigate({ to: "/portal/official-business" })}
                >
                  Cancel
                </Button>
              </Space>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}
