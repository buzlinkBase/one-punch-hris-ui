import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Typography,
} from "antd";
import { RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useMyLoanApplications } from "../../../shared/hooks/use-my-employee-queries";
import { useDeductions } from "@/app/modules/setup/deduction/hooks/use-deduction-queries";
import { FREQUENCY_LABEL } from "@/app/modules/applications/deduction-application/constants/label.const";
import { PORTAL_DEDUCTIONS_LABEL } from "../../constants/label.const";
import {
  isActiveLoan,
  summarizeLoan,
  toLocalDate,
} from "../../utils/deduction-ledger.util";
import { formatPeso } from "../../utils/format.util";
import { DeductionLedgerDrawer } from "../../components/deduction-ledger-drawer/deduction-ledger-drawer";

const { Title, Text } = Typography;

export default function PortalDeductions() {
  const {
    data: loans = [],
    isLoading,
    isError,
    refetch,
  } = useMyLoanApplications();
  const { data: rawDeductions = [] } = useDeductions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nameMap = useMemo(
    () => Object.fromEntries(rawDeductions.map((d) => [d.id, d.name])),
    [rawDeductions],
  );

  const active = useMemo(
    () => loans.filter(isActiveLoan).map(summarizeLoan),
    [loans],
  );

  const totalBalance = active.reduce((sum, s) => sum + s.balance, 0);
  const nextDue = active
    .filter((s) => s.next)
    .sort((a, b) => a.next!.date.localeCompare(b.next!.date))[0]?.next;

  const selected = loans.find((l) => l.id === selectedId) ?? null;
  const nameOf = (deductionId: string) => nameMap[deductionId] ?? "Deduction";

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {PORTAL_DEDUCTIONS_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {PORTAL_DEDUCTIONS_LABEL.SUBTITLE}
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        {isLoading ? (
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        ) : isError ? (
          <Card>
            <Empty description="Couldn't load your deductions.">
              <Button onClick={() => refetch()}>Retry</Button>
            </Empty>
          </Card>
        ) : active.length === 0 ? (
          <Card>
            <Empty
              description={
                <div>
                  <div>{PORTAL_DEDUCTIONS_LABEL.EMPTY}</div>
                  <Text type="secondary">
                    {PORTAL_DEDUCTIONS_LABEL.EMPTY_HINT}
                  </Text>
                </div>
              }
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic title="Active deductions" value={active.length} />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total outstanding"
                    value={formatPeso(totalBalance)}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Next deduction"
                    value={nextDue ? formatPeso(nextDue.amount) : "—"}
                    suffix={
                      nextDue ? (
                        <span className="text-sm text-gray-500">
                          {dayjs(toLocalDate(nextDue.date)).format("MMM DD")}
                        </span>
                      ) : null
                    }
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              {active.map((s) => (
                <Col key={s.loan.id} xs={24} lg={12}>
                  <Card>
                    <button
                      type="button"
                      onClick={() => setSelectedId(s.loan.id)}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent p-0 text-left text-base font-semibold text-(--ant-color-primary) hover:underline"
                    >
                      {nameOf(s.loan.deductionId)}
                      <RightOutlined className="text-xs" />
                    </button>
                    <div className="my-2 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Balance</div>
                        <div className="text-xl font-semibold">
                          {formatPeso(s.balance)}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>
                          {formatPeso(s.next?.amount ?? 0)} ·{" "}
                          {FREQUENCY_LABEL[s.loan.frequencyOfPayment] ??
                            s.loan.frequencyOfPayment}
                        </div>
                        {s.next && (
                          <div>
                            Next:{" "}
                            {dayjs(toLocalDate(s.next.date)).format(
                              "MMM DD, YYYY",
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Progress
                      percent={Math.round((s.paidCount / s.totalCount) * 100)}
                      size="small"
                      className="mb-0!"
                      format={() => `${s.paidCount}/${s.totalCount} paid`}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>

      <DeductionLedgerDrawer
        loan={selected}
        name={selected ? nameOf(selected.deductionId) : ""}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
