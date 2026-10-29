import { useEffect } from "react";
import {
  Form,
  InputNumber,
  Select,
  Button,
  Card,
  Typography,
  Space,
  Switch,
  Alert,
  message,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  payrollSettingsFormSchema,
  type PayrollSettingsFormValues,
} from "@/app/modules/setup/payroll-settings/models/forms/payroll-settings-form.schema";
import {
  usePayrollSettings,
  useUpdatePayrollSettings,
} from "@/app/modules/setup/payroll-settings/hooks/use-payroll-settings-queries";

const { Text } = Typography;

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const DEFAULTS: PayrollSettingsFormValues = {
  fiscalYearStartMonth: 1,
  thirteenthMonthExemptionCeiling: 90000,
  largeTaxCollectionWarningMultiplier: 1,
  portalShowThirteenthMonth: true,
  portalShowCashBond: true,
  portalShowUniformAllowance: true,
  portalShowAnnouncements: true,
  portalShowCoworkers: true,
  portalShowDtr: true,
  portalShowIncompletePunches: true,
  portalShowRawAttendance: true,
  portalShowShiftSchedule: true,
  portalShowPayslips: true,
  portalShowLeaveCredits: true,
  portalShowDeductions: true,
  portalShowLeaveApplications: true,
  portalShowOvertime: true,
  portalShowOfficialBusiness: true,
  portalShowPassSlip: true,
  portalShowLoanApplications: true,
  portalShowPunch: false,
  portalPunchCooldownMinutes: 5,
  mobilePunchModesEnabled: false,
};

// Grouped like the My Portal menu. My Dashboard and My Profile are always available.
const PORTAL_PAGE_GROUPS = [
  {
    title: "General",
    switches: [
      { name: "portalShowAnnouncements", label: "Announcements" },
      { name: "portalShowCoworkers", label: "Coworkers" },
    ],
  },
  {
    title: "Time & Attendance",
    switches: [
      { name: "portalShowDtr", label: "My Daily Time Record" },
      { name: "portalShowIncompletePunches", label: "My Incomplete Punches" },
      { name: "portalShowRawAttendance", label: "My Raw Attendance" },
      { name: "portalShowPunch", label: "Punch In / Out" },
      { name: "portalShowShiftSchedule", label: "My Shift Schedule" },
    ],
  },
  {
    title: "My Pay & Benefits",
    switches: [
      { name: "portalShowPayslips", label: "My Payslips" },
      { name: "portalShowLeaveCredits", label: "My Leave Credits" },
      { name: "portalShowThirteenthMonth", label: "My 13th Month Pay" },
      { name: "portalShowDeductions", label: "My Deductions" },
      { name: "portalShowCashBond", label: "My Cash Bond" },
      { name: "portalShowUniformAllowance", label: "My Uniform Allowance" },
    ],
  },
  {
    title: "Applications",
    switches: [
      { name: "portalShowLeaveApplications", label: "Leave Applications" },
      { name: "portalShowOvertime", label: "Overtime Applications" },
      {
        name: "portalShowOfficialBusiness",
        label: "Official Business Applications",
      },
      { name: "portalShowPassSlip", label: "Pass Slip Applications" },
      { name: "portalShowLoanApplications", label: "Loan Applications" },
    ],
  },
] as const;

