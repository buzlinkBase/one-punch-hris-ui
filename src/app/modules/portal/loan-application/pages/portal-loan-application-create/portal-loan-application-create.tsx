import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useCreateMyLoanApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import { useDeductions } from "@/app/modules/setup/deduction/hooks/use-deduction-queries";
import { useDeductionTypes } from "@/app/modules/setup/deduction-type/hooks/use-deduction-type-queries";
import {
  deductionApplicationFormSchema,
  type DeductionApplicationFormValues,
} from "@/app/modules/applications/deduction-application/models/forms/deduction-application-form.schema";
import { FREQUENCY_OPTIONS } from "@/app/modules/applications/deduction-application/constants/label.const";
import { isActiveStatus } from "@/shared/utils/status.util";
import {
  generateLoanBreakdown,
  loanBreakdownColumns,
  type LoanBreakdownRow,
} from "@/shared/utils/loan-amortization.util";

const { Title } = Typography;

export default function PortalLoanApplicationCreate() {
  const navigate = useNavigate();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { data: rawDeductions = [] } = useDeductions();
  const { data: rawDeductionTypes = [] } = useDeductionTypes();
  const { mutateAsync: create, isPending } = useCreateMyLoanApplication();

  const [breakdown, setBreakdown] = useState<LoanBreakdownRow[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeductionApplicationFormValues>({
    resolver: zodResolver(deductionApplicationFormSchema),
    defaultValues: {
      employeeId: employee?.id ?? "",
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

  // employeeId isn't a visible field here -- useMyEmployee() resolves after this form's
  // defaultValues are already fixed at first render, so without this it stays "" forever and
  // blocks submission with no visible error (the schema requires it, but this page never renders
  // an employeeId Form.Item to show that error against).
  useEffect(() => {
    if (employee) setValue("employeeId", employee.id);
  }, [employee, setValue]);

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
      generateLoanBreakdown(
        principal ?? 0,
        rate ?? 0,
        terms ?? 0,
        startDate ?? "",
        freq ?? "",
      ),
    );
  }, [watchedValues]);

  const totalAmount = useMemo(
    () => breakdown.reduce((s, r) => s + r.amount, 0),
    [breakdown],
  );

  const endDate = useMemo(
    () => breakdown[breakdown.length - 1]?.date ?? "",
    [breakdown],
  );

  // Only LOAN-coded deduction types (COLOAN/SSSLOAN/HDMFLOAN/SALLOAN/CALLOAN) are offered here —
  // this is a menu choice for the employee, not an admin classification decision, same as
  // picking a Leave Type on the Leave form.
  const loanTypeIds = useMemo(
    () =>
      new Set(
        rawDeductionTypes
          .filter((t) => t.code?.includes("LOAN"))
          .map((t) => t.id),
      ),
    [rawDeductionTypes],
  );

  const loanOptions = useMemo(
    () =>
      rawDeductions
        .filter(
          (d) => isActiveStatus(d.status) && loanTypeIds.has(d.deductionTypeId),
        )
        .map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` })),
    [rawDeductions, loanTypeIds],
  );

  const onSubmit = async (values: DeductionApplicationFormValues) => {
    if (!breakdown.length) {
      message.warning("Generate the amortization schedule first.");
      return;
    }

    await create({
      employeeId: employee!.id,
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
    });
    navigate({ to: "/portal/loan-applications" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Request a Loan
            </Title>
            <p className="page-toolbar-subtitle">
              Submit a loan application for HR approval. It only affects your
              pay once approved.
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
          <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <Card className="mb-4">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Loan Type"
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
                          options={loanOptions}
                          filterOption={(input, opt) =>
                            String(opt?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          placeholder="Select loan type"
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
                <Col xs={24}>
                  <Form.Item label="Remarks">
                    <Controller
                      name="remarks"
                      control={control}
                      render={({ field }) => (
                        <Input.TextArea
                          {...field}
                          rows={2}
                          placeholder="Reason for this loan"
                        />
                      )}
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
                className="mb-4"
              >
                <div style={{ overflowX: "auto" }}>
                  <Table
                    rowKey="period"
                    dataSource={breakdown}
                    columns={loanBreakdownColumns}
                    size="small"
                    pagination={false}
                  />
                </div>
              </Card>
            )}

            {breakdown.length === 0 && (
              <Divider plain>
                Fill in Principal, Terms, Interest Rate and Start Date, then
                click "Generate Schedule"
              </Divider>
            )}

            <Space>
              <Button type="primary" htmlType="submit" loading={isPending}>
                Submit Request
              </Button>
              <Button
                onClick={() => navigate({ to: "/portal/loan-applications" })}
              >
                Cancel
              </Button>
            </Space>
          </Form>
        )}
      </div>
    </div>
  );
}
