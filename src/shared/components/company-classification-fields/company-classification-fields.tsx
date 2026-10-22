import { useMemo } from "react";
import { Form, Select } from "antd";
import { useIndustries } from "@/shared/industry/hooks/use-industry-queries";
import {
  BUSINESS_TYPE_OPTIONS,
  CLASSIFICATION_LABEL,
  COMPANY_SIZE_OPTIONS,
} from "@/shared/industry/constants/classification.const";

export interface CompanyClassificationValue {
  industryCode?: string;
  subIndustryCode?: string;
  businessType?: string;
  companySize?: string;
}

interface Props {
  value: CompanyClassificationValue;
  onChange: (next: CompanyClassificationValue) => void;
  disabled?: boolean;
}

// Industry, sub-industry (limited to the chosen industry), business type and company size as
// four Form.Items -- drop it straight into a form grid. All optional; "" / undefined means none.
export function CompanyClassificationFields({
  value,
  onChange,
  disabled,
}: Props) {
  const { data: industries = [], isLoading } = useIndustries();

  const industryOptions = useMemo(
    () => industries.map((i) => ({ value: i.code, label: i.name })),
    [industries],
  );
  const subOptions = useMemo(
    () =>
      (
        industries.find((i) => i.code === value.industryCode)?.subIndustries ??
        []
      ).map((s) => ({ value: s.code, label: s.name })),
    [industries, value.industryCode],
  );

  const filterOption = (input: string, option?: { label: string }) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <>
      <Form.Item label={CLASSIFICATION_LABEL.INDUSTRY}>
        <Select
          showSearch
          allowClear
          loading={isLoading}
          disabled={disabled}
          placeholder="Select industry"
          options={industryOptions}
          filterOption={filterOption}
          value={value.industryCode || undefined}
          // Changing the industry drops the sub-industry: it belonged to the old one.
          onChange={(industryCode) =>
            onChange({
              ...value,
              industryCode: industryCode ?? "",
              subIndustryCode: "",
            })
          }
        />
      </Form.Item>

      <Form.Item label={CLASSIFICATION_LABEL.SUB_INDUSTRY}>
        <Select
          showSearch
          allowClear
          disabled={disabled || !value.industryCode}
          placeholder={
            value.industryCode
              ? "Select sub-industry"
              : CLASSIFICATION_LABEL.SELECT_INDUSTRY_FIRST
          }
          options={subOptions}
          filterOption={filterOption}
          value={value.subIndustryCode || undefined}
          onChange={(subIndustryCode) =>
            onChange({ ...value, subIndustryCode: subIndustryCode ?? "" })
          }
        />
      </Form.Item>

      <Form.Item label={CLASSIFICATION_LABEL.BUSINESS_TYPE}>
        <Select
          allowClear
          disabled={disabled}
          placeholder="Select business type"
          options={BUSINESS_TYPE_OPTIONS}
          value={value.businessType || undefined}
          onChange={(businessType) =>
            onChange({ ...value, businessType: businessType ?? "" })
          }
        />
      </Form.Item>

      <Form.Item label={CLASSIFICATION_LABEL.COMPANY_SIZE}>
        <Select
          allowClear
          disabled={disabled}
          placeholder="Select company size"
          options={COMPANY_SIZE_OPTIONS}
          value={value.companySize || undefined}
          onChange={(companySize) =>
            onChange({ ...value, companySize: companySize ?? "" })
          }
        />
      </Form.Item>
    </>
  );
}
