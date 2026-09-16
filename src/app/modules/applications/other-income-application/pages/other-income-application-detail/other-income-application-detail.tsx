import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import {
  useCreateOtherIncomeApplication,
  useOtherIncomeApplication,
  useUpdateOtherIncomeApplication,
} from "../../hooks/use-other-income-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useOtherIncomes } from "@/app/modules/setup/other-income/hooks/use-other-income-queries";
import {
  otherIncomeApplicationFormSchema,
  type OtherIncomeApplicationFormValues,
} from "../../models/forms/other-income-application-form.schema";
import {
  FREQUENCY_OPTIONS,
  OTHER_INCOME_APPLICATION_LABEL,
} from "../../constants/label.const";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { isActiveStatus } from "@/shared/utils/status.util";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

interface ScheduleRow {
  index: number;
  date: string;
  amount: number;
}

function generateSchedule(
  startDate: string,
  endDate: string,
  frequency: string,
  amount: number,
): ScheduleRow[] {
  if (!startDate || !endDate || !frequency || !amount) return [];

  const daysMap: Record<string, number> = {
    Daily: 1,
    Weekly: 7,
    SemiMonthly: 15,
    Monthly: 30,
  };

  const end = dayjs(endDate);
  const rows: ScheduleRow[] = [];
  let current = dayjs(startDate);
  let index = 1;

  while (current.isBefore(end) || current.isSame(end, "day")) {
    rows.push({ index, date: current.format("YYYY-MM-DD"), amount });

    if (frequency === "SemiMonthly") {
      const day = current.date();
      if (day <= 15) {
        current = current.endOf("month").startOf("day");
      } else {
        current = current.add(1, "month").startOf("month").add(14, "day");
      }
    } else {
      current = current.add(daysMap[frequency] ?? 30, "day");
    }

    index++;
    if (index > 500) break; // safety cap
  }

  return rows;
}

const scheduleColumns: ColumnsType<ScheduleRow> = [
  {
    title: "#",
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
  },
  { title: "Payment Date", dataIndex: "date", key: "date", width: 140 },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: (v: number) =>
      (v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
  },
];

