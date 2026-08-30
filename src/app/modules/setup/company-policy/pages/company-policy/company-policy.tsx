import { useEffect } from "react";
import {
  Button,
  Card,
  Form,
  InputNumber,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
  notification,
} from "antd";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyPolicyFormSchema,
  type CompanyPolicyFormValues,
} from "../../models/forms/company-policy-form.schema";
import {
  useCompanyPolicy,
  useUpdateCompanyPolicy,
} from "../../hooks/use-company-policy-queries";
import {
  COMPANY_POLICY_LABEL,
  OT_INCLUSION_OPTIONS,
  OT_ELIGIBILITY_OPTIONS,
  HOLIDAY_TIME_BASIS_OPTIONS,
  CROSS_MONTH_STATUTORY_CREDIT_POLICY_OPTIONS,
} from "../../constants/label.const";
import FixedSalaryDefaultsTab from "./fixed-salary-defaults-tab";
import CompanyInfoTab from "./company-info-tab";

const { Title } = Typography;

function GeneralPolicyTab() {
  const { data: policy, isLoading } = useCompanyPolicy();
  const { mutateAsync: update, isPending } = useUpdateCompanyPolicy();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyPolicyFormValues>({
    resolver: zodResolver(companyPolicyFormSchema),
    defaultValues: {
      otInclusionPolicy: "UsePostShiftWork",
      otEligibility: "IndependentOfAttendanceIssues",
      isHalfDayLateOn: false,
      halfDayLateThresholdMinutes: 0,
      isWholeDayLateOn: false,
      wholeDayLateThresholdMinutes: 0,
      nightDiffThreshold: 0,
      attFillLimit: "NOLIMIT",
      holidayTimeBasis: "BasedOnTimeInDayType",
      isHolPlusReg: false,
      timeInAllowance: -120,
      doublePunchGap: 2,
      checkAfterHoliday: false,
      waivePriorDayRequirement: false,
      crossMonthStatutoryCreditPolicy: "CutoffStartMonth",
      wTaxCrossMonthCreditPolicy: "CutoffEndMonth",
      treatNdotAsNdOnly: false,
    },
  });

  const isHalfDayLateOn = useWatch({ control, name: "isHalfDayLateOn" });
  const isWholeDayLateOn = useWatch({ control, name: "isWholeDayLateOn" });

  useEffect(() => {
    if (policy) {
      reset({
        otInclusionPolicy: policy.otInclusionPolicy,
        otEligibility: policy.otEligibility,
        isHalfDayLateOn: policy.isHalfDayLateOn,
        halfDayLateThresholdMinutes: policy.halfDayLateThresholdMinutes,
        isWholeDayLateOn: policy.isWholeDayLateOn,
        wholeDayLateThresholdMinutes: policy.wholeDayLateThresholdMinutes,
        nightDiffThreshold: policy.nightDiffThreshold,
        attFillLimit: policy.attFillLimit,
        holidayTimeBasis: policy.holidayTimeBasis,
        isHolPlusReg: policy.isHolPlusReg,
        timeInAllowance: policy.timeInAllowance,
        doublePunchGap: policy.doublePunchGap,
        checkAfterHoliday: policy.checkAfterHoliday,
        waivePriorDayRequirement: policy.waivePriorDayRequirement,
        crossMonthStatutoryCreditPolicy:
          policy.crossMonthStatutoryCreditPolicy ?? "CutoffStartMonth",
        wTaxCrossMonthCreditPolicy:
          policy.wTaxCrossMonthCreditPolicy ?? "CutoffEndMonth",
        treatNdotAsNdOnly: policy.treatNdotAsNdOnly,
      });
    }
  }, [policy, reset]);

  const onSubmit = async (values: CompanyPolicyFormValues) => {
    try {
      await update({ ...values, attFillLimit: "NOLIMIT", isHolPlusReg: false });
      notification.success({
        message: "Policy saved",
        description: "Company policy settings have been updated.",
        placement: "topRight",
      });
    } catch {
      notification.error({
        message: "Save failed",
        description: "Failed to update company policy. Please try again.",
        placement: "topRight",
      });
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      className="form-page-body"
    >
      <div className="flex flex-col gap-4">
        {/* Overtime */}
        <Card
          title={COMPANY_POLICY_LABEL.SECTION_OVERTIME}
          loading={isLoading}
          size="small"
        >
          <div className="form-grid-2">
            <Form.Item
              label={COMPANY_POLICY_LABEL.OT_INCLUSION}
              validateStatus={errors.otInclusionPolicy ? "error" : ""}
              help={errors.otInclusionPolicy?.message}
            >
              <Controller
                name="otInclusionPolicy"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={OT_INCLUSION_OPTIONS}
                    placeholder="Select OT inclusion rule"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={COMPANY_POLICY_LABEL.OT_ELIGIBILITY}
              validateStatus={errors.otEligibility ? "error" : ""}
              help={errors.otEligibility?.message}
            >
              <Controller
                name="otEligibility"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={OT_ELIGIBILITY_OPTIONS}
                    placeholder="Select OT eligibility rule"
                  />
                )}
              />
            </Form.Item>
          </div>
        </Card>

        {/* Late Policy */}
        <Card
          title={COMPANY_POLICY_LABEL.SECTION_LATE}
          loading={isLoading}
          size="small"
        >
          <div className="form-grid-2">
            <Form.Item label={COMPANY_POLICY_LABEL.IS_HALF_DAY_LATE}>
              <Controller
                name="isHalfDayLateOn"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )}
              />
            </Form.Item>

            <Form.Item
              label={COMPANY_POLICY_LABEL.HALF_DAY_THRESHOLD}
              validateStatus={errors.halfDayLateThresholdMinutes ? "error" : ""}
              help={errors.halfDayLateThresholdMinutes?.message}
            >
              <Controller
                name="halfDayLateThresholdMinutes"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    style={{ width: "100%" }}
                    disabled={!isHalfDayLateOn}
                    addonAfter="min"
                  />
                )}
              />
            </Form.Item>

            <Form.Item label={COMPANY_POLICY_LABEL.IS_WHOLE_DAY_LATE}>
              <Controller
                name="isWholeDayLateOn"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )}
              />
            </Form.Item>

            <Form.Item
              label={COMPANY_POLICY_LABEL.WHOLE_DAY_THRESHOLD}
              validateStatus={
                errors.wholeDayLateThresholdMinutes ? "error" : ""
              }
              help={errors.wholeDayLateThresholdMinutes?.message}
            >
              <Controller
                name="wholeDayLateThresholdMinutes"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    style={{ width: "100%" }}
                    disabled={!isWholeDayLateOn}
                    addonAfter="min"
                  />
                )}
              />
            </Form.Item>
          </div>
        </Card>

        {/* Night Differential */}
        <Card
          title={COMPANY_POLICY_LABEL.SECTION_NIGHT_DIFF}
          loading={isLoading}
          size="small"
        >
          <div className="form-grid-2">
            <Form.Item
              label={COMPANY_POLICY_LABEL.NIGHT_DIFF_THRESHOLD}
              validateStatus={errors.nightDiffThreshold ? "error" : ""}
              help={errors.nightDiffThreshold?.message}
            >
              <Controller
                name="nightDiffThreshold"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    style={{ width: "100%" }}
                    addonAfter="min"
                  />
                )}
              />
            </Form.Item>

            <Form.Item label={COMPANY_POLICY_LABEL.TREAT_NDOT_AS_ND}>
              <Controller
                name="treatNdotAsNdOnly"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )}
              />
            </Form.Item>
          </div>
        </Card>

        {/* Attendance Rules */}
        <Card
          title={COMPANY_POLICY_LABEL.SECTION_ATTENDANCE_RULES}
          loading={isLoading}
          size="small"
        >
          <div className="form-grid-2">
            <Form.Item
              label={COMPANY_POLICY_LABEL.TIME_IN_ALLOWANCE}
              validateStatus={errors.timeInAllowance ? "error" : ""}
              help={errors.timeInAllowance?.message}
              extra="Applies to Fixed shift schedules only — Flexi and broken shifts have no shift-start time to measure against."
            >
              <Controller
                name="timeInAllowance"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: "100%" }}
                    addonAfter="min"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={COMPANY_POLICY_LABEL.DOUBLE_PUNCH_GAP}
              validateStatus={errors.doublePunchGap ? "error" : ""}
              help={errors.doublePunchGap?.message}
            >
              <Controller
                name="doublePunchGap"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    style={{ width: "100%" }}
                    addonAfter="min"
                  />
                )}
              />
            </Form.Item>
          </div>
        </Card>

        {/* Holiday */}
        <Card
          title={COMPANY_POLICY_LABEL.SECTION_HOLIDAY}
          loading={isLoading}
          size="small"
        >
          <div className="form-grid-2">
            <Form.Item
              label={COMPANY_POLICY_LABEL.HOLIDAY_TIME_BASIS}
              validateStatus={errors.holidayTimeBasis ? "error" : ""}
              help={errors.holidayTimeBasis?.message}
            >
              <Controller
                name="holidayTimeBasis"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={HOLIDAY_TIME_BASIS_OPTIONS}
                    placeholder="Select holiday hours basis"
                  />
                )}
              />
            </Form.Item>

            <Form.Item label={COMPANY_POLICY_LABEL.WAIVE_PRIOR_DAY_REQUIREMENT}>
              <Controller
                name="waivePriorDayRequirement"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )}
              />
            </Form.Item>

            <Form.Item label={COMPANY_POLICY_LABEL.CHECK_AFTER_HOLIDAY}>
              <Controller
                name="checkAfterHoliday"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )}
              />
            </Form.Item>
          </div>
        </Card>

        {/* Cross-Month Cutoff Credit Policies */}
        <Card
          title={COMPANY_POLICY_LABEL.SECTION_STATUTORY}
          loading={isLoading}
          size="small"
        >
          <div className="form-grid-2">
            <Form.Item
              label={COMPANY_POLICY_LABEL.CROSS_MONTH_STATUTORY_CREDIT_POLICY}
              validateStatus={
                errors.crossMonthStatutoryCreditPolicy ? "error" : ""
              }
              help={errors.crossMonthStatutoryCreditPolicy?.message}
            >
              <Controller
                name="crossMonthStatutoryCreditPolicy"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={CROSS_MONTH_STATUTORY_CREDIT_POLICY_OPTIONS}
                    placeholder="Select credit month policy"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={COMPANY_POLICY_LABEL.WTAX_CROSS_MONTH_CREDIT_POLICY}
              validateStatus={errors.wTaxCrossMonthCreditPolicy ? "error" : ""}
              help={errors.wTaxCrossMonthCreditPolicy?.message}
            >
              <Controller
                name="wTaxCrossMonthCreditPolicy"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={CROSS_MONTH_STATUTORY_CREDIT_POLICY_OPTIONS}
                    placeholder="Select credit month policy"
                  />
                )}
              />
            </Form.Item>
          </div>
        </Card>
      </div>

      <div className="form-action-footer">
        <Space className="form-action-footer-row">
          <Button type="primary" htmlType="submit" loading={isPending}>
            Save Settings
          </Button>
        </Space>
      </div>
    </Form>
  );
}

export default function CompanyPolicy() {
  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {COMPANY_POLICY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {COMPANY_POLICY_LABEL.SUBTITLE}
            </p>
          </div>
        </div>
      </div>

      <Tabs
        type="card"
        items={[
          {
            key: "company-info",
            label: COMPANY_POLICY_LABEL.TAB_COMPANY_INFO,
            forceRender: true,
            children: <CompanyInfoTab />,
          },
          {
            key: "general",
            label: COMPANY_POLICY_LABEL.TAB_GENERAL,
            forceRender: true,
            children: <GeneralPolicyTab />,
          },
          {
            key: "fixed-salary-defaults",
            label: COMPANY_POLICY_LABEL.TAB_FIXED_SALARY_DEFAULTS,
            forceRender: true,
            children: <FixedSalaryDefaultsTab />,
          },
        ]}
      />
    </div>
  );
}
