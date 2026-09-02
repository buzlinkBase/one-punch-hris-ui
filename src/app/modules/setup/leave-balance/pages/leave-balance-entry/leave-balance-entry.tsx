import { useEffect } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Typography,
  message,
} from "antd";
import { useForm, useWatch, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leaveBalanceFormSchema,
  type LeaveBalanceFormValues,
} from "../../models/forms/leave-balance-form.schema";
import {
  useLeaveBalance,
  useAdjustLeaveBalance,
} from "../../hooks/use-leave-balance-queries";
import { LEAVE_BALANCE_LABEL } from "../../constants/label.const";
import { useLeaveTypes } from "@/app/modules/setup/leave-type/hooks/use-leave-type-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";

const { Title, Text } = Typography;

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = CURRENT_YEAR - 2 + i;
  return { value: y, label: String(y) };
});

export default function LeaveBalanceEntry() {
  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployeeFilter();
  const { data: leaveTypes = [], isLoading: isLeaveTypesLoading } =
    useLeaveTypes();
  const { mutateAsync: adjust, isPending: isSaving } = useAdjustLeaveBalance();
  const [messageApi, contextHolder] = message.useMessage();

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
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeaveBalanceFormValues>({
    resolver: zodResolver(
      leaveBalanceFormSchema,
    ) as Resolver<LeaveBalanceFormValues>,
    defaultValues: {
      employeeId: "",
      leaveId: "",
      year: CURRENT_YEAR,
      newBalance: 0,
      particulars: "",
    },
  });

  const employeeId = useWatch({ control, name: "employeeId" });
  const leaveId = useWatch({ control, name: "leaveId" });
  const year = useWatch({ control, name: "year" });
  const newBalance = useWatch({ control, name: "newBalance" });

  const { data: current, isFetching: isBalanceLoading } = useLeaveBalance(
    employeeId || undefined,
    leaveId || undefined,
    year || undefined,
  );

  // Pre-fill "New Balance" with what's already on record so HR is editing from the real
  // starting point rather than guessing — re-runs whenever the Employee/Leave Type/Year
  // combination (and therefore the fetched balance) changes.
  useEffect(() => {
    if (current) setValue("newBalance", current.balance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.employeeId, current?.leaveId, current?.periodYear]);

  const onSubmit = async (values: LeaveBalanceFormValues) => {
    try {
      await adjust(values);
      messageApi.success("Leave balance saved.");
      reset({
        employeeId: values.employeeId,
        leaveId: values.leaveId,
        year: values.year,
        newBalance: values.newBalance,
        particulars: "",
      });
    } catch {
      messageApi.error("Failed to save the leave balance. Please try again.");
    }
  };

  const hasSelection = Boolean(employeeId && leaveId && year);

  return (
    <div className="content-page">
      {contextHolder}
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {LEAVE_BALANCE_LABEL.ENTRY_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Set or correct an employee&apos;s leave credit balance for a given
              leave type and year. Every entry is recorded as an adjustment in
              the leave ledger, never a silent overwrite.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Card className="form-section-card">
            <div className="form-grid-3">
              <Form.Item
                label={LEAVE_BALANCE_LABEL.EMPLOYEE}
                validateStatus={errors.employeeId ? "error" : ""}
                help={errors.employeeId?.message}
              >
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? "")}
                      options={employeeOptions}
                      loading={isEmployeesLoading}
                      showSearch
                      filterOption={filterByLabel}
                      placeholder="Select employee"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={LEAVE_BALANCE_LABEL.LEAVE_TYPE}
                validateStatus={errors.leaveId ? "error" : ""}
                help={errors.leaveId?.message}
              >
                <Controller
                  name="leaveId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? "")}
                      options={leaveTypeOptions}
                      loading={isLeaveTypesLoading}
                      showSearch
                      filterOption={filterByLabel}
                      placeholder="Select leave type"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={LEAVE_BALANCE_LABEL.YEAR}
                validateStatus={errors.year ? "error" : ""}
                help={errors.year?.message}
              >
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? CURRENT_YEAR)}
                      options={YEAR_OPTIONS}
                    />
                  )}
                />
              </Form.Item>
            </div>
          </Card>

          {hasSelection && (
            <Card
              className="form-section-card"
              loading={isBalanceLoading}
              title="Current Balance on Record"
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title={LEAVE_BALANCE_LABEL.CURRENT_GRANTED}
                    value={current?.granted ?? 0}
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={LEAVE_BALANCE_LABEL.CURRENT_USED}
                    value={current?.used ?? 0}
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={LEAVE_BALANCE_LABEL.CURRENT_RESERVED}
                    value={current?.reserved ?? 0}
                    precision={2}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={LEAVE_BALANCE_LABEL.CURRENT_BALANCE}
                    value={current?.balance ?? 0}
                    precision={2}
                  />
                </Col>
              </Row>
              {current && current.granted === 0 && current.used === 0 && (
                <Alert
                  className="mt-3"
                  type="info"
                  showIcon
                  message="No balance on record yet for this employee/leave type/year — entering a New Balance below will create it."
                />
              )}
            </Card>
          )}

          <Card className="form-section-card">
            <div className="form-grid-2">
              <Form.Item
                label={LEAVE_BALANCE_LABEL.NEW_BALANCE}
                validateStatus={errors.newBalance ? "error" : ""}
                help={errors.newBalance?.message}
              >
                <Controller
                  name="newBalance"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: "100%" }}
                      min={0}
                      step={0.5}
                    />
                  )}
                />
              </Form.Item>
            </div>
            <Form.Item
              label={LEAVE_BALANCE_LABEL.PARTICULARS}
              validateStatus={errors.particulars ? "error" : ""}
              help={errors.particulars?.message}
            >
              <Controller
                name="particulars"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    rows={3}
                    placeholder={LEAVE_BALANCE_LABEL.PARTICULARS_PLACEHOLDER}
                  />
                )}
              />
            </Form.Item>
            {current && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                This will be recorded as an adjustment of{" "}
                <strong>{(newBalance - current.balance).toFixed(2)}</strong>{" "}
                day(s) from the current balance.
              </Text>
            )}
          </Card>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button type="primary" htmlType="submit" loading={isSaving}>
                Save Leave Balance
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
