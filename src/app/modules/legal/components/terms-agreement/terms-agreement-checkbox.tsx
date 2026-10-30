import { Checkbox, Typography } from "antd";
import { TERMS_LABEL } from "../../constants/label.const";

const { Text } = Typography;

interface TermsAgreementCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Agreeing for a company (creating one): adds the authority statement. */
  onBehalfOfCompany?: boolean;
  error?: string;
}

/** The "I agree to the Terms of Service" box on sign-up and company setup. The link opens the Terms in a new tab. */
export function TermsAgreementCheckbox({
  checked,
  onChange,
  onBehalfOfCompany,
  error,
}: TermsAgreementCheckboxProps) {
  return (
    <div className="mb-4">
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)}>
        {TERMS_LABEL.AGREE_PREFIX}{" "}
        <a href="/terms" target="_blank" rel="noreferrer">
          {TERMS_LABEL.AGREE_LINK}
        </a>
        {onBehalfOfCompany
          ? TERMS_LABEL.AGREE_COMPANY_SUFFIX
          : TERMS_LABEL.AGREE_SUFFIX}
      </Checkbox>
      {error && (
        <div>
          <Text type="danger">{error}</Text>
        </div>
      )}
    </div>
  );
}
