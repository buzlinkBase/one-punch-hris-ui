import { useState } from "react";
import { Rate, Select, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  usePortalClients,
  useScorecard,
} from "../../hooks/use-client-portal-queries";
import type { ScorecardRow } from "../../models/api/response/client-portal-response.model";

const { Title, Text } = Typography;

export default function ServiceScorecard() {
  const clients = usePortalClients();
  const [clientId, setClientId] = useState<string | undefined>();
  const card = useScorecard(clientId);

  const columns: ColumnsType<ScorecardRow> = [
    {
      title: "",
      key: "kind",
      width: 80,
      render: (_, r) => (
        <Tag color={r.kind === "Site" ? "blue" : "purple"}>{r.kind}</Tag>
      ),
    },
    { title: "Name", dataIndex: "name" },
    { title: "Client", dataIndex: "clientName" },
    {
      title: "Average",
      key: "average",
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <Rate disabled allowHalf value={r.average} />
          <Text>{r.average.toFixed(2)}</Text>
        </div>
      ),
      sorter: (a, b) => a.average - b.average,
    },
    { title: "Ratings", dataIndex: "count", align: "right" },
    {
      title: "By month",
      key: "months",
      render: (_, r) => (
        <div className="flex flex-wrap gap-1">
          {r.months.map((m) => (
            <Tag key={m.period}>
              {m.period}: {m.average.toFixed(1)} ({m.count})
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          Service Scorecard
        </Title>
        <Text type="secondary">
          How clients rate the service at their sites and individual guards.
          Lowest-rated first.
        </Text>
      </div>
      <div className="rounded-lg bg-white p-4">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All clients"
          className="mb-3 min-w-64"
          value={clientId}
          options={(clients.data ?? []).map((c) => ({
            value: c.id,
            label: `${c.name} (${c.code})`,
          }))}
          onChange={setClientId}
        />
        <Table<ScorecardRow>
          rowKey={(r) => `${r.kind}-${r.targetId}`}
          loading={card.isLoading}
          dataSource={card.data?.rows ?? []}
          columns={columns}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
        />
      </div>
      {(card.data?.comments.length ?? 0) > 0 && (
        <div className="rounded-lg bg-white p-4">
          <Title level={5}>Recent comments</Title>
          <div className="flex flex-col gap-2">
            {card.data?.comments.map((c, i) => (
              <div key={i} className="rounded bg-gray-50 p-2 text-sm">
                <Rate disabled value={c.stars} className="text-sm" />{" "}
                <b>{c.target}</b>{" "}
                <Text type="secondary" className="text-xs">
                  {c.clientName} · {c.by} · {c.period}
                </Text>
                <div>{c.comment}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
