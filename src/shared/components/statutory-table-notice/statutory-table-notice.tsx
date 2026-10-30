import { Alert } from "antd";
import { TermsLink } from "@/app/modules/legal/components/terms-link";

/**
 * On every statutory table page (SSS, PhilHealth, Pag-IBIG, withholding tax): the company keeps
 * these tables current itself, as the Terms of Service (Section 5) say.
 */
export function StatutoryTableNotice() {
  return (
    <Alert
      className="mb-4"
      type="info"
      showIcon
      message="Your company maintains this table. When the government issues new rates, add the new brackets from the date they take effect."
      description={
        <TermsLink section={5}>See Terms of Service, Section 5</TermsLink>
      }
    />
  );
}