export default function PayrollSettingsTab() {
  const { data, isLoading } = usePayrollSettings();
  const { mutateAsync: update, isPending } = useUpdatePayrollSettings();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PayrollSettingsFormValues>({
    resolver: zodResolver(payrollSettingsFormSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (data) {
      // The response carries exactly the form's fields.
      reset({ ...DEFAULTS, ...data });
    }
  }, [data, reset]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const startMonth = watch("fiscalYearStartMonth");
  const punchEnabled = watch("portalShowPunch");
  const endMonthLabel =
    MONTH_OPTIONS[(((startMonth - 2) % 12) + 12) % 12]?.label;

  const onSubmit = async (values: PayrollSettingsFormValues) => {
    try {
      await update(values);
      message.success("Payroll settings saved.");
    } catch {
      message.error("Failed to save settings.");
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      className="form-page-body"
    >
      {/* Fiscal Year */}
      <Card size="small" title="Fiscal Year" className="mb-4">
        <div className="flex flex-col gap-1 mb-4">
          <Text type="secondary" className="text-sm">
            Defines the 12-month period used for payroll year-end calculations.
            The fiscal year ends on the last day of the month before the start
            month.
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            label="Fiscal Year Start Month"
            validateStatus={errors.fiscalYearStartMonth ? "error" : ""}
            help={errors.fiscalYearStartMonth?.message}
          >
            <Controller
              name="fiscalYearStartMonth"
              control={control}
              render={({ field }) => (
                <Select {...field} options={MONTH_OPTIONS} />
              )}
            />
          </Form.Item>

          <Form.Item label="Fiscal Year End Month">
            <Select
              disabled
              value={((startMonth - 2 + 12) % 12) + 1}
              options={MONTH_OPTIONS}
            />
          </Form.Item>
        </div>

        {startMonth === 1 && (
          <Alert
            type="info"
            showIcon
            message="Calendar year (January – December)"
            className="mt-1"
          />
        )}
        {startMonth !== 1 && (
          <Alert
            type="info"
            showIcon
            message={`Fiscal year: ${MONTH_OPTIONS[startMonth - 1]?.label} – ${endMonthLabel}`}
            className="mt-1"
          />
        )}
      </Card>

      {/* 13th Month & Bonuses */}
      <Card
        size="small"
        title="13th Month Pay & Special Bonuses"
        className="mb-4"
      >
        <div className="flex flex-col gap-1 mb-4">
          <Text type="secondary" className="text-sm">
            Under the TRAIN Law (BIR), the combined total of 13th month pay and
            other benefits up to the exemption ceiling is non-taxable. Any
            excess is added to gross taxable income for withholding tax
            computation.
          </Text>
        </div>

        <Form.Item
          label="Non-Taxable Exemption Ceiling (₱)"
          validateStatus={errors.thirteenthMonthExemptionCeiling ? "error" : ""}
          help={errors.thirteenthMonthExemptionCeiling?.message}
        >
          <Controller
            name="thirteenthMonthExemptionCeiling"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                className="w-full"
                min={0}
                step={1000}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => Number(v?.replace(/,/g, "") ?? 0)}
              />
            )}
          />
        </Form.Item>

        <Alert
          type="warning"
          showIcon
          message="Computation rule"
          description={
            <div className="flex flex-col gap-1 text-sm mt-1">
              <Text>
                If <strong>(13th Month + Special Bonuses) ≤ ceiling</strong> →
                entire amount is <strong>Non-Taxable</strong>
              </Text>
              <Text>
                If <strong>(13th Month + Special Bonuses) &gt; ceiling</strong>{" "}
                → excess <em>(total − ceiling)</em> is added to{" "}
                <strong>Gross Taxable Income</strong> for withholding tax
              </Text>
            </div>
          }
        />
      </Card>

      {/* Year-End Tax Annualization */}
      <Card size="small" title="Year-End Tax Annualization" className="mb-4">
        <div className="flex flex-col gap-1 mb-4">
          <Text type="secondary" className="text-sm">
            When a Year-End Tax Adjustment run computes an additional tax
            collection larger than this multiple of an employee&apos;s average
            monthly net pay for the year, it&apos;s flagged with a warning for
            HR to review. This never blocks generating the adjustment —
            it&apos;s informational only.
          </Text>
        </div>

        <Form.Item
          label="Large Collection Warning Multiplier"
          validateStatus={
            errors.largeTaxCollectionWarningMultiplier ? "error" : ""
          }
          help={errors.largeTaxCollectionWarningMultiplier?.message}
        >
          <Controller
            name="largeTaxCollectionWarningMultiplier"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                className="w-full"
                min={0}
                step={0.1}
                addonAfter="× average monthly net pay"
              />
            )}
          />
        </Form.Item>
      </Card>

      {/* Employee Portal visibility */}
      <Card size="small" title="Employee Portal (My Portal)" className="mb-4">
        <div className="flex flex-col gap-1 mb-4">
          <Text type="secondary" className="text-sm">
            Turn a page on to make it available in My Portal. Turn it off to
            hide it from every employee in your company, including its menu item
            and its page. My Dashboard and My Profile are always available.
          </Text>
        </div>

        <div className="flex flex-col gap-4">
          {PORTAL_PAGE_GROUPS.map(({ title, switches }) => (
            <div key={title} className="flex flex-col gap-3">
              <Text strong>{title}</Text>
              {switches.map(({ name, label }) => (
                <div key={name} className="flex items-center justify-between">
                  <Text>{label}</Text>
                  <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        checkedChildren="On"
                        unCheckedChildren="Off"
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          ))}

          {punchEnabled && (
            <Form.Item
              label="Minutes between portal punches"
              extra="An employee can't punch again from My Portal until this many minutes after their last punch (from any source)."
              validateStatus={errors.portalPunchCooldownMinutes ? "error" : ""}
              help={errors.portalPunchCooldownMinutes?.message}
              className="mb-0"
            >
              <Controller
                name="portalPunchCooldownMinutes"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    min={1}
                    max={120}
                    precision={0}
                    addonAfter="minutes"
                  />
                )}
              />
            </Form.Item>
          )}
        </div>
      </Card>

      <Card size="small" title="Mobile App Punching" className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <Text className="text-sm">
            Let each branch and project site choose how employees punch from the
            mobile app: geofence, QR code, NFC, or open. While this is off,
            mobile punching is open everywhere.
          </Text>
          <Controller
            name="mobilePunchModesEnabled"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren="On"
                unCheckedChildren="Off"
              />
            )}
          />
        </div>
      </Card>

      <div className="form-action-footer">
        <Space className="form-action-footer-row">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={isPending || isLoading}
          >
            Save Settings
          </Button>
        </Space>
      </div>
    </Form>
  );
}
