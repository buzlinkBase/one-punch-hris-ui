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
  useRemoveCompanyLogo,
  useUpdateCompanyInfo,
  useUploadCompanyLogo,
} from "../../hooks/use-company-info-queries";
import { COMPANY_POLICY_LABEL } from "../../constants/label.const";
import { authStorage } from "@/core/auth/auth-storage";
import { ImageUpload } from "@/shared/components/image-upload/image-upload";
import { BankOutlined } from "@ant-design/icons";

export default function CompanyInfoTab() {
  const { data: company, isLoading } = useCompanyInfo();
  const { mutateAsync: update, isPending } = useUpdateCompanyInfo();
  const { mutateAsync: uploadLogo } = useUploadCompanyLogo();
  const { mutateAsync: removeLogo } = useRemoveCompanyLogo();
  // Same gate as the logo endpoints (Organization Setup:Edit).
  const canEditLogo = authStorage.hasAnyPermission("Organization Setup:Edit");

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
      rdoCode: "",
      sssNumber: "",
      philHealthNumber: "",
      pagIbigNumber: "",
      authorizedSignatoryName: "",
      authorizedSignatoryTitle: "",
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
      rdoCode: company.rdoCode ?? "",
      sssNumber: company.sssNumber ?? "",
      philHealthNumber: company.philHealthNumber ?? "",
      pagIbigNumber: company.pagIbigNumber ?? "",
      authorizedSignatoryName: company.authorizedSignatoryName ?? "",
      authorizedSignatoryTitle: company.authorizedSignatoryTitle ?? "",
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
        <Form.Item label={COMPANY_POLICY_LABEL.LOGO}>
          <ImageUpload
            label="logo"
            shape="square"
            crop="logo"
            value={company?.logoUrl}
            placeholder={<BankOutlined />}
            onUpload={(file) => uploadLogo(file)}
            onRemove={() => removeLogo()}
            disabled={!canEditLogo}
            hint="PNG, JPG or WebP. You can crop it after choosing; it's resized automatically. A logo on a transparent or plain background looks best."
          />
        </Form.Item>
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

          <Form.Item label={COMPANY_POLICY_LABEL.RDO_CODE}>
            <Controller
              name="rdoCode"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. 044" />
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

      <Card
        title={COMPANY_POLICY_LABEL.SECTION_AGENCY_REGISTRATION}
        loading={isLoading}
        size="small"
        className="mt-4"
      >
        <p className="text-xs text-gray-500 mb-3">
          Printed on BIR/SSS/PhilHealth/Pag-IBIG report headers and the
          electronic remittance files generated under Payroll Reports.
        </p>
        <div className="form-grid-2">
          <Form.Item label={COMPANY_POLICY_LABEL.SSS_NUMBER}>
            <Controller
              name="sssNumber"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label={COMPANY_POLICY_LABEL.PHILHEALTH_NUMBER}>
            <Controller
              name="philHealthNumber"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label={COMPANY_POLICY_LABEL.PAGIBIG_NUMBER}>
            <Controller
              name="pagIbigNumber"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label={COMPANY_POLICY_LABEL.AUTHORIZED_SIGNATORY_NAME}>
            <Controller
              name="authorizedSignatoryName"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label={COMPANY_POLICY_LABEL.AUTHORIZED_SIGNATORY_TITLE}>
            <Controller
              name="authorizedSignatoryTitle"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. HR Manager" />
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
