import { useEffect } from "react";
import { apiErrorBody, apiErrorMessage } from "@/core/http/api-error";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  notification,
} from "antd";
import { useForm, useWatch, Controller } from "react-hook-form";
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
import {
  COMPANY_POLICY_LABEL,
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_EMPLOYEE_ID_PADDING,
  DEFAULT_REST_DAYS,
  EMPLOYEE_ID_MODE_OPTIONS,
  formatEmployeeId,
  DEFAULT_TIME_ZONE,
  EMPLOYER_TYPE_OPTIONS,
  TIME_ZONE_OPTIONS,
  WEEKDAY_OPTIONS,
} from "../../constants/label.const";
import { authStorage } from "@/core/auth/auth-storage";
import { ImageUpload } from "@/shared/components/image-upload/image-upload";
import { CompanyClassificationFields } from "@/shared/components/company-classification-fields/company-classification-fields";
import { CLASSIFICATION_LABEL } from "@/shared/industry/constants/classification.const";
import { BankOutlined } from "@ant-design/icons";
import { useHasPermission } from "@/shared/hooks/use-has-permission";

// The reason the API gave for refusing the save (its ProblemDetails "detail", or a plain string),
// so the notification says what to fix rather than only that it failed.
function serverMessage(err: unknown, fallback: string): string {
  const message = apiErrorBody(err)?.message;
  return apiErrorMessage(
    err,
    message && message !== "Error" ? message : fallback,
  );
}

// The API sends ISO date-times; a date input wants yyyy-MM-dd.
const toDateInput = (value?: string | null) =>
  value ? value.slice(0, 10) : "";

