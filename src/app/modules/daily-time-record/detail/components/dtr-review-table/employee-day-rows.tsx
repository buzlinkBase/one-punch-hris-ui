import { useMemo } from "react";
import { Alert, Button } from "antd";
import DtrDetailTable from "../dtr-detail-table";
import { useDtrDetailRecords } from "../../hooks/use-dtr-detail-queries";
import type { DtrDetailFilter } from "../../models/api/request/dtr-detail-filter.model";
import type { EmployeeDtrSummary } from "../../utils/dtr-coverage.util";

interface Props {
  summary: EmployeeDtrSummary;
  // What the DTR was generated from; narrowed here to the one employee.
  filter: DtrDetailFilter;
  // Re-read the summaries after a row action (change shift, rest day...).
  onChanged?: () => void;
}

// One employee's day rows, loaded only once their row is expanded: the review table itself carries
// summaries, so a company with thousands of employees never downloads every day up front.
export default function EmployeeDayRows({ summary, filter, onChanged }: Props) {
  const employeeFilter = useMemo(
    () => ({ ...filter, employeeId: summary.employeeId }),
    [filter, summary.employeeId],
  );
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useDtrDetailRecords(employeeFilter);
  const saved = useMemo(
    () => new Set(summary.savedDates),
    [summary.savedDates],
  );

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Couldn't load this employee's days."
        action={
          <Button size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <DtrDetailTable
      data={data}
      loading={isLoading}
      isRowLocked={(r) => saved.has(r.workDate.slice(0, 10))}
      onChanged={() => {
        void refetch();
        onChanged?.();
      }}
      dateFrom={filter.fromDate}
      dateTo={filter.toDate}
    />
  );
}
