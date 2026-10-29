import { Button, Tooltip } from "antd";
import type {
  PayrollRunResult,
  PayrollSourceItem,
} from "../../../models/api/response/payroll-run-result.model";
import { fmt, type BreakdownSpec } from "../utils/payroll-summary.util";

// The amount whose composition the breakdown popup shows.
export interface SourceView {
  row: PayrollRunResult;
  title: string;
  amount: number;
  items: PayrollSourceItem[];
}

export type OpenSource = (view: SourceView) => void;

// A group's total as a link to what it is made of -- each installment with its name and the date it
// was scheduled -- when the saved run carries those lines for it; plain money otherwise (runs saved
// before itemizing, or a group that has none).
export const totalCell = (
  r: PayrollRunResult,
  spec: BreakdownSpec,
  title: string,
  onOpenSource?: OpenSource,
) => {
  const amount = spec.total(r);
  const items = spec.sourceKey ? r.savedSources?.[spec.sourceKey] : undefined;
  if (!onOpenSource || !items?.length || !amount) return fmt(amount);
  return (
    <Tooltip title={`See what ${title} is made of`}>
      <Button
        type="link"
        size="small"
        className="p-0 h-auto"
        onClick={() => onOpenSource({ row: r, title, amount, items })}
      >
        {fmt(amount)}
      </Button>
    </Tooltip>
  );
};
