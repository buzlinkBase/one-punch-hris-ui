import {
  Button,
  DatePicker,
  Form,
  Input,
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
import { useNavigate, useSearch } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useMyPassSlipApplications,
  useCreateMyPassSlipApplication,
  useUpdateMyPassSlipApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import { usePortalFormMode } from "../../../shared/hooks/use-portal-form-mode";
import { PortalApplicationShell } from "../../../shared/components/portal-application-shell";
import {
  portalPassSlipFormSchema,
  type PortalPassSlipFormValues,
} from "../../models/forms/portal-pass-slip-form.schema";
import { buildStartDateTime } from "@/shared/utils/duration.util";
import { toPassSlipPrefill } from "../../utils/pass-slip-prefill";
import { useStagedAttachments } from "@/shared/hooks/use-attachment-queries";
import { AttachmentField } from "@/shared/components/attachment-upload/attachment-field";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";

const { Text } = Typography;
const { TextArea } = Input;

const BACK_TO = "/portal/pass-slip";

/**
 * File (create, one or more time-outs), edit (one own pending slip) or view (read-only) a pass
 * slip. Each slip is a single time-out, so edit/view always show exactly one entry.
 */
export default function PortalPassSlipCreate() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { id, mode } = usePortalFormMode();
  // A new filing opened from My Incomplete Logs arrives with the day's date and missing
  // punches in the search params.
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const prefill = id ? null : toPassSlipPrefill(search);
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { data: slips = [], isLoading: slipsLoading } =
    useMyPassSlipApplications();
  const { mutateAsync: create, isPending: isCreating } =
    useCreateMyPassSlipApplication();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateMyPassSlipApplication();
  const staged = useStagedAttachments("PassSlip");

  const record = id ? slips.find((s) => s.id === id) : undefined;
  const isExisting = !!id;
  // Only a still-pending slip is editable; anything else opens as a view.
  const readOnly =
    mode === "view" || (!!record && record.approvalStatus !== "ForApproval");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PortalPassSlipFormValues>({
    resolver: zodResolver(portalPassSlipFormSchema),
    defaultValues: {
      employeeId: employee?.id ?? "",
      applicationDate: prefill?.applicationDate ?? "",
      destination: "",
      purpose: "",
      remarks: prefill?.remarks ?? "",
      entries: prefill?.entries ?? [{ punchTime: "", notes: "" }],
    },
  });
  const { allowNavigation } = useUnsavedChangesGuard(isDirty);

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

  useEffect(() => {
    if (!record) return;
    const departure = dayjs(record.departureTime.replace(/Z$/, ""));
    reset({
      employeeId: record.employeeId,
      applicationDate: dayjs(record.applicationDate.replace(/Z$/, "")).format(
        "YYYY-MM-DD",
      ),
      destination: record.destination ?? "",
      purpose: record.purpose ?? "",
      remarks: record.remarks ?? "",
      entries: [{ punchTime: departure.format("HH:mm"), notes: "" }],
    });
  }, [record, reset]);

  // One entry = one pass slip, same as admin's CreatePassSlip -- files them all in parallel,
  // sharing destination/purpose/remarks, with each entry's own optional notes appended onto
  // that record's remarks (destination/purpose stay identical across every entry, since those
  // are the honest fields this form collects that admin's doesn't).
  const onSubmit = async (values: PortalPassSlipFormValues) => {
    if (id) {
      const [entry] = values.entries;
      try {
        await update({
          id,
          data: {
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
          },
        });
        message.success("Pass slip updated.");
        allowNavigation();
        navigate({ to: BACK_TO });
      } catch {
        message.error("Failed to save. Please try again.");
      }
      return;
    }

    try {
      await Promise.all(
        values.entries.map((entry, index) =>
          create({
            // Uploaded files belong to one record: the first entry's.
            attachmentIds: index === 0 ? staged.stagedIds : undefined,
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
      void staged.refresh();
      message.success(
        values.entries.length === 1
          ? "Pass slip filed."
          : `${values.entries.length} pass slips filed.`,
      );
      allowNavigation();
      navigate({ to: BACK_TO });
    } catch {
      message.error("Failed to save. Please try again.");
    }
  };

  return (
    <PortalApplicationShell
      mode={mode}
      titles={{
        create: "New Pass Slip",
        edit: "Edit Pass Slip",
        view: "View Pass Slip",
      }}
      subtitle="Submit one or more pass slip requests for approval."
      backTo={BACK_TO}
      applicationType="PassSlip"
      record={record}
      loading={employeeLoading || (isExisting && slipsLoading)}
      noEmployee={!employee}
      readOnly={readOnly}
    >
      <Form
        layout="vertical"
        disabled={readOnly}
        onFinish={handleSubmit(onSubmit)}
      >
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
          <Text strong>{isExisting ? "Time Out" : "Time(s) Out"}</Text>
          {!isExisting && (
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => append({ punchTime: "", notes: "" })}
            >
              Add Entry
            </Button>
          )}
        </div>

        {(errors.entries as { message?: string } | undefined)?.message && (
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
                      validateStatus={entryErrors?.punchTime ? "error" : ""}
                      help={entryErrors?.punchTime?.message}
                    >
                      <Controller
                        name={`entries.${index}.punchTime`}
                        control={control}
                        render={({ field: f }) => (
                          <TimePicker
                            value={f.value ? dayjs(f.value, "HH:mm") : null}
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

                  {!isExisting && (
                    <Tooltip title="Remove">
                      <Button
                        aria-label="Remove"
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        style={{ marginTop: 4 }}
                      />
                    </Tooltip>
                  )}
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
              <TextArea {...field} rows={2} placeholder="Additional details" />
            )}
          />
        </Form.Item>

        <Form.Item
          extra={
            !id && fields.length > 1
              ? "With several entries, the files are attached to the first pass slip."
              : undefined
          }
        >
          <AttachmentField
            ownerType="PassSlip"
            ownerId={id}
            label="Attachments"
            readOnly={readOnly}
          />
        </Form.Item>

        {!readOnly && (
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating || isUpdating}
            >
              {isExisting ? "Save Changes" : "Submit Application"}
            </Button>
            <Button onClick={() => navigate({ to: BACK_TO })}>Cancel</Button>
          </Space>
        )}
      </Form>
    </PortalApplicationShell>
  );
}
