import { useMemo } from "react";
import { Drawer, Grid, Progress, Tag, Tooltip, Typography } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { FREQUENCY_LABEL } from "@/app/modules/applications/deduction-application/constants/label.const";
import type { DeductionApplicationResponse } from "@/app/modules/applications/deduction-application/models/api/response/deduction-application-response.model";
import {
  LEDGER_STATE_COLOR,
  LEDGER_STATE_LABEL,
  PORTAL_DEDUCTIONS_LABEL,
} from "../../constants/label.const";
import {
  buildLedgerRows,
  summarizeLoan,
  toLocalDate,
} from "../../utils/deduction-ledger.util";
import { formatPeso } from "../../utils/format.util";

const { Text } = Typography;

const formatDate = (v: string) => (v ? dayjs(v).format("MMM DD, YYYY") : "—");

interface Props {
  loan: DeductionApplicationResponse | null;
  name: string;
  onClose: () => void;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export function DeductionLedgerDrawer({ loan, name, onClose }: Props) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const summary = useMemo(() => (loan ? summarizeLoan(loan) : null), [loan]);
  const rows = useMemo(() => (loan ? buildLedgerRows(loan) : []), [loan]);
  const percent = summary?.totalCount
    ? Math.round((summary.paidCount / summary.totalCount) * 100)
    : 0;

  return (
    <Drawer
      open={!!loan}
      onClose={onClose}
      title={name}
      placement={isMobile ? "bottom" : "right"}
      size={isMobile ? "85vh" : 520}
      destroyOnHidden
    >
      {loan && summary && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <Text type="secondary">Remaining balance</Text>
            <div className="text-3xl font-semibold text-(--ant-color-primary)">
              {formatPeso(summary.balance)}
            </div>
            <Progress
              percent={percent}
              size="small"
              className="mb-0!"
              format={() => `${summary.paidCount}/${summary.totalCount}`}
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Fact label="Total amount" value={formatPeso(loan.totalAmount)} />
              <Fact
                label="Paid so far"
                value={formatPeso(summary.paidAmount)}
              />
              <Fact label="Principal" value={formatPeso(loan.totalPrincipal)} />
              <Fact
                label="Interest rate"
                value={`${loan.interestRate ?? 0}%`}
              />
              <Fact
                label="Frequency"
                value={
                  FREQUENCY_LABEL[loan.frequencyOfPayment] ??
                  loan.frequencyOfPayment
                }
              />
              <Fact
                label="Period"
                value={`${formatDate(toLocalDate(loan.startDate))} – ${formatDate(toLocalDate(loan.endDate))}`}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 font-medium">
              {PORTAL_DEDUCTIONS_LABEL.LEDGER_TITLE}
            </div>
            <ul className="m-0 flex list-none flex-col p-0">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className={`flex items-center justify-between gap-3 border-b border-gray-100 px-2 py-3 last:border-b-0 ${
                    r.state === "next" ? "rounded-md bg-blue-50" : ""
                  } ${r.state === "paid" ? "text-gray-500" : ""}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {r.state === "paid" && (
                        <CheckCircleFilled className="text-green-500" />
                      )}
                      Installment {r.installment} of {rows.length}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(r.date)}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Tag
                        color={LEDGER_STATE_COLOR[r.state]}
                        className="mr-0!"
                      >
                        {LEDGER_STATE_LABEL[r.state]}
                      </Tag>
                      {r.isDeferred && (
                        <Tag color="gold" className="mr-0!">
                          Deferred
                        </Tag>
                      )}
                      {r.note && (
                        <Tooltip title={r.note}>
                          <Tag className="mr-0! max-w-40 truncate">
                            {r.note}
                          </Tag>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold">
                      −{formatPeso(r.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Bal. {formatPeso(r.balance)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Drawer>
  );
}
