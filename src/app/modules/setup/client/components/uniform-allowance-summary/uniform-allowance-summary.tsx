import { Alert } from "antd";
import {
  describeUniformAllowancePolicy,
  type UniformAllowancePolicyRules,
} from "../../utils/describe-uniform-allowance-policy";

interface UniformAllowanceSummaryProps {
  policy: UniformAllowancePolicyRules;
  /** Show only the headline (e.g. in a table row). */
  compact?: boolean;
  className?: string;
}

/**
 * What a uniform allowance policy does, in plain language -- the same wording in Client Settings,
 * the ledger and the employee portal.
 */
export default function UniformAllowanceSummary({
  policy,
  compact,
  className,
}: UniformAllowanceSummaryProps) {
  const { headline, details } = describeUniformAllowancePolicy(policy);
  return (
    <Alert
      type={policy.isEnabled ? "info" : "warning"}
      showIcon
      className={className}
      message={headline}
      description={
        compact || details.length === 0 ? undefined : (
          <ul className="m-0 pl-4 text-[13px]">
            {details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )
      }
    />
  );
}
