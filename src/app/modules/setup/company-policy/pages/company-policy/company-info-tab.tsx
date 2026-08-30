import { useEffect } from "react";
import { Button, Card, Form, Input, Space, notification } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyInfoFormSchema,
  type CompanyInfoFormValues,
} from "../../models/forms/company-info-form.schema";
import {
  useCompanyInfo,
  useUpdateCompanyInfo,
} from "../../hooks/use-company-info-queries";
import { COMPANY_POLICY_LABEL } from "../../constants/label.const";
import { authStorage } from "@/core/auth/auth-storage";

export default function CompanyInfoTab() {
  const { data: company, isLoading } = useCompanyInfo();
  const { mutateAsync: update, isPending } = useUpdateCompanyInfo();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoFormSchema),
    defaultValues: {
      description: "",
      shortName: "",
      address: "",
      contact: "",
      email: "",
      tin: "",
    },
  });

  useEffect(() => {
    if (!company) return;
    reset({
      // Only ever pre-fills an empty saved name — never overwrites one the tenant
      // already set.
      description: company.description || authStorage.getTenantName() || "",
      shortName: company.shortName ?? "",
      address: company.address ?? "",
      contact: company.contact ?? "",
      email: company.email ?? "",
      tin: company.tin ?? "",
    });
  }, [company, reset]);

  const onSubmit = async (values: CompanyInfoFormValues) => {
    try {
      await update({ ...values, email: values.email ?? "" });
      notification.success({
        message: "Company info saved",
        description: "Report headers will now use this company info.",
        placement: "topRight",
      });
    } catch {
      notification.error({
        message: "Save failed",
        description: "Failed to update company info. Please try again.",
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
        title={COMPANY_POLICY_LABEL.SECTION_COMPANY_INFO}
        loading={isLoading}
        size="small"
      >
        <div className="form-grid-2">
          <Form.Item
            label={COMPANY_POLICY_LABEL.COMPANY_NAME}
            validateStatus={errors.description ? "error" : ""}
            help={errors.description?.message}
            className="sm:col-span-2"
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Company name" />
              )}
            />
          </Form.Item>

          <Form.Item label={COMPANY_POLICY_LABEL.TIN}>
            <Controller
              name="tin"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. 000-000-000-000" />
              )}
            />
          </Form.Item>

          <Form.Item
            label={COMPANY_POLICY_LABEL.ADDRESS}
            className="sm:col-span-2"
          >
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Company address" />
              )}
            />
          </Form.Item>

          <Form.Item label={COMPANY_POLICY_LABEL.CONTACT}>
            <Controller
              name="contact"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Contact number" />
              )}
            />
          </Form.Item>

          <Form.Item
            label={COMPANY_POLICY_LABEL.EMAIL}
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="company@example.com" />
              )}
            />
          </Form.Item>
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