export default function CompanyInfoTab() {
  const { data: company, isLoading } = useCompanyInfo();
  const { mutateAsync: update, isPending } = useUpdateCompanyInfo();
  // No right to change these settings (or a closed company): every field locked, no Save.
  const readOnly = !useHasPermission("Organization Setup:Edit");
  const { mutateAsync: uploadLogo } = useUploadCompanyLogo();
  const { mutateAsync: removeLogo } = useRemoveCompanyLogo();
  // Same gate as the logo endpoints (Organization Setup:Edit).
  const canEditLogo = useHasPermission("Organization Setup:Edit");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
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
      industryCode: "",
      subIndustryCode: "",
      businessType: "",
      companySize: "",
      registeredName: "",
      website: "",
      barangay: "",
      city: "",
      province: "",
      zipCode: "",
      country: DEFAULT_COUNTRY,
      secondaryPhone: "",
      hrContactName: "",
      hrContactEmail: "",
      hrContactPhone: "",
      payrollContactName: "",
      payrollContactEmail: "",
      payrollContactPhone: "",
      showLetterhead: true,
      employeeIdMode: "Off",
      employeeIdPrefix: "",
      employeeIdPadding: DEFAULT_EMPLOYEE_ID_PADDING,
      employeeIdIncludeYear: false,
      employerType: "private",
      isWithholdingAgent: false,
      atcCode: "",
      tinBranchCode: "",
      sssBranchCode: "",
      philHealthBranchCode: "",
      pagIbigBranchCode: "",
      secDtiNumber: "",
      registrationDate: "",
      businessPermitNo: "",
      businessPermitExpiry: "",
      payslipFooter: "",
      timeZone: DEFAULT_TIME_ZONE,
      currency: DEFAULT_CURRENCY,
      workWeekRestDays: DEFAULT_REST_DAYS,
    },
  });
  const [industryCode, subIndustryCode, businessType, companySize] = useWatch({
    control,
    name: ["industryCode", "subIndustryCode", "businessType", "companySize"],
  });
  const [idMode, idPrefix, idPadding, idIncludeYear] = useWatch({
    control,
    name: [
      "employeeIdMode",
      "employeeIdPrefix",
      "employeeIdPadding",
      "employeeIdIncludeYear",
    ],
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
      industryCode: company.industryCode ?? "",
      subIndustryCode: company.subIndustryCode ?? "",
      businessType: company.businessType ?? "",
      companySize: company.companySize ?? "",
      registeredName: company.registeredName ?? "",
      website: company.website ?? "",
      barangay: company.barangay ?? "",
      city: company.city ?? "",
      province: company.province ?? "",
      zipCode: company.zipCode ?? "",
      // Companies saved before these existed come back empty: show the Philippine defaults.
      country: company.country || DEFAULT_COUNTRY,
      secondaryPhone: company.secondaryPhone ?? "",
      hrContactName: company.hrContactName ?? "",
      hrContactEmail: company.hrContactEmail ?? "",
      hrContactPhone: company.hrContactPhone ?? "",
      payrollContactName: company.payrollContactName ?? "",
      payrollContactEmail: company.payrollContactEmail ?? "",
      payrollContactPhone: company.payrollContactPhone ?? "",
      showLetterhead: company.showLetterhead ?? true,
      employeeIdMode: company.employeeIdMode === "Auto" ? "Auto" : "Off",
      employeeIdPrefix: company.employeeIdPrefix ?? "",
      employeeIdPadding:
        company.employeeIdPadding || DEFAULT_EMPLOYEE_ID_PADDING,
      employeeIdIncludeYear: company.employeeIdIncludeYear ?? false,
      employerType: company.employerType || "private",
      isWithholdingAgent: company.isWithholdingAgent ?? false,
      atcCode: company.atcCode ?? "",
      tinBranchCode: company.tinBranchCode ?? "",
      sssBranchCode: company.sssBranchCode ?? "",
      philHealthBranchCode: company.philHealthBranchCode ?? "",
      pagIbigBranchCode: company.pagIbigBranchCode ?? "",
      secDtiNumber: company.secDtiNumber ?? "",
      registrationDate: toDateInput(company.registrationDate),
      businessPermitNo: company.businessPermitNo ?? "",
      businessPermitExpiry: toDateInput(company.businessPermitExpiry),
      payslipFooter: company.payslipFooter ?? "",
      timeZone: company.timeZone || DEFAULT_TIME_ZONE,
      currency: company.currency || DEFAULT_CURRENCY,
      workWeekRestDays: company.workWeekRestDays
        ? company.workWeekRestDays.split(",")
        : DEFAULT_REST_DAYS,
    });
  }, [company, reset]);

  // A plain text input bound to one of the form's string fields.
  const textField = (
    name: Exclude<
      keyof CompanyInfoFormValues,
      | "workWeekRestDays"
      | "isWithholdingAgent"
      | "showLetterhead"
      | "employeeIdMode"
      | "employeeIdPadding"
      | "employeeIdIncludeYear"
    >,
    label: string,
    placeholder?: string,
    wide?: boolean,
    type?: "date",
  ) => (
    <Form.Item
      label={label}
      validateStatus={errors[name] ? "error" : ""}
      help={errors[name]?.message}
      className={wide ? "sm:col-span-2" : undefined}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type={type}
            value={field.value ?? ""}
            placeholder={placeholder}
          />
        )}
      />
    </Form.Item>
  );

  const onSubmit = async (values: CompanyInfoFormValues) => {
    try {
      await update({
        ...values,
        email: values.email ?? "",
        workWeekRestDays: (values.workWeekRestDays ?? []).join(","),
        // An empty date input clears the date.
        registrationDate: values.registrationDate || null,
        businessPermitExpiry: values.businessPermitExpiry || null,
      });
      notification.success({
        message: "Company info saved",
        description: "Report headers will now use this company info.",
        placement: "topRight",
      });
    } catch (err) {
      notification.error({
        message: "Save failed",
        description: serverMessage(
          err,
          "Failed to update company info. Please try again.",
        ),
        placement: "topRight",
      });
    }
  };

  return (
    <Form
      disabled={readOnly}
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

          {textField(
            "registeredName",
            COMPANY_POLICY_LABEL.REGISTERED_NAME,
            "As registered with SEC / DTI",
            true,
          )}

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

          {textField(
            "secondaryPhone",
            COMPANY_POLICY_LABEL.SECONDARY_PHONE,
            "Landline or second number",
          )}
          {textField(
            "website",
            COMPANY_POLICY_LABEL.WEBSITE,
            "https://www.example.com",
          )}
        </div>
      </Card>

      <Card
        title={COMPANY_POLICY_LABEL.SECTION_ADDRESS}
        loading={isLoading}
        size="small"
        className="mt-4"
      >
        <div className="form-grid-2">
          {textField(
            "address",
            COMPANY_POLICY_LABEL.ADDRESS_LINE,
            "Building, street, unit",
            true,
          )}
          {textField("barangay", COMPANY_POLICY_LABEL.BARANGAY)}
          {textField("city", COMPANY_POLICY_LABEL.CITY)}
          {textField("province", COMPANY_POLICY_LABEL.PROVINCE)}
          {textField("zipCode", COMPANY_POLICY_LABEL.ZIP_CODE)}
          <Form.Item label={COMPANY_POLICY_LABEL.COUNTRY}>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  options={COUNTRY_OPTIONS}
                />
              )}
            />
          </Form.Item>
        </div>
      </Card>

      <Card
        title={CLASSIFICATION_LABEL.SECTION_CLASSIFICATION}
        loading={isLoading}
        size="small"
        className="mt-4"
      >
        <div className="form-grid-2">
          <CompanyClassificationFields
            value={{ industryCode, subIndustryCode, businessType, companySize }}
            onChange={(next) => {
              const options = { shouldDirty: true };
              setValue("industryCode", next.industryCode ?? "", options);
              setValue("subIndustryCode", next.subIndustryCode ?? "", options);
              setValue("businessType", next.businessType ?? "", options);
              setValue("companySize", next.companySize ?? "", options);
            }}
          />
        </div>
      </Card>

      <Card
        title={COMPANY_POLICY_LABEL.SECTION_CONTACTS}
        loading={isLoading}
        size="small"
        className="mt-4"
      >
        <div className="form-grid-2">
          {textField("hrContactName", COMPANY_POLICY_LABEL.HR_CONTACT_NAME)}
          {textField("hrContactEmail", COMPANY_POLICY_LABEL.HR_CONTACT_EMAIL)}
          {textField("hrContactPhone", COMPANY_POLICY_LABEL.HR_CONTACT_PHONE)}
          <div className="hidden sm:block" />
          {textField(
            "payrollContactName",
            COMPANY_POLICY_LABEL.PAYROLL_CONTACT_NAME,
          )}
          {textField(
            "payrollContactEmail",
            COMPANY_POLICY_LABEL.PAYROLL_CONTACT_EMAIL,
          )}
          {textField(
            "payrollContactPhone",
            COMPANY_POLICY_LABEL.PAYROLL_CONTACT_PHONE,
          )}
        </div>
      </Card>

      <Card
        title={COMPANY_POLICY_LABEL.SECTION_REGIONAL}
        loading={isLoading}
        size="small"
        className="mt-4"
      >
        <div className="form-grid-2">
          <Form.Item
            label={COMPANY_POLICY_LABEL.TIME_ZONE}
            extra={COMPANY_POLICY_LABEL.TIME_ZONE_HELP}
          >
            <Controller
              name="timeZone"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  disabled
                  value={field.value || undefined}
                  options={TIME_ZONE_OPTIONS}
                />
              )}
            />
          </Form.Item>

          <Form.Item label={COMPANY_POLICY_LABEL.CURRENCY}>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  options={CURRENCY_OPTIONS}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={COMPANY_POLICY_LABEL.REST_DAYS}
            extra={COMPANY_POLICY_LABEL.REST_DAYS_HELP}
            className="sm:col-span-2"
          >
            <Controller
              name="workWeekRestDays"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  mode="multiple"
                  value={field.value ?? []}
                  options={WEEKDAY_OPTIONS}
                />
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

      <Card
        title={COMPANY_POLICY_LABEL.SECTION_EMPLOYEE_ID}
        loading={isLoading}
        size="small"
        className="mt-4"
      >
        <div className="form-grid-2">
          <Form.Item
            label={COMPANY_POLICY_LABEL.EMPLOYEE_ID_MODE}
            extra={COMPANY_POLICY_LABEL.EMPLOYEE_ID_MODE_HELP}
            className="sm:col-span-2"
          >
            <Controller
              name="employeeIdMode"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value ?? "Off"}
                  options={EMPLOYEE_ID_MODE_OPTIONS}
                />
              )}
            />
          </Form.Item>

          {idMode === "Auto" && (
            <>
              {textField(
                "employeeIdPrefix",
                COMPANY_POLICY_LABEL.EMPLOYEE_ID_PREFIX,
                "e.g. EMP",
              )}
              <Form.Item label={COMPANY_POLICY_LABEL.EMPLOYEE_ID_PADDING}>
                <Controller
                  name="employeeIdPadding"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      className="w-full"
                      min={1}
                      max={8}
                      precision={0}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item className="sm:col-span-2">
                <Controller
                  name="employeeIdIncludeYear"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    >
                      {COMPANY_POLICY_LABEL.EMPLOYEE_ID_INCLUDE_YEAR}
                    </Checkbox>
                  )}
                />
              </Form.Item>
              <p className="sm:col-span-2 text-xs text-gray-500">
                {COMPANY_POLICY_LABEL.EMPLOYEE_ID_NEXT}:{" "}
                <strong>
                  {formatEmployeeId(
                    idPrefix ?? "",
                    idPadding ?? DEFAULT_EMPLOYEE_ID_PADDING,
                    idIncludeYear ?? false,
                    company?.nextEmployeeNo ?? 1,
                  )}
                </strong>
              </p>
            </>
          )}
        </div>
      </Card>

      <Card
        title={COMPANY_POLICY_LABEL.SECTION_BIR}
        loading={isLoading}
        size="small"
        className="mt-4"
      >
        <div className="form-grid-2">
          <Form.Item label={COMPANY_POLICY_LABEL.EMPLOYER_TYPE}>
            <Controller
              name="employerType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  options={EMPLOYER_TYPE_OPTIONS}
                />
              )}
            />
          </Form.Item>
          {textField("atcCode", COMPANY_POLICY_LABEL.ATC_CODE, "e.g. WC010")}
          <Form.Item className="sm:col-span-2">
            <Controller
              name="isWithholdingAgent"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  {COMPANY_POLICY_LABEL.IS_WITHHOLDING_AGENT}
                </Checkbox>
              )}
            />
          </Form.Item>
          {textField("tinBranchCode", COMPANY_POLICY_LABEL.TIN_BRANCH_CODE)}
          {textField("sssBranchCode", COMPANY_POLICY_LABEL.SSS_BRANCH_CODE)}
          {textField(
            "philHealthBranchCode",
            COMPANY_POLICY_LABEL.PHILHEALTH_BRANCH_CODE,
          )}
          {textField(
            "pagIbigBranchCode",
            COMPANY_POLICY_LABEL.PAGIBIG_BRANCH_CODE,
          )}
          {textField("secDtiNumber", COMPANY_POLICY_LABEL.SEC_DTI_NUMBER)}
          {textField(
            "registrationDate",
            COMPANY_POLICY_LABEL.REGISTRATION_DATE,
            undefined,
            false,
            "date",
          )}
          {textField(
            "businessPermitNo",
            COMPANY_POLICY_LABEL.BUSINESS_PERMIT_NO,
          )}
          {textField(
            "businessPermitExpiry",
            COMPANY_POLICY_LABEL.BUSINESS_PERMIT_EXPIRY,
            undefined,
            false,
            "date",
          )}
        </div>
      </Card>

      <Card
        title={COMPANY_POLICY_LABEL.SECTION_PAYSLIP}
        loading={isLoading}
        size="small"
        className="mt-4"
      >
        <Form.Item extra={COMPANY_POLICY_LABEL.SHOW_LETTERHEAD_HELP}>
          <Controller
            name="showLetterhead"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value ?? true}
                onChange={(e) => field.onChange(e.target.checked)}
              >
                {COMPANY_POLICY_LABEL.SHOW_LETTERHEAD}
              </Checkbox>
            )}
          />
        </Form.Item>

        <Form.Item
          label={COMPANY_POLICY_LABEL.PAYSLIP_FOOTER}
          extra={COMPANY_POLICY_LABEL.PAYSLIP_FOOTER_HELP}
          validateStatus={errors.payslipFooter ? "error" : ""}
          help={errors.payslipFooter?.message}
        >
          <Controller
            name="payslipFooter"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                value={field.value ?? ""}
                rows={2}
                maxLength={500}
                showCount
              />
            )}
          />
        </Form.Item>
      </Card>

      <div className="form-action-footer">
        <Space className="form-action-footer-row">
          {!readOnly && (
            <Button type="primary" htmlType="submit" loading={isPending}>
              Save Settings
            </Button>
          )}
        </Space>
      </div>
    </Form>
  );
}
