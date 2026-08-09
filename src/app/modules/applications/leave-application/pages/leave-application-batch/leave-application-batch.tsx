import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Typography,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  batchLeaveFormSchema,
  type BatchLeaveFormValues,
} from "../../models/forms/leave-application-batch-form.schema";
import type { CreateLeaveApplication } from "../../models/api/request/create-leave-application.model";
import { useCreateLeaveApplicationBatch } from "../../hooks/use-leave-application-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { useLeaveTypes } from "@/app/modules/setup/leave-type/hooks/use-leave-type-queries";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const DAY_TYPE_OPTIONS = [
  { label: "Whole Day", value: "WholeDay" },
  { label: "Half Day", value: "HalfDay" },
];

const PAY_TYPE_OPTIONS = [
  { label: "With Pay", value: "WithPay" },
  { label: "Without Pay", value: "WithoutPay" },
];

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

const defaultEntry = () => ({
  employeeId: "",
  leaveId: "",
  dayType: "WholeDay",
  payType: "WithPay",
  applicationRemarks: "",
});

export default function LeaveApplicationBatch() {
  const navigate = useNavigate();
  const { mutateAsync: createBatch, isPending } =
    useCreateLeaveApplicationBatch();
  const { data: employees = [] } = useEmployeeFilter();
  const { data: leaveTypes = [] } = useLeaveTypes();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const leaveTypeOptions = leaveTypes.map((l) => ({
    value: l.id,
    label: `${l.code} - ${l.description}`,
  }));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BatchLeaveFormValues>({
    resolver: zodResolver(batchLeaveFormSchema),
    defaultValues: {
      leaveDateFrom: "",
      leaveDateTo: "",
      entries: [defaultEntry()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const leaveDateFrom = watch("leaveDateFrom");
  const leaveDateTo = watch("leaveDateTo");

  const onSubmit = async (values: BatchLeaveFormValues) => {
    const payload: CreateLeaveApplication[] = values.entries.map((entry) => ({
      employeeId: entry.employeeId,
      leaveId: entry.leaveId,
      leaveDateFrom: values.leaveDateFrom,
      leaveDateTo: values.leaveDateTo,
      dayType: entry.dayType,
      payType: entry.payType,
      applicationRemarks: entry.applicationRemarks,
    }));
    await createBatch(payload);
    navigate({ to: "/applications/leave" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Leave
            </Title>
            <p className="page-toolbar-subtitle">
              File leave for multiple employees with the same date range.
            </p>
          </div>
          <Space>
            <Button onClick={() => navigate({ to: "/applications/leave" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Shared date range */}
          <Form.Item
            label="Leave Period"
            validateStatus={
              errors.leaveDateFrom || errors.leaveDateTo ? "error" : ""
            }
            help={errors.leaveDateFrom?.message ?? errors.leaveDateTo?.message}
            style={{ maxWidth: 360 }}
          >
            <RangePicker
              style={{ width: "100%" }}
              value={[
                leaveDateFrom ? dayjs(leaveDateFrom) : null,
                leaveDateTo ? dayjs(leaveDateTo) : null,
              ]}
              onChange={(dates) => {
                setValue(
                  "leaveDateFrom",
                  dates?.[0]?.format("YYYY-MM-DD") ?? "",
                );
                setValue("leaveDateTo", dates?.[1]?.format("YYYY-MM-DD") ?? "");
              }}
            />
          </Form.Item>

          {/* Table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_100px_110px_1fr_36px] gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
              <span>Employee</span>
              <span>Leave Type</span>
              <span>Day Type</span>
              <span>Pay Type</span>
              <span>Remarks</span>
              <span />
            </div>

            <div className="divide-y divide-gray-100">
              {fields.map((field, index) => {
                const entryErrors = errors.entries?.[index];
                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_1fr_100px_110px_1fr_36px] gap-2 px-3 py-2 items-start"
                  >
                    <Form.Item
                      className="mb-0"
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

                    <Form.Item
                      className="mb-0"
                      validateStatus={entryErrors?.leaveId ? "error" : ""}
                      help={entryErrors?.leaveId?.message}
                    >
                      <Controller
                        name={`entries.${index}.leaveId`}
                        control={control}
                        render={({ field: f }) => (
                          <Select
                            {...f}
                            showSearch
                            placeholder="Leave type"
                            options={leaveTypeOptions}
                            filterOption={filterOption}
                            value={f.value || undefined}
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      className="mb-0"
                      validateStatus={entryErrors?.dayType ? "error" : ""}
                      help={entryErrors?.dayType?.message}
                    >
                      <Controller
                        name={`entries.${index}.dayType`}
                        control={control}
                        render={({ field: f }) => (
                          <Select {...f} options={DAY_TYPE_OPTIONS} />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      className="mb-0"
                      validateStatus={entryErrors?.payType ? "error" : ""}
                      help={entryErrors?.payType?.message}
                    >
                      <Controller
                        name={`entries.${index}.payType`}
                        control={control}
                        render={({ field: f }) => (
                          <Select {...f} options={PAY_TYPE_OPTIONS} />
                        )}
                      />
                    </Form.Item>

                    <Form.Item className="mb-0">
                      <Controller
                        name={`entries.${index}.applicationRemarks`}
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

                    <div className="pt-1">
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
              <Button onClick={() => navigate({ to: "/applications/leave" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button type="primary" htmlType="submit" loading={isPending}>
                Submit{fields.length > 1 ? ` (${fields.length} entries)` : ""}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
