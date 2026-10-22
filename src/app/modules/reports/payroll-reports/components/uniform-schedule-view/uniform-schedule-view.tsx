import { Alert, Empty, Skeleton, Table, Timeline, Typography } from "antd";
import UniformAllowanceSummary from "@/app/modules/setup/client/components/uniform-allowance-summary/uniform-allowance-summary";
import type {
  UniformAllowanceCreditLog,
  UniformAllowanceSchedule,
} from "@/app/modules/setup/client/models/api/response/uniform-allowance-policy.model";
import {
  CREDIT_DECISION_COLUMNS,
  day,
  peso,
  period,
} from "./credit-decision-columns";

const { Text } = Typography;

interface UniformScheduleViewProps {
  schedule: UniformAllowanceSchedule | undefined;
  loading: boolean;
  /** Wording for the employee themself ("you") instead of HR ("this employee"). */
  selfView?: boolean;
}

/**
 * When and how one employee's uniform allowance is credited: the rules, the next credits (and
 * anything that would stop them), and recent decisions with the reason for each skip.
 */
export function UniformScheduleView({
  schedule,
  loading,
  selfView,
}: UniformScheduleViewProps) {
  if (loading || !schedule) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <div className="flex flex-col gap-4">
      {schedule.policy ? (
        <UniformAllowanceSummary policy={schedule.policy} />
      ) : (
        <Alert
          type="info"
          showIcon
          message={
            selfView
              ? "No uniform allowance applies to you."
              : "No uniform allowance applies to this employee (their client doesn't give one, or they have no client)."
          }
        />
      )}

      {schedule.separatedOn && (
        <Alert
          type="warning"
          showIcon
          message={`Separated on ${day(schedule.separatedOn)} — credits have stopped.`}
        />
      )}
      {schedule.serviceStartDate && (
        <Text type="secondary" className="text-[13px]">
          Service for uniform allowance counts from{" "}
          {day(schedule.serviceStartDate)}.
        </Text>
      )}

      <div>
        <Text strong className="block mb-3">
          Next credits
        </Text>
        {schedule.upcoming.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No credits scheduled"
          />
        ) : (
          <Timeline
            items={schedule.upcoming.map((u) => ({
              key: u.creditDate,
              color: u.blocker ? "gray" : "green",
              children: (
                <div className="text-[13px]">
                  <div className="font-medium">
                    {day(u.creditDate)}
                    {u.amount !== null && ` · ${peso(u.amount)}`}
                  </div>
                  <div className="text-(--ant-color-text-secondary)">
                    For {period(u.periodStart, u.periodEnd)}
                    {u.condition && ` — ${u.condition}`}
                  </div>
                  {u.blocker && (
                    <div className="text-(--ant-color-warning)">
                      Won't be credited as things stand: {u.blocker}
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        )}
      </div>

      <div>
        <Text strong className="block mb-2">
          Recent decisions
        </Text>
        <Table<UniformAllowanceCreditLog>
          size="small"
          rowKey="id"
          pagination={false}
          scroll={{ x: 560 }}
          dataSource={schedule.history}
          locale={{ emptyText: "Nothing decided yet" }}
          columns={CREDIT_DECISION_COLUMNS}
        />
      </div>
    </div>
  );
}
