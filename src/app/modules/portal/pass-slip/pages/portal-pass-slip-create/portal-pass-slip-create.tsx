import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  Skeleton,
  Space,
  TimePicker,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useCreateMyPassSlipApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import {
  portalPassSlipFormSchema,
  type PortalPassSlipFormValues,
} from "../../models/forms/portal-pass-slip-form.schema";
import { buildStartDateTime } from "@/shared/utils/duration.util";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PortalPassSlipCreate() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { mutateAsync: create, isPending } = useCreateMyPassSlipApplication();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PortalPassSlipFormValues>({
    resolver: zodResolver(portalPassSlipFormSchema),
    defaultValues: {
      employeeId: employee?.id ?? "",
      applicationDate: "",
      destination: "",
      purpose: "",
      remarks: "",
      entries: [{ punchTime: "", notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // employeeId isn't a visible field here -- useMyEmployee() resolves after this form's
  // defaultValues are already fixed at first render, so without this it stays "" forever and
  // blocks submission with no visible error.
  useEffect(() => {
    if (employee) setValue("employeeId", employee.id);
  }, [employee, setValue]);

  // One entry = one pass slip, same as admin's CreatePassSlip -- files them all in parallel,
  // sharing destination/purpose/remarks, with each entry's own optional notes appended onto
  // that record's remarks (destination/purpose stay identical across every entry, since those
  // are the honest fields this form collects that admin's doesn't).
  const onSubmit = async (values: PortalPassSlipFormValues) => {
    try {
      await Promise.all(
        values.entries.map((entry) =>
          create({
            employeeId: employee!.id,
            applicationDate: values.applicationDate,
            departureTime: buildStartDateTime(
              values.applicationDate,
              entry.punchTime,
            ),
            returnTime: null,
            destination: values.destination,
            purpose: values.purpose,
            remarks: entry.notes
              ? `${values.remarks} — ${entry.notes}`
              : values.remarks,
          }),
        ),
      );
      message.success(
        values.entries.length === 1
          ? "Pass slip filed."
          : `${values.entries.length} pass slips filed.`,
      );
      navigate({ to: "/portal/pass-slip" });
    } catch {
      message.error("Failed to save. Please try again.");
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Pass Slip
            </Title>
            <p className="page-toolbar-subtitle">
              Submit one or more pass slip requests for approval.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        {employeeLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : !employee ? (
          <Empty description="No employee profile is linked to your account yet. Contact HR if you believe this is a mistake." />
        ) : (
          <Card>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              <Form.Item
                label="Date"
                validateStatus={errors.applicationDate ? "error" : ""}
                help={errors.applicationDate?.message}
              >
                <Controller
                  name="applicationDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d ? d.format("YYYY-MM-DD") : "")
                      }
                    />
                  )}
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
                label="Purpose"
                validateStatus={errors.purpose ? "error" : ""}
                help={errors.purpose?.message}
              >
                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="What's this for?" />
                  )}
                />
              </Form.Item>

              {/* ── Entry list ── */}
              <div className="mb-2 flex items-center justify-between">
                <Text strong>Time(s) Out</Text>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => append({ punchTime: "", notes: "" })}
                >
                  Add Entry
                </Button>
              </div>

              {(errors.entries as { message?: string } | undefined)
                ?.message && (
                <div className="mb-2 text-xs text-(--ant-color-error)">
                  {(errors.entries as { message?: string }).message}
                </div>
              )}

              <div
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 8,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                {fields.map((field, index) => {
                  const entryErrors = errors.entries?.[index];
                  return (
                    <div
                      key={field.id}
                      style={{
                        padding: "12px 16px",
                        borderBottom:
                          index < fields.length - 1
                            ? `1px solid ${token.colorBorderSecondary}`
                            : undefined,
                        background:
                          index % 2 === 0
                            ? token.colorFillAlter
                            : token.colorBgContainer,
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Text
                          type="secondary"
                          style={{ minWidth: 24, paddingTop: 6, fontSize: 12 }}
                        >
                          {index + 1}.
                        </Text>
                        <div
                          className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2"
                          style={{ flex: 1 }}
                        >
                          <Form.Item
                            style={{ marginBottom: 0 }}
                            validateStatus={
                              entryErrors?.punchTime ? "error" : ""
                            }
                            help={entryErrors?.punchTime?.message}
                          >
                            <Controller
                              name={`entries.${index}.punchTime`}
                              control={control}
                              render={({ field: f }) => (
                                <TimePicker
                                  value={
                                    f.value ? dayjs(f.value, "HH:mm") : null
                                  }
                                  format="HH:mm"
                                  placeholder="Time out"
                                  style={{ width: "100%" }}
                                  onChange={(t) =>
                                    f.onChange(t ? t.format("HH:mm") : "")
                                  }
                                />
                              )}
                            />
                          </Form.Item>

                          <Form.Item style={{ marginBottom: 0 }}>
                            <Controller
                              name={`entries.${index}.notes`}
                              control={control}
                              render={({ field: f }) => (
                                <Input {...f} placeholder="Notes (optional)" />
                              )}
                            />
                          </Form.Item>
                        </div>

                        <Tooltip title="Remove">
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                            style={{ marginTop: 4 }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Form.Item
                label="Remarks"
                validateStatus={errors.remarks ? "error" : ""}
                help={errors.remarks?.message}
              >
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={2}
                      placeholder="Additional details"
                    />
                  )}
                />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  Submit Application
                </Button>
                <Button onClick={() => navigate({ to: "/portal/pass-slip" })}>
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