export default function OtherIncomeApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } =
    useOtherIncomeApplication(id);
  const { data: rawEmployees = [] } = useEmployees();
  const { data: rawIncomes = [] } = useOtherIncomes();
  const { mutate: create, isPending: creating } =
    useCreateOtherIncomeApplication();
  const { mutate: update, isPending: updating } =
    useUpdateOtherIncomeApplication();

  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<OtherIncomeApplicationFormValues>({
    resolver: zodResolver(otherIncomeApplicationFormSchema),
    defaultValues: {
      employeeId: "",
      incomeId: "",
      encodeDate: dayjs().format("YYYY-MM-DD"),
      startDate: "",
      endDate: "",
      frequencyOfPayment: "SemiMonthly",
      amount: 0,
      isProrated: false,
      remarks: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedValues = watch([
    "startDate",
    "endDate",
    "frequencyOfPayment",
    "amount",
  ]);

  const regenerateSchedule = useCallback(() => {
    const [startDate, endDate, freq, amount] = watchedValues;
    setSchedule(
      generateSchedule(startDate ?? "", endDate ?? "", freq ?? "", amount ?? 0),
    );
  }, [watchedValues]);

  useEffect(() => {
    if (existing) {
      reset({
        employeeId: existing.employeeId,
        incomeId: existing.incomeId,
        encodeDate: existing.encodeDate?.replace(/Z$/, "").split("T")[0] ?? "",
        startDate: existing.startDate?.replace(/Z$/, "").split("T")[0] ?? "",
        endDate: existing.endDate?.replace(/Z$/, "").split("T")[0] ?? "",
        frequencyOfPayment: existing.frequencyOfPayment,
        amount: existing.amount,
        isProrated: existing.isProrated,
        remarks: existing.remarks ?? "",
      });
      if (existing.schedule?.length) {
        setSchedule(
          existing.schedule.map((r, i) => ({
            index: i + 1,
            date: r.date?.replace(/Z$/, "").split("T")[0] ?? "",
            amount: r.amount,
          })),
        );
      }
    }
  }, [existing, reset]);

  const totalAmount = useMemo(
    () => schedule.reduce((s, r) => s + r.amount, 0),
    [schedule],
  );

  const employeeOptions = rawEmployees.map((e) => ({
    value: e.id,
    label:
      e.fullName ??
      `${e.lastName}, ${e.firstName} ${e.middleName ?? ""}`.trim(),
  }));

  const incomeOptions = rawIncomes
    .filter((i) => isActiveStatus(i.status))
    .map((i) => ({
      value: i.id,
      label: `${i.code} — ${i.name}`,
    }));

  const onSubmit = (values: OtherIncomeApplicationFormValues) => {
    if (!schedule.length) {
      message.warning("Generate the payment schedule first.");
      return;
    }

    if (isEdit && existing) {
      update(
        {
          id: existing.id,
          employeeId: values.employeeId,
          incomeId: values.incomeId,
          encodeDate: values.encodeDate,
          startDate: values.startDate,
          endDate: values.endDate,
          frequencyOfPayment: values.frequencyOfPayment,
          amount: values.amount,
          isProrated: values.isProrated,
          remarks: values.remarks ?? "",
          schedule: schedule.map((r, i) => ({
            id: existing.schedule[i]?.id ?? "",
            date: r.date,
            amount: r.amount,
          })),
        },
        {
          onSuccess: () => {
            message.success("Saved.");
            navigate({ to: "/applications/other-income" });
          },
          onError: () => message.error("Failed to save."),
        },
      );
    } else {
      create(
        {
          employeeId: values.employeeId,
          incomeId: values.incomeId,
          encodeDate: values.encodeDate,
          startDate: values.startDate,
          endDate: values.endDate,
          frequencyOfPayment: values.frequencyOfPayment,
          amount: values.amount,
          isProrated: values.isProrated,
          remarks: values.remarks ?? "",
          schedule: schedule.map((r) => ({
            date: r.date,
            amount: r.amount,
          })),
        },
        {
          onSuccess: () => {
            message.success("Saved.");
            navigate({ to: "/applications/other-income" });
          },
          onError: () => message.error("Failed to save."),
        },
      );
    }
  };

  const isSaving = creating || updating;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? OTHER_INCOME_APPLICATION_LABEL.EDIT_TITLE
                : OTHER_INCOME_APPLICATION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {OTHER_INCOME_APPLICATION_LABEL.SUBTITLE}
            </p>
          </div>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate({ to: "/applications/other-income" })}
            >
              Back
            </Button>
            <PermissionGate
              permission={isEdit ? "Other Income:Edit" : "Other Income:Create"}
            >
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit(onSubmit)}
                loading={isSaving}
              >
                Save
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <Form layout="vertical" disabled={loadingExisting}>
        <Card className="mb-4">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Employee"
                validateStatus={errors.employeeId ? "error" : ""}
                help={errors.employeeId?.message}
                required
              >
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      options={employeeOptions}
                      filterOption={(input, opt) =>
                        String(opt?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      placeholder="Select employee"
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Income Type"
                validateStatus={errors.incomeId ? "error" : ""}
                help={errors.incomeId?.message}
                required
              >
                <Controller
                  name="incomeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      options={incomeOptions}
                      filterOption={(input, opt) =>
                        String(opt?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      placeholder="Select income type"
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Encode Date"
                validateStatus={errors.encodeDate ? "error" : ""}
                help={errors.encodeDate?.message}
                required
              >
                <Controller
                  name="encodeDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Start Date"
                validateStatus={errors.startDate ? "error" : ""}
                help={errors.startDate?.message}
                required
              >
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="End Date"
                validateStatus={errors.endDate ? "error" : ""}
                help={errors.endDate?.message}
                required
              >
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Frequency"
                validateStatus={errors.frequencyOfPayment ? "error" : ""}
                help={errors.frequencyOfPayment?.message}
                required
              >
                <Controller
                  name="frequencyOfPayment"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={FREQUENCY_OPTIONS} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Amount per Period"
                validateStatus={errors.amount ? "error" : ""}
                help={errors.amount?.message}
                required
              >
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      min={0}
                      precision={2}
                      style={{ width: "100%" }}
                      addonBefore="₱"
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} className="flex items-end pb-6">
              <Controller
                name="isProrated"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Prorated
                    <Tooltip
                      title="Check this if the income should be spread out a little at a time for government contribution purposes, instead of counted all at once in the month it was given. For example, a one-time signing bonus can be divided across several months rather than treated as a big spike in just one. This doesn't change the amounts in the payment schedule below."
                      overlayStyle={{ maxWidth: 320 }}
                    >
                      <InfoCircleOutlined
                        style={{
                          color: "#8c8c8c",
                          fontSize: 13,
                          marginLeft: 4,
                        }}
                      />
                    </Tooltip>
                  </Checkbox>
                )}
              />
            </Col>
            <Col xs={24} md={8} className="flex items-end pb-6">
              <Button
                icon={<SyncOutlined />}
                onClick={regenerateSchedule}
                style={{ width: "100%" }}
              >
                Generate Schedule
              </Button>
            </Col>
            <Col xs={24}>
              <Form.Item label="Remarks">
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => <Input.TextArea {...field} rows={2} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {schedule.length > 0 && (
          <Card
            title={
              <span>
                Payment Schedule
                <span className="ml-4 text-sm font-normal text-gray-500">
                  {schedule.length} payments · Total:{" "}
                  <strong>
                    ₱
                    {(totalAmount ?? 0).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </span>
              </span>
            }
          >
            <div style={{ overflowX: "auto" }}>
              <Table
                rowKey="index"
                dataSource={schedule}
                columns={scheduleColumns}
                size="small"
                pagination={false}
                summary={(rows) => {
                  const tot = rows.reduce((s, r) => s + r.amount, 0);
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <strong>
                          {(tot ?? 0).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </div>
          </Card>
        )}

        {schedule.length === 0 && (
          <Divider plain>
            Fill in Start Date, End Date, Frequency and Amount, then click
            "Generate Schedule"
          </Divider>
        )}
      </Form>
    </div>
  );
}
