import { useEffect } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Tag,
  theme,
  Tooltip,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  passSlipCreateFormSchema,
  passSlipFormSchema,
  type PassSlipCreateFormValues,
  type PassSlipFormValues,
} from "../../models/forms/pass-slip-form.schema";
import {
  usePassSlip,
  useCreatePassSlip,
  useUpdatePassSlip,
} from "../../hooks/use-pass-slip-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
  PASS_SLIP_LABEL,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";

const { Title, Text } = Typography;
const { TextArea } = Input;

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

function stripZ(v?: string) {
  return v ? v.replace(/Z$/, "") : "";
}

// ── Edit mode: single-record form ─────────────────────────────────────────────

function EditPassSlip({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: selected } = usePassSlip(id);
  const { mutateAsync: update, isPending: isUpdating } = useUpdatePassSlip();
  const { data: rawEmployees = [] } = useEmployees();

  const employeeOptions = rawEmployees.map((e) => ({
    value: e.id,
    label: e.fullName ?? `${e.firstName} ${e.lastName}`,
  }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PassSlipFormValues>({
    resolver: zodResolver(passSlipFormSchema),
    defaultValues: {
      employeeId: "",
      applicationDate: "",
      departureTime: "",
      notes: "",
      remarks: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const departureTime = watch("departureTime");

  useEffect(() => {
    if (selected) {
      reset({
        employeeId: selected.employeeId,
        applicationDate: stripZ(selected.applicationDate),
        departureTime: stripZ(selected.departureTime),
        notes: selected.purpose ?? "",
        remarks: selected.remarks ?? "",
      });
    }
  }, [selected, reset]);

  const onSubmit = async (values: PassSlipFormValues) => {
    try {
      await update({
        id,
        approvalStatus: selected!.approvalStatus,
        employeeId: values.employeeId,
        applicationDate: values.applicationDate,
        departureTime: values.departureTime,
        destination: "",
        purpose: values.notes || "",
        remarks: values.remarks || undefined,
      });
      message.success("Pass slip updated.");
      navigate({ to: "/applications/pass-slip" });
    } catch {
      message.error("Failed to save. Please try again.");
    }
  };

  return (
    <div className="form-page-body">
      {selected && (
        <div style={{ marginBottom: 12 }}>
          <Tag
            color={APPROVAL_STATUS_COLOR[selected.approvalStatus] ?? "default"}
          >
            {APPROVAL_STATUS_LABEL[selected.approvalStatus] ??
              selected.approvalStatus}
          </Tag>
        </div>
      )}
      {selected && (
        <Card size="small" title="Approval Progress" className="mb-4">
          <ApprovalTimeline
            applicationType="PassSlip"
            applicationId={selected.id}
            resolveEmployeeName={(empId) =>
              rawEmployees.find((e) => e.id === empId)?.fullName ?? undefined
            }
          />
        </Card>
      )}
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <div className="form-grid-2">
          <Form.Item
            label="Employee"
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
            label="Application Date"
            validateStatus={errors.applicationDate ? "error" : ""}
            help={errors.applicationDate?.message}
          >
            <Controller
              name="applicationDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  style={{ width: "100%" }}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date?.format("YYYY-MM-DD") ?? "")
                  }
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Punch Time"
          validateStatus={errors.departureTime ? "error" : ""}
          help={errors.departureTime?.message}
        >
          <DatePicker
            showTime
            style={{ width: "100%" }}
            format="YYYY-MM-DD HH:mm"
            value={departureTime ? dayjs(departureTime) : null}
            onChange={(dt) =>
              setValue("departureTime", dt?.format("YYYY-MM-DDTHH:mm:ss") ?? "")
            }
          />
        </Form.Item>

        <Form.Item label="Notes (optional)">
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Additional notes" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Remarks"
          required
          validateStatus={errors.remarks ? "error" : ""}
          help={
            errors.remarks?.message ??
            "Why is this pass slip / manual attendance being filed?"
          }
        >
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={2}
                placeholder="Reason for this pass slip"
              />
            )}
          />
        </Form.Item>

        <div className="form-action-footer">
          <Space className="form-action-footer-row">
            <Button onClick={() => navigate({ to: "/applications/pass-slip" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
            <PermissionGate permission="Pass Slip:Edit">
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </Form>
    </div>
  );
}

// ── Create mode: multi-entry form ──────────────────────────────────────────────

function CreatePassSlip() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { mutateAsync: add, isPending: isCreating } = useCreatePassSlip();
  const { data: rawEmployees = [] } = useEmployees();

  const employeeOptions = rawEmployees.map((e) => ({
    value: e.id,
    label: e.fullName ?? `${e.firstName} ${e.lastName}`,
  }));

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PassSlipCreateFormValues>({
    resolver: zodResolver(passSlipCreateFormSchema),
    defaultValues: {
      employeeId: "",
      applicationDate: "",
      remarks: "",
      entries: [{ punchTime: "", notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const onSubmit = async (values: PassSlipCreateFormValues) => {
    try {
      await Promise.all(
        values.entries.map((entry) =>
          add({
            employeeId: values.employeeId,
            applicationDate: values.applicationDate,
            departureTime: entry.punchTime,
            destination: "",
            purpose: entry.notes || "",
            remarks: values.remarks || undefined,
          }),
        ),
      );
      message.success(
        values.entries.length === 1
          ? "Pass slip filed."
          : `${values.entries.length} pass slips filed.`,
      );
      navigate({ to: "/applications/pass-slip" });
    } catch {
      message.error("Failed to save. Please try again.");
    }
  };

  const applicationDate = watch("applicationDate");

  return (
    <div className="form-page-body">
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* ── Shared header ── */}
        <div className="form-grid-2">
          <Form.Item
            label="Employee"
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
            label="Application Date"
            validateStatus={errors.applicationDate ? "error" : ""}
            help={errors.applicationDate?.message}
          >
            <DatePicker
              style={{ width: "100%" }}
              value={applicationDate ? dayjs(applicationDate) : null}
              onChange={(date) =>
                setValue("applicationDate", date?.format("YYYY-MM-DD") ?? "")
              }
            />
          </Form.Item>
        </div>

        {/* ── Entry list ── */}
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text strong>Lacking Logs</Text>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => append({ punchTime: "", notes: "" })}
          >
            Add Entry
          </Button>
        </div>

        {(errors.entries as { message?: string } | undefined)?.message && (
          <div style={{ color: "#ff4d4f", marginBottom: 8, fontSize: 12 }}>
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
            // eslint-disable-next-line react-hooks/incompatible-library
            const punchVal = watch(`entries.${index}.punchTime`);
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
                <div
                  style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                >
                  <Text
                    type="secondary"
                    style={{ minWidth: 24, paddingTop: 6, fontSize: 12 }}
                  >
                    {index + 1}.
                  </Text>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2"
                    style={{ flex: 1 }}
                  >
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      validateStatus={entryErrors?.punchTime ? "error" : ""}
                      help={entryErrors?.punchTime?.message}
                    >
                      <DatePicker
                        showTime
                        placeholder="Missing punch time"
                        style={{ width: "100%" }}
                        format="MM/DD HH:mm"
                        value={punchVal ? dayjs(punchVal) : null}
                        onChange={(dt) =>
                          setValue(
                            `entries.${index}.punchTime`,
                            dt?.format("YYYY-MM-DDTHH:mm:ss") ?? "",
                          )
                        }
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

        {/* ── Shared remarks ── */}
        <Form.Item
          label="Remarks"
          required
          validateStatus={errors.remarks ? "error" : ""}
          help={
            errors.remarks?.message ??
            "Why is this manual attendance being filed? Applied to every entry above."
          }
        >
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={2}
                placeholder="Reason for these entries"
              />
            )}
          />
        </Form.Item>

        <div className="form-action-footer">
          <Space className="form-action-footer-row">
            <Button onClick={() => navigate({ to: "/applications/pass-slip" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
            <PermissionGate permission="Pass Slip:Create">
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Submit {fields.length > 1 ? `(${fields.length} entries)` : ""}
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </Form>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────────

export default function PassSlipDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? "Edit Pass Slip" : "File Pass Slip"}
            </Title>
            <p className="page-toolbar-subtitle">{PASS_SLIP_LABEL.SUBTITLE}</p>
          </div>
          <Space>
            {!isEdit && <Tag color="success">New Record</Tag>}
            <Button onClick={() => navigate({ to: "/applications/pass-slip" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      {isEdit && id ? <EditPassSlip id={id} /> : <CreatePassSlip />}
    </div>
  );
}
