import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
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
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import {
  useCreateDeductionApplication,
  useDeductionApplication,
  useUpdateDeductionApplication,
} from "../../hooks/use-deduction-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useDeductions } from "@/app/modules/setup/deduction/hooks/use-deduction-queries";
import {
  deductionApplicationFormSchema,
  type DeductionApplicationFormValues,
} from "../../models/forms/deduction-application-form.schema";
import {
  DEDUCTION_APPLICATION_LABEL,
  FREQUENCY_OPTIONS,
} from "../../constants/label.const";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { isActiveStatus } from "@/shared/utils/status.util";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import {
  generateLoanBreakdown,
  loanBreakdownColumns,
  type LoanBreakdownRow,
} from "@/shared/utils/loan-amortization.util";

const { Title } = Typography;

type BreakdownRow = LoanBreakdownRow;
const generateBreakdown = generateLoanBreakdown;
const breakdownColumns = loanBreakdownColumns;

export default function DeductionApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } =
    useDeductionApplication(id);
  const { data: rawEmployees = [] } = useEmployees();
  const { data: rawDeductions = [] } = useDeductions();
  const { mutate: create, isPending: creating } =
    useCreateDeductionApplication();
  const { mutate: update, isPending: updating } =
    useUpdateDeductionApplication();

  const [breakdown, setBreakdown] = useState<BreakdownRow[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DeductionApplicationFormValues>({
    resolver: zodResolver(deductionApplicationFormSchema),
    defaultValues: {
      employeeId: "",
      deductionId: "",
      encodeDate: dayjs().format("YYYY-MM-DD"),
      startDate: "",
      frequencyOfPayment: "Monthly",
      terms: 12,
      totalPrincipal: 0,
      interestRate: 0,
      note: "",
      remarks: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedValues = watch([
    "totalPrincipal",
    "interestRate",
    "terms",
    "startDate",
    "frequencyOfPayment",
  ]);

  const regenerateBreakdown = useCallback(() => {
    const [principal, rate, terms, startDate, freq] = watchedValues;
    setBreakdown(
      generateBreakdown(
        principal ?? 0,
        rate ?? 0,
        terms ?? 0,
        startDate ?? "",
        freq ?? "",
      ),
    );
  }, [watchedValues]);

  useEffect(() => {
    if (existing) {
      reset({
        employeeId: existing.employeeId,
        deductionId: existing.deductionId,
        encodeDate: existing.encodeDate?.replace(/Z$/, "").split("T")[0] ?? "",
        startDate: existing.startDate?.replace(/Z$/, "").split("T")[0] ?? "",
        frequencyOfPayment: existing.frequencyOfPayment,
        terms: existing.terms,
        totalPrincipal: existing.totalPrincipal,
        interestRate: existing.interestRate,
        note: existing.note ?? "",
        remarks: existing.remarks ?? "",
      });
      if (existing.breakdown?.length) {
        setBreakdown(
          existing.breakdown.map((r, i) => ({
            period: i + 1,
            date: r.date?.replace(/Z$/, "").split("T")[0] ?? "",
            principal: r.principal,
            interest: r.interest,
            amount: r.amount,
            balance: r.balance,
          })),
        );
      }
    }
  }, [existing, reset]);

  const totalAmount = useMemo(
    () => breakdown.reduce((s, r) => s + r.amount, 0),
    [breakdown],
  );

  const endDate = useMemo(
    () => breakdown[breakdown.length - 1]?.date ?? "",
    [breakdown],
  );

  const employeeOptions = rawEmployees.map((e) => ({
    value: e.id,
    label:
      e.fullName ??
      `${e.lastName}, ${e.firstName} ${e.middleName ?? ""}`.trim(),
  }));

  const deductionOptions = rawDeductions
    .filter((d) => isActiveStatus(d.status))
    .map((d) => ({
      value: d.id,
      label: `${d.code} — ${d.name}`,
    }));

  const onSubmit = (values: DeductionApplicationFormValues) => {
    if (!breakdown.length) {
      message.warning("Generate the amortization schedule first.");
      return;
    }

    if (isEdit && existing) {
      update(
        {
          id: existing.id,
          employeeId: values.employeeId,
          deductionId: values.deductionId,
          encodeDate: values.encodeDate,
          startDate: values.startDate,
          endDate,
          frequencyOfPayment: values.frequencyOfPayment,
          terms: values.terms,
          totalPrincipal: values.totalPrincipal,
          interestRate: values.interestRate,
          totalAmount: +totalAmount.toFixed(4),
          note: values.note ?? "",
          remarks: values.remarks ?? "",
          details: breakdown.map((r) => ({
            id: existing.breakdown[r.period - 1]?.id ?? "",
            date: r.date,
            principal: r.principal,
            interest: r.interest,
            amount: r.amount,
          })),
        },
        {
          onSuccess: () => {
            message.success("Saved.");
            navigate({ to: "/applications/deduction-application" });
          },
          onError: () => message.error("Failed to save."),
        },
      );
    } else {
      create(
        {
          employeeId: values.employeeId,
          deductionId: values.deductionId,
          encodeDate: values.encodeDate,
          startDate: values.startDate,
          endDate,
          frequencyOfPayment: values.frequencyOfPayment,
          terms: values.terms,
          totalPrincipal: values.totalPrincipal,
          interestRate: values.interestRate,
          totalAmount: +totalAmount.toFixed(4),
          note: values.note ?? "",
          remarks: values.remarks ?? "",
          breakdown: breakdown.map((r) => ({
            date: r.date,
            principal: r.principal,
            interest: r.interest,
            amount: r.amount,
          })),
        },
        {
          onSuccess: () => {
            message.success("Saved.");
            navigate({ to: "/applications/deduction-application" });
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
                ? DEDUCTION_APPLICATION_LABEL.EDIT_TITLE
                : DEDUCTION_APPLICATION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {DEDUCTION_APPLICATION_LABEL.SUBTITLE}
            </p>
          </div>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                navigate({ to: "/applications/deduction-application" })
              }
            >
              Back
            </Button>
            <PermissionGate
              permission={
                isEdit ? "Loan/Deduction:Edit" : "Loan/Deduction:Create"
              }
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
                label="Deduction / Loan Type"
                validateStatus={errors.deductionId ? "error" : ""}
                help={errors.deductionId?.message}
                required
              >
                <Controller
                  name="deductionId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      options={deductionOptions}
                      filterOption={(input, opt) =>
                        String(opt?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      placeholder="Select deduction"
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
            <Col xs={24} md={6}>
              <Form.Item
                label="Terms (periods)"
                validateStatus={errors.terms ? "error" : ""}
                help={errors.terms?.message}
                required
              >
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      min={1}
                      style={{ width: "100%" }}
                      precision={0}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Principal Amount"
                validateStatus={errors.totalPrincipal ? "error" : ""}
                help={errors.totalPrincipal?.message}
                required
              >
                <Controller
                  name="totalPrincipal"
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
            <Col xs={24} md={8}>
              <Form.Item
                label="Annual Interest Rate (%)"
                validateStatus={errors.interestRate ? "error" : ""}
                help={errors.interestRate?.message}
                required
              >
                <Controller
                  name="interestRate"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      min={0}
                      precision={4}
                      style={{ width: "100%" }}
                      addonAfter="%"
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} className="flex items-end pb-6">
              <Button
                icon={<SyncOutlined />}
                onClick={regenerateBreakdown}
                style={{ width: "100%" }}
              >
                Generate Schedule
              </Button>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Note">
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => <Input.TextArea {...field} rows={2} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
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

        {breakdown.length > 0 && (
          <Card
            title={
              <span>
                Amortization Schedule
                <span className="ml-4 text-sm font-normal text-gray-500">
                  {breakdown.length} periods · Total:{" "}
                  <strong>
                    ₱
                    {(totalAmount ?? 0).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                  {endDate && ` · Ends ${endDate}`}
                </span>
              </span>
            }
          >
            <div style={{ overflowX: "auto" }}>
              <Table
                rowKey="period"
                dataSource={breakdown}
                columns={breakdownColumns}
                size="small"
                pagination={false}
                summary={(rows) => {
                  const totPrincipal = rows.reduce(
                    (s, r) => s + r.principal,
                    0,
                  );
                  const totInterest = rows.reduce((s, r) => s + r.interest, 0);
                  const totPayment = rows.reduce((s, r) => s + r.amount, 0);
                  const fmt = (v: number) =>
                    (v ?? 0).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    });
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <strong>{fmt(totPrincipal)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <strong>{fmt(totInterest)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <strong>{fmt(totPayment)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} />
                    </Table.Summary.Row>
                  );
                }}
              />
            </div>
          </Card>
        )}

        {breakdown.length === 0 && (
          <Divider plain>
            Fill in Principal, Terms, Interest Rate and Start Date, then click
            "Generate Schedule"
          </Divider>
        )}
      </Form>

      {isEdit && existing && (
        <Card size="small" title="Approval Progress" className="mt-4">
          <ApprovalTimeline
            applicationType="Loan"
            applicationId={existing.id}
            resolveEmployeeName={(empId) =>
              rawEmployees.find((e) => e.id === empId)?.fullName ?? undefined
            }
          />
        </Card>
      )}
    </div>
  );
}
