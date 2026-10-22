import { useState } from "react";
import { Drawer, Select, Table } from "antd";
import dayjs from "dayjs";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useUniformAllowanceCreditLog } from "@/app/modules/setup/client/hooks/use-uniform-allowance-policy-queries";
import { UNIFORM_OUTCOME_TAG } from "@/app/modules/setup/client/constants/uniform-allowance.const";
import type {
  UniformAllowanceCreditLog,
  UniformCreditOutcome,
} from "@/app/modules/setup/client/models/api/response/uniform-allowance-policy.model";
import { CREDIT_DECISION_COLUMNS } from "../uniform-schedule-view/credit-decision-columns";

const OUTCOME_OPTIONS = (
  Object.keys(UNIFORM_OUTCOME_TAG) as UniformCreditOutcome[]
).map((value) => ({ value, label: UNIFORM_OUTCOME_TAG[value].label }));

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Every uniform allowance credit decision -- credited, capped, or skipped with the reason -- so HR
 * can answer "why didn't they get it this month?". Defaults to the last three months.
 */
export function UniformCreditLogDrawer({ open, onClose }: Props) {
  const [range, setRange] = useState<[string, string]>([
    dayjs().subtract(3, "month").startOf("month").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD"),
  ]);
  const [clientId, setClientId] = useState<string | undefined>();
  const [outcome, setOutcome] = useState<UniformCreditOutcome | undefined>();
  const { data: clients = [] } = useClients();
  const { data = [], isFetching } = useUniformAllowanceCreditLog(
    { from: range[0], to: range[1], clientId, outcome },
    open,
  );

  return (
    <Drawer
      title="Uniform allowance credit log"
      open={open}
      onClose={onClose}
      size="large"
      rootClassName="[&_.ant-drawer-content-wrapper]:max-w-full"
      destroyOnHidden
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <MobileRangePicker
          value={[dayjs(range[0]), dayjs(range[1])]}
          allowClear={false}
          onChange={(dates) =>
            dates?.[0] &&
            dates[1] &&
            setRange([
              dates[0].format("YYYY-MM-DD"),
              dates[1].format("YYYY-MM-DD"),
            ])
          }
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All clients"
          className="min-w-48"
          value={clientId}
          onChange={setClientId}
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          allowClear
          placeholder="All outcomes"
          className="min-w-36"
          value={outcome}
          onChange={setOutcome}
          options={OUTCOME_OPTIONS}
        />
      </div>
      <Table<UniformAllowanceCreditLog>
        size="small"
        rowKey="id"
        loading={isFetching}
        dataSource={data}
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 50, showSizeChanger: false }}
        locale={{ emptyText: "No credit decisions in this period" }}
        columns={[
          {
            title: "Employee",
            key: "employee",
            width: 200,
            fixed: "left",
            render: (_, r) => (
              <div>
                <div>{r.employeeName}</div>
                <div className="text-xs text-(--ant-color-text-secondary)">
                  {r.employeeNo}
                </div>
              </div>
            ),
          },
          {
            title: "Client",
            dataIndex: "clientName",
            key: "client",
            width: 150,
          },
          ...CREDIT_DECISION_COLUMNS,
        ]}
      />
    </Drawer>
  );
}
