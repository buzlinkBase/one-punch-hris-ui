import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Switch,
  Typography,
  Space,
  Tag,
  Card,
  Divider,
  Tooltip,
  notification,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import {
  useForm,
  Controller,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leaveTypeFormSchema,
  type LeaveTypeFormValues,
} from "../../models/forms/leave-type-form.schema";
import {
  useLeaveType,
  useCreateLeaveType,
  useUpdateLeaveType,
} from "../../hooks/use-leave-type-queries";
import { LEAVE_TYPE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PAY_SOURCE_OPTIONS = [
  { value: "Company", label: "Company (employer-funded)" },
  { value: "Government", label: "Government (SSS)" },
  {
    value: "Shared",
    label: "Shared (employer advances, government reimburses)",
  },
  { value: "Unpaid", label: "Unpaid (no pay)" },
  { value: "Other", label: "Other" },
];

const ACCRUAL_BASIS_OPTIONS = [
  { value: "None", label: "None — manual / lump-sum grant" },
  { value: "Monthly", label: "Monthly — earned each month" },
  { value: "Annually", label: "Annually — earned at period start/end" },
  {
    value: "PerPayPeriod",
    label: "Per Pay Period — earned each payroll cycle",
  },
  {
    value: "PerEvent",
    label: "Per Event — granted on qualifying event (e.g. childbirth)",
  },
];

const LEAVE_RESET_OPTIONS = [
  { value: "PerPeriod", label: "Per Period — resets annually" },
  { value: "PerEvent", label: "Per Event — resets on each qualifying event" },
];

const ELIGIBILITY_BASIS_OPTIONS = [
  { value: "TenureMonths", label: "Tenure — months since hire date" },
  {
    value: "PresentDays",
    label:
      "Present Days — count of present days (holidays and rest days included)",
  },
];

const GENDER_RESTRICTION_OPTIONS = [
  { value: "None", label: "None (all genders)" },
  { value: "MaleOnly", label: "Male only (e.g. Paternity Leave)" },
  {
    value: "FemaleOnly",
    label: "Female only (e.g. Maternity, Special Women's Leave)",
  },
];

const CARRY_OVER_OPTIONS = [
  {
    value: "Forfeit",
    label: "Forfeit — unused credits are lost at period end",
  },
  { value: "Unlimited", label: "Unlimited — entire balance carries over" },
  { value: "Capped", label: "Capped — up to a max number of days carry over" },
];

const CATEGORY_OPTIONS = [
  { value: "Statutory", label: "Statutory" },
  { value: "Benefit", label: "Benefit" },
  { value: "Emergency", label: "Emergency" },
  { value: "Government", label: "Government" },
  { value: "Medical", label: "Medical" },
  { value: "Bereavement", label: "Bereavement" },
  { value: "Birthday", label: "Birthday" },
  { value: "Wellness", label: "Wellness" },
  { value: "Training", label: "Training" },
  { value: "Other", label: "Other" },
];

const TIPS = {
  code: "Short identifier used in reports and payroll (e.g. SIL, VL, ML). Must be unique per leave type.",
  category:
    "Groups this leave type for reporting and filtering.\n• Statutory: required by Philippine law (e.g. SIL, Paternity, Maternity).\n• Benefit: employer-defined perk (e.g. VL, SL).\n• Emergency: calamity or disaster relief leave.\n• Government: government-sector only (CSC rules).\n• Medical: extended illness or hospitalization beyond standard SL.\n• Bereavement: death of a family member.\n• Birthday: birthday privilege leave.\n• Wellness: mental health or personal wellness days.\n• Training: study leave, seminars, or certification exams.\n• Other: anything that does not fit the above.",
  description:
    "Full name of the leave type as it appears to employees and in reports.",
  legalBasis:
    "The specific law or regulation that mandates this leave, if applicable. Examples: RA 11210 (Expanded Maternity), RA 8187 (Paternity), Labor Code Art. 95 (SIL).",
  isStatutory:
    "Mark this on if the leave is required by Philippine labor law or a special law. Helps in compliance reporting and can drive eligibility enforcement.",
  remarks: "Internal HR notes. Not visible to employees.",

  paySource:
    "Who funds the leave pay.\n• Company: employer pays directly.\n• Government: SSS pays the benefit.\n• Shared: employer advances the pay, then claims SSS reimbursement.\n• Unpaid: no compensation during the leave.",
  employerAdvancesPayment:
    "When on, the employer pays the employee upfront and later files for SSS reimbursement. This is the standard practice for SSS Maternity Leave under RA 11210.",

  accrualBasis:
    "How credits are earned.\n• None: HR grants credits manually or as a lump sum at period start.\n• Monthly / Annually / Per Pay Period: credits accumulate automatically over time using the Accrual Rate.\n• Per Event: the full Credits entitlement is granted each time a qualifying event occurs (e.g. each approved pregnancy for Maternity Leave).",
  credits:
    "Number of days granted upfront per period (for None accrual) or per qualifying event (for Per Event accrual). Example: SIL = 5, Paternity = 7, Maternity = 105.",
  accrualRate:
    "Days earned per accrual period. Example: 1.25 days/month accumulates to 15 days/year. The SIL mandatory minimum is 5 days/year (≈ 0.42/month).",
  maxAccrualBalance:
    "Ceiling on how many days an employee can accumulate. Accrual stops once this is reached. Leave blank for uncapped. Example: set 10 to prevent hoarding for a 5-day/year leave.",
  leaveReset:
    "Per Period: credits and balances reset on the anniversary or at year-end. Per Event: resets each time a qualifying event occurs (e.g. each pregnancy resets Maternity credits).",
  proRateFirstYear:
    "When on, employees hired mid-year receive a fractional entitlement proportional to their remaining months in the year. Required for SIL compliance when an employee completes 1 year of service mid-period.",

  eligibilityBasis:
    "How service requirement is measured.\n• Tenure: calendar months since the employee's hire date.\n• Present Days: count of days the employee is on record as present — includes holidays and rest days (worked or not), excludes Absent/Incomplete/Skipped days.",
  minServiceMonths:
    "Months of continuous service required before an employee can use this leave. 0 = eligible from day one. Philippine law requires 12 months of service before SIL can be availed.",
  minPresentDays:
    "Number of present days (see Eligibility Basis) required before an employee can use this leave. 0 = eligible from day one.",
  genderRestriction:
    "Restrict this leave to a specific gender. Use Male Only for Paternity Leave (RA 8187), Female Only for Maternity (RA 11210) or Special Leave for Women (RA 9710).",
  requiresApproval:
    "When on, a supervisor must approve the application before it is processed. Turn off for statutory leaves that only require notice, such as VAWC leave (RA 9262) where approval cannot be withheld.",
  requiresSupportingDocument:
    "When on, employees must upload a supporting document with their application. Examples: medical certificate for sick leave, birth certificate for Paternity Leave.",
  allowEmployeeFiling:
    "When on, employees can file this leave type themselves in the Employee Portal. When off, it's hidden from the portal and can only be filed by HR.",

  maxDaysPerYear:
    "Hard annual cap on this leave regardless of credit balance. Example: VAWC Leave is fixed at 10 days per year by law. Leave blank for unlimited.",
  maxConsecutiveDays:
    "Maximum days allowed in a single leave application. Useful for preventing very long unbroken absences for leaves that should be taken in short blocks.",
  allowHalfDay:
    "When on, employees can file AM-only or PM-only half-day leave. Deducts 0.5 credits per half-day.",
  allowPartial:
    "When on, employees can file leave by specifying exact start and end times rather than full or half days. Suitable for hourly-computed leave types.",
  allowNegativeBalance:
    "When on, employees can file leave even when their balance is zero (advance leave). The balance goes negative and is recovered from future accruals or deducted from final pay.",
  requiresCredits:
    "When on, this leave type must have leave credits set up before an employee can file it — filing is blocked if no credits record exists for the employee/year. Defaults to on when Pay Source is Company and off when it's Government or Shared (e.g. SSS-funded leave isn't tracked against the internal credit pool), but you can override it manually.",

  carryOverType:
    "What happens to unused credits when the period resets.\n• Forfeit: unused days are lost (common for sick leave).\n• Unlimited: entire balance rolls over to the next period.\n• Capped: up to the specified max days carry over; the rest are forfeited.",
  carryOverMaxDays:
    "Maximum days that roll over to the next period when Carry-Over Type is Capped. Days in excess of this are forfeited.",
  carryOverExpiryMonths:
    "Number of months after the period end before carried-over credits expire. Leave blank if carried-over days never expire.",
  convertToCash:
    "When on, unused leave at period end can be monetized at the specified rate. Philippine law requires SIL to be convertible to cash if the employee resigns or retires.",
  cashConversionRate:
    "Fraction of the employee's daily rate paid per converted leave day. 1.0 = full daily rate, 0.5 = half daily rate. Most companies use 1.0.",
  maxCashConversionDays:
    "Maximum days that can be converted to cash per period. Leave blank for no limit. Useful when you allow limited monetization (e.g. up to 5 days of unused VL).",
};

const infoIcon = (tip: string) => (
  <Tooltip title={tip} overlayStyle={{ maxWidth: 320 }} placement="right">
    <InfoCircleOutlined
      style={{ color: "#8c8c8c", fontSize: 13, marginLeft: 4 }}
    />
  </Tooltip>
);

const switchRow = (tip: string, label: string, node: React.ReactNode) => (
  <div className="flex items-center gap-3">
    {node}
    <Text>
      {label}
      {infoIcon(tip)}
    </Text>
  </div>
);

const sectionTitle = (label: string) => (
  <Text strong style={{ fontSize: 13, color: "#374151" }}>
    {label}
  </Text>
);

const DEFAULT_VALUES: LeaveTypeFormValues = {
  code: "",
  category: undefined,
  description: "",
  legalBasis: "",
  remarks: "",
  paySource: "Company",
  employerAdvancesPayment: false,
  accrualBasis: "None",
  credits: 0,
  accrualRate: 0,
  maxAccrualBalance: null,
  proRateFirstYear: false,
  leaveReset: "PerPeriod",
  eligibilityBasis: "TenureMonths",
  minServiceMonths: 0,
  minPresentDays: 0,
  genderRestriction: "None",
  requiresApproval: true,
  requiresSupportingDocument: false,
  allowEmployeeFiling: true,
  allowHalfDay: true,
  allowPartial: false,
  allowNegativeBalance: false,
  requiresCredits: true,
  maxDaysPerYear: null,
  maxConsecutiveDays: null,
  carryOverType: "Forfeit",
  carryOverMaxDays: 0,
  carryOverExpiryMonths: null,
  convertToCash: false,
  cashConversionRate: 1,
  maxCashConversionDays: null,
  isStatutory: false,
};

export default function LeaveTypeDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useLeaveType(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateLeaveType();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateLeaveType();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const accrualBasis = useWatch({ control, name: "accrualBasis" });
  const paySource = useWatch({ control, name: "paySource" });
  const carryOverType = useWatch({ control, name: "carryOverType" });
  const convertToCash = useWatch({ control, name: "convertToCash" });
  const eligibilityBasis = useWatch({ control, name: "eligibilityBasis" });

  const isAccrualBased = accrualBasis !== "None" && accrualBasis !== "PerEvent";
  const isGovernmentPay = paySource === "Government" || paySource === "Shared";
  const isCarryOverCapped = carryOverType === "Capped";
  const isPresentDaysBasis = eligibilityBasis === "PresentDays";

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        category: selected.category,
        description: selected.description,
        legalBasis: selected.legalBasis ?? "",
        remarks: selected.remarks ?? "",
        paySource: selected.paySource,
        employerAdvancesPayment: selected.employerAdvancesPayment ?? false,
        accrualBasis: selected.accrualBasis ?? "None",
        credits: selected.credits ?? 0,
        accrualRate: selected.accrualRate ?? 0,
        maxAccrualBalance: selected.maxAccrualBalance ?? null,
        proRateFirstYear: selected.proRateFirstYear ?? false,
        leaveReset: selected.leaveReset,
        eligibilityBasis: selected.eligibilityBasis ?? "TenureMonths",
        minServiceMonths: selected.minServiceMonths ?? 0,
        minPresentDays: selected.minPresentDays ?? 0,
        genderRestriction: selected.genderRestriction ?? "None",
        requiresApproval: selected.requiresApproval ?? true,
        requiresSupportingDocument:
          selected.requiresSupportingDocument ?? false,
        allowEmployeeFiling: selected.allowEmployeeFiling ?? true,
        allowHalfDay: selected.allowHalfDay ?? true,
        allowPartial: selected.allowPartial ?? false,
        allowNegativeBalance: selected.allowNegativeBalance ?? false,
        requiresCredits: selected.requiresCredits ?? true,
        maxDaysPerYear: selected.maxDaysPerYear ?? null,
        maxConsecutiveDays: selected.maxConsecutiveDays ?? null,
        carryOverType: selected.carryOverType ?? "Forfeit",
        carryOverMaxDays: selected.carryOverMaxDays ?? 0,
        carryOverExpiryMonths: selected.carryOverExpiryMonths ?? null,
        convertToCash: selected.convertToCash ?? false,
        cashConversionRate: selected.cashConversionRate ?? 1,
        maxCashConversionDays: selected.maxCashConversionDays ?? null,
        isStatutory: selected.isStatutory ?? false,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: LeaveTypeFormValues) => {
    try {
      // credits/accrualRate and minServiceMonths/minPresentDays: only the one relevant to
      // the selected accrualBasis/eligibilityBasis is guaranteed by the schema — the hidden
      // one may be undefined, but the API expects a concrete number for both, so default
      // the inactive one to 0.
      const payload = {
        ...values,
        credits: values.credits ?? 0,
        accrualRate: values.accrualRate ?? 0,
        minServiceMonths: values.minServiceMonths ?? 0,
        minPresentDays: values.minPresentDays ?? 0,
      };
      if (isEdit && id) {
        await update({ id, ...payload });
      } else {
        await add(payload);
      }
      notification.success({
        message: isEdit ? "Leave Type Updated" : "Leave Type Created",
        description: `"${values.description}" was saved successfully.`,
      });
      navigate({ to: "/setup/leave-type" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      notification.error({ message: "Save failed", description: msg });
    }
  };

  const onValidationError = (errs: FieldErrors<LeaveTypeFormValues>) => {
    const LABELS: Partial<Record<keyof LeaveTypeFormValues, string>> = {
      code: "Code",
      category: "Category",
      description: "Leave Name",
      legalBasis: "Legal Basis",
      remarks: "Remarks",
      paySource: "Pay Source",
      employerAdvancesPayment: "Employer Advances Payment",
      accrualBasis: "Accrual Basis",
      credits: "Default Credits",
      accrualRate: "Accrual Rate",
      maxAccrualBalance: "Max Balance",
      leaveReset: "Reset Policy",
      eligibilityBasis: "Eligibility Basis",
      minServiceMonths: "Minimum Service (months)",
      minPresentDays: "Minimum Present Days",
      genderRestriction: "Gender Restriction",
      requiresApproval: "Requires Approval",
      requiresSupportingDocument: "Requires Supporting Document",
      allowEmployeeFiling: "Employee Can File via Portal",
      allowHalfDay: "Allow Half-Day Filing",
      allowPartial: "Allow Partial Filing",
      allowNegativeBalance: "Allow Negative Balance",
      requiresCredits: "Requires Leave Credits",
      maxDaysPerYear: "Max Days per Year",
      maxConsecutiveDays: "Max Consecutive Days",
      carryOverType: "Carry-Over Type",
      carryOverMaxDays: "Max Carry-Over Days",
      carryOverExpiryMonths: "Carry-Over Expiry",
      convertToCash: "Convert to Cash",
      cashConversionRate: "Cash Conversion Rate",
      maxCashConversionDays: "Max Convertible Days",
      isStatutory: "Statutory",
    };

    const lines = Object.entries(errs).map(([key, err]) => {
      const label = LABELS[key as keyof LeaveTypeFormValues] ?? key;
      const msg = (err as { message?: string })?.message ?? "Invalid value";
      return `${label}: ${msg}`;
    });

    notification.error({
      message: "Please fix the following fields",
      description: (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ),
      duration: 6,
    });
  };

  const fi = (
    label: string,
    name: keyof typeof errors,
    node: React.ReactNode,
    tip?: string,
  ) => (
    <Form.Item
      label={
        tip ? (
          <span>
            {label}
            {infoIcon(tip)}
          </span>
        ) : (
          label
        )
      }
      validateStatus={errors[name] ? "error" : ""}
      help={errors[name]?.message as string | undefined}
    >
      {node}
    </Form.Item>
  );

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? LEAVE_TYPE_LABEL.EDIT_TITLE
                : LEAVE_TYPE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure leave policy, entitlements, eligibility, and carry-over
              rules.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/leave-type" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmit, onValidationError)}
        >
          <div className="grid grid-cols-1 gap-4">
            {/* ── Basic Information ───────────────────────────────────────────── */}
            <Card size="small" title={sectionTitle("Basic Information")}>
              <div className="form-grid-2">
                {fi(
                  LEAVE_TYPE_LABEL.CODE,
                  "code",
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="e.g. SIL, ML, VL, VAWC" />
                    )}
                  />,
                  TIPS.code,
                )}
                {fi(
                  LEAVE_TYPE_LABEL.CATEGORY,
                  "category",
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={CATEGORY_OPTIONS}
                        placeholder="Select category"
                        allowClear
                      />
                    )}
                  />,
                  TIPS.category,
                )}
              </div>

              {fi(
                LEAVE_TYPE_LABEL.DESCRIPTION,
                "description",
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g. Service Incentive Leave"
                    />
                  )}
                />,
                TIPS.description,
              )}

              <div className="form-grid-2">
                {fi(
                  "Legal Basis",
                  "legalBasis",
                  <Controller
                    name="legalBasis"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="e.g. Labor Code Art. 95, RA 11210"
                      />
                    )}
                  />,
                  TIPS.legalBasis,
                )}
                <div className="flex items-center gap-3 pt-7">
                  <Controller
                    name="isStatutory"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        size="small"
                      />
                    )}
                  />
                  <Text>
                    Government-mandated (statutory)
                    {infoIcon(TIPS.isStatutory)}
                  </Text>
                </div>
              </div>

              {fi(
                LEAVE_TYPE_LABEL.REMARKS,
                "remarks",
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={2}
                      placeholder="Internal notes or additional context"
                    />
                  )}
                />,
                TIPS.remarks,
              )}
            </Card>

            {/* ── Pay & Source ────────────────────────────────────────────────── */}
            <Card size="small" title={sectionTitle("Pay & Source")}>
              <div className="form-grid-2">
                {fi(
                  LEAVE_TYPE_LABEL.PAY_SOURCE,
                  "paySource",
                  <Controller
                    name="paySource"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={PAY_SOURCE_OPTIONS}
                        onChange={(value) => {
                          field.onChange(value);
                          setValue(
                            "requiresCredits",
                            value !== "Government" && value !== "Shared",
                          );
                        }}
                      />
                    )}
                  />,
                  TIPS.paySource,
                )}
                {isGovernmentPay && (
                  <div className="flex items-center gap-3 pt-7">
                    <Controller
                      name="employerAdvancesPayment"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          size="small"
                        />
                      )}
                    />
                    <div>
                      <Text>
                        Employer advances payment
                        {infoIcon(TIPS.employerAdvancesPayment)}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Employer pays first, then claims reimbursement from SSS
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* ── Accrual & Reset ─────────────────────────────────────────────── */}
            <Card size="small" title={sectionTitle("Accrual & Reset")}>
              <div className="form-grid-3">
                {fi(
                  "Accrual Basis",
                  "accrualBasis",
                  <Controller
                    name="accrualBasis"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={ACCRUAL_BASIS_OPTIONS} />
                    )}
                  />,
                  TIPS.accrualBasis,
                )}
                {isAccrualBased
                  ? fi(
                      "Accrual Rate (days / period)",
                      "accrualRate",
                      <Controller
                        name="accrualRate"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            onChange={(v) => field.onChange(v ?? 0)}
                            min={0}
                            step={0.25}
                            className="w-full"
                            placeholder="e.g. 1.25"
                          />
                        )}
                      />,
                      TIPS.accrualRate,
                    )
                  : fi(
                      "Default Credits (days)",
                      "credits",
                      <Controller
                        name="credits"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            onChange={(v) => field.onChange(v ?? 0)}
                            min={0}
                            step={0.5}
                            className="w-full"
                            placeholder="e.g. 5"
                          />
                        )}
                      />,
                      TIPS.credits,
                    )}
                {fi(
                  "Max Balance (days)",
                  "maxAccrualBalance",
                  <Controller
                    name="maxAccrualBalance"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        value={field.value ?? undefined}
                        onChange={(v) => field.onChange(v ?? null)}
                        min={0}
                        step={0.5}
                        className="w-full"
                        placeholder="Leave blank for uncapped"
                      />
                    )}
                  />,
                  TIPS.maxAccrualBalance,
                )}
              </div>

              <div className="form-grid-3">
                {fi(
                  "Reset Policy",
                  "leaveReset",
                  <Controller
                    name="leaveReset"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={LEAVE_RESET_OPTIONS} />
                    )}
                  />,
                  TIPS.leaveReset,
                )}
                <div className="flex items-center gap-3 pt-7">
                  {switchRow(
                    TIPS.proRateFirstYear,
                    "Pro-rate in first year of service",
                    <Controller
                      name="proRateFirstYear"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          size="small"
                        />
                      )}
                    />,
                  )}
                </div>
              </div>
            </Card>

            {/* ── Eligibility ──────────────────────────────────────────────────── */}
            <Card size="small" title={sectionTitle("Eligibility")}>
              <div className="form-grid-3">
                {fi(
                  "Eligibility Basis",
                  "eligibilityBasis",
                  <Controller
                    name="eligibilityBasis"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={ELIGIBILITY_BASIS_OPTIONS} />
                    )}
                  />,
                  TIPS.eligibilityBasis,
                )}
                {isPresentDaysBasis
                  ? fi(
                      "Minimum Present Days",
                      "minPresentDays",
                      <Controller
                        name="minPresentDays"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            onChange={(v) => field.onChange(v ?? 0)}
                            min={0}
                            className="w-full"
                            placeholder="0 = immediately eligible"
                            addonAfter="days"
                          />
                        )}
                      />,
                      TIPS.minPresentDays,
                    )
                  : fi(
                      "Minimum Service (months)",
                      "minServiceMonths",
                      <Controller
                        name="minServiceMonths"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            onChange={(v) => field.onChange(v ?? 0)}
                            min={0}
                            className="w-full"
                            placeholder="0 = immediately eligible"
                            addonAfter="months"
                          />
                        )}
                      />,
                      TIPS.minServiceMonths,
                    )}
                {fi(
                  "Gender Restriction",
                  "genderRestriction",
                  <Controller
                    name="genderRestriction"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={GENDER_RESTRICTION_OPTIONS} />
                    )}
                  />,
                  TIPS.genderRestriction,
                )}
              </div>

              <div className="flex flex-wrap gap-8">
                {switchRow(
                  TIPS.requiresApproval,
                  "Requires approval",
                  <Controller
                    name="requiresApproval"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        size="small"
                      />
                    )}
                  />,
                )}
                {switchRow(
                  TIPS.requiresSupportingDocument,
                  "Requires supporting document",
                  <Controller
                    name="requiresSupportingDocument"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        size="small"
                      />
                    )}
                  />,
                )}
                {switchRow(
                  TIPS.allowEmployeeFiling,
                  LEAVE_TYPE_LABEL.ALLOW_EMPLOYEE_FILING,
                  <Controller
                    name="allowEmployeeFiling"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        size="small"
                      />
                    )}
                  />,
                )}
              </div>
            </Card>

            {/* ── Application Rules ────────────────────────────────────────────── */}
            <Card size="small" title={sectionTitle("Application Rules")}>
              <div className="form-grid-3">
                {fi(
                  "Max Days per Year",
                  "maxDaysPerYear",
                  <Controller
                    name="maxDaysPerYear"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        value={field.value ?? undefined}
                        onChange={(v) => field.onChange(v ?? null)}
                        min={0}
                        step={0.5}
                        className="w-full"
                        placeholder="Leave blank for unlimited"
                        addonAfter="days"
                      />
                    )}
                  />,
                  TIPS.maxDaysPerYear,
                )}
                {fi(
                  "Max Consecutive Days",
                  "maxConsecutiveDays",
                  <Controller
                    name="maxConsecutiveDays"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        value={field.value ?? undefined}
                        onChange={(v) => field.onChange(v ?? null)}
                        min={1}
                        className="w-full"
                        placeholder="Leave blank for no limit"
                        addonAfter="days"
                      />
                    )}
                  />,
                  TIPS.maxConsecutiveDays,
                )}
              </div>

              <div className="flex flex-wrap gap-8">
                {switchRow(
                  TIPS.allowHalfDay,
                  "Allow half-day filing",
                  <Controller
                    name="allowHalfDay"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        size="small"
                      />
                    )}
                  />,
                )}
                {switchRow(
                  TIPS.allowPartial,
                  "Allow time-based (partial hours) filing",
                  <Controller
                    name="allowPartial"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        size="small"
                      />
                    )}
                  />,
                )}
                {switchRow(
                  TIPS.requiresCredits,
                  "Requires leave credits",
                  <Controller
                    name="requiresCredits"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        size="small"
                      />
                    )}
                  />,
                )}
                {/* Hidden for now — allowNegativeBalance still defaults to false and is
                    submitted as such; re-enable this switchRow to expose it again. */}
              </div>
            </Card>

            {/* ── Carry-Over & Cash Conversion ─────────────────────────────────── */}
            <Card
              size="small"
              title={sectionTitle("Carry-Over & Cash Conversion")}
            >
              <div className="form-grid-3">
                {fi(
                  "Carry-Over Type",
                  "carryOverType",
                  <Controller
                    name="carryOverType"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={CARRY_OVER_OPTIONS} />
                    )}
                  />,
                  TIPS.carryOverType,
                )}
                {isCarryOverCapped &&
                  fi(
                    "Max Carry-Over Days",
                    "carryOverMaxDays",
                    <Controller
                      name="carryOverMaxDays"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          onChange={(v) => field.onChange(v ?? 0)}
                          min={0}
                          step={0.5}
                          className="w-full"
                          addonAfter="days"
                        />
                      )}
                    />,
                    TIPS.carryOverMaxDays,
                  )}
                {fi(
                  "Carry-Over Expiry",
                  "carryOverExpiryMonths",
                  <Controller
                    name="carryOverExpiryMonths"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        value={field.value ?? undefined}
                        onChange={(v) => field.onChange(v ?? null)}
                        min={1}
                        className="w-full"
                        placeholder="Leave blank — never expires"
                        addonAfter="months after period end"
                      />
                    )}
                  />,
                  TIPS.carryOverExpiryMonths,
                )}
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div className="mb-4">
                {switchRow(
                  TIPS.convertToCash,
                  "Unused leave convertible to cash at period end",
                  <Controller
                    name="convertToCash"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        size="small"
                      />
                    )}
                  />,
                )}
              </div>

              {convertToCash && (
                <div className="form-grid-3">
                  {fi(
                    "Cash Conversion Rate",
                    "cashConversionRate",
                    <Controller
                      name="cashConversionRate"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          onChange={(v) => field.onChange(v ?? 0)}
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                          placeholder="1.0 = full daily rate"
                          addonAfter="× daily rate"
                        />
                      )}
                    />,
                    TIPS.cashConversionRate,
                  )}
                  {fi(
                    "Max Convertible Days",
                    "maxCashConversionDays",
                    <Controller
                      name="maxCashConversionDays"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          value={field.value ?? undefined}
                          onChange={(v) => field.onChange(v ?? null)}
                          min={0}
                          step={0.5}
                          className="w-full"
                          placeholder="Leave blank for unlimited"
                          addonAfter="days"
                        />
                      )}
                    />,
                    TIPS.maxCashConversionDays,
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/leave-type" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating || isCreating}
              >
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
