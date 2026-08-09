import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  Input,
  InputNumber,
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
  batchUndertimeFormSchema,
  type BatchUndertimeFormValues,
} from "../../models/forms/undertime-batch-form.schema";
import type { CreateUndertimeApplication } from "../../models/api/request/create-undertime-application.model";
import { useCreateUndertimeApplicationBatch } from "../../hooks/use-undertime-application-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

const defaultEntry = () => ({
  employeeId: "",
  utMinutes: 0,
  remarks: "",
});

export default function UndertimeBatch() {
  const navigate = useNavigate();
  const { mutateAsync: createBatch, isPending } =
    useCreateUndertimeApplicationBatch();
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
  } = useForm<BatchUndertimeFormValues>({
    resolver: zodResolver(batchUndertimeFormSchema),
    defaultValues: {
      payrollDate: "",
      entries: [defaultEntry()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const payrollDate = watch("payrollDate");

  const onSubmit = async (values: BatchUndertimeFormValues) => {
    const payload: CreateUndertimeApplication[] = values.entries.map(
      (entry) => ({
        employeeId: entry.employeeId,
        payrollDate: values.payrollDate,
        utMinutes: entry.utMinutes,
        remarks: entry.remarks,
      }),
    );
    await createBatch(payload);
    navigate({ to: "/applications/undertime" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Undertime — Batch Entry
            </Title>
            <p className="page-toolbar-subtitle">
              File undertime for multiple employees on the same work date.
            </p>
          </div>
          <Space>
            <Button onClick={() => navigate({ to: "/applications/undertime" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Shared work date */}
          <Form.Item
            label="Work Date"
            validateStatus={errors.payrollDate ? "error" : ""}
            help={errors.payrollDate?.message}
            style={{ width: 200 }}
          >
            <DatePicker
              style={{ width: "100%" }}
              value={payrollDate ? dayjs(payrollDate) : null}
              onChange={(date) =>
                setValue("payrollDate", date?.format("YYYY-MM-DD") ?? "")
              }
            />
          </Form.Item>

          {/* Table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-[1fr_160px_1fr_36px] gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
              <span>Employee</span>
              <span>UT Override (min)</span>
              <span>Reason</span>
              <span />
            </div>

            <div className="divide-y divide-gray-100">
              {fields.map((field, index) => {
                const entryErrors = errors.entries?.[index];
                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_160px_1fr_36px] gap-2 px-3 py-2 items-start"
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
                      validateStatus={entryErrors?.utMinutes ? "error" : ""}
                      help={entryErrors?.utMinutes?.message}
                    >
                      <Controller
                        name={`entries.${index}.utMinutes`}
                        control={control}
                        render={({ field: f }) => (
                          <InputNumber
                            {...f}
                            style={{ width: "100%" }}
                            min={0}
                            max={1440}
                            step={5}
                            addonAfter="min"
                            placeholder="0"
                            onChange={(val) => f.onChange(val ?? 0)}
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      className="mb-0"
                      validateStatus={entryErrors?.remarks ? "error" : ""}
                      help={entryErrors?.remarks?.message}
                    >
                      <Controller
                        name={`entries.${index}.remarks`}
                        control={control}
                        render={({ field: f }) => (
                          <TextArea
                            {...f}
                            rows={1}
                            placeholder="Reason"
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
              <Button
                onClick={() => navigate({ to: "/applications/undertime" })}
              >
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
