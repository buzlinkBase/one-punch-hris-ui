import { useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Space,
  Switch,
  Typography,
  notification,
} from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  payrollInclusionDefaultsFormSchema,
  type PayrollInclusionDefaultsFormValues,
} from "../../models/forms/payroll-inclusion-defaults-form.schema";
import {
  usePayrollInclusionDefaults,
  useUpdatePayrollInclusionDefaults,
} from "../../hooks/use-payroll-inclusion-defaults-queries";
import { COMPANY_POLICY_LABEL } from "../../constants/label.const";

const { Text } = Typography;

export default function FixedSalaryDefaultsTab() {
  const { data: defaults, isLoading } = usePayrollInclusionDefaults();
  const { mutateAsync: update, isPending } =
    useUpdatePayrollInclusionDefaults();

  const { control, handleSubmit, reset } =
    useForm<PayrollInclusionDefaultsFormValues>({
      resolver: zodResolver(payrollInclusionDefaultsFormSchema),
      defaultValues: {
        defaultRestDayPaid: false,
        defaultRegularHolidayIncluded: false,
        defaultSpecialNonWorkingIncluded: false,
        defaultNightDiffIncluded: false,
      },
    });

  useEffect(() => {
    if (defaults) {
      reset({
        defaultRestDayPaid: defaults.defaultRestDayPaid,
        defaultRegularHolidayIncluded: defaults.defaultRegularHolidayIncluded,
        defaultSpecialNonWorkingIncluded:
          defaults.defaultSpecialNonWorkingIncluded,
        defaultNightDiffIncluded: defaults.defaultNightDiffIncluded,
      });
    }
  }, [defaults, reset]);

  const onSubmit = async (values: PayrollInclusionDefaultsFormValues) => {
    try {
      await update(values);
      notification.success({
        message: "Defaults saved",
        description: "Fixed salary inclusion defaults have been updated.",
        placement: "topRight",
      });
    } catch {
      notification.error({
        message: "Save failed",
        description:
          "Failed to update fixed salary defaults. Please try again.",
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
      <Card
        title={COMPANY_POLICY_LABEL.SECTION_FIXED_SALARY_DEFAULTS}
        loading={isLoading}
        size="small"
      >
        <Text type="secondary" className="text-xs">
          {COMPANY_POLICY_LABEL.FIXED_SALARY_DEFAULTS_SUBTITLE}
        </Text>
        <div className="flex flex-col gap-2 mt-3 max-w-120">
          <div className="flex items-center justify-between">
            <span>{COMPANY_POLICY_LABEL.DEFAULT_REST_DAY_PAID}</span>
            <Controller
              name="defaultRestDayPaid"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>{COMPANY_POLICY_LABEL.DEFAULT_REGULAR_HOLIDAY_INCLUDED}</span>
            <Controller
              name="defaultRegularHolidayIncluded"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>
              {COMPANY_POLICY_LABEL.DEFAULT_SPECIAL_NON_WORKING_INCLUDED}
            </span>
            <Controller
              name="defaultSpecialNonWorkingIncluded"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>{COMPANY_POLICY_LABEL.DEFAULT_NIGHT_DIFF_INCLUDED}</span>
            <Controller
              name="defaultNightDiffIncluded"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>
      </Card>

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
