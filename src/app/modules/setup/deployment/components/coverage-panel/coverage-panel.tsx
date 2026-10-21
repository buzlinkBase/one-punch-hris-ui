import { useState } from "react";
import { DatePicker, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { useCoverage } from "../../hooks/use-deployment-queries";
import { DATE_FORMAT } from "../../constants/label.const";
import type { CoverageRow } from "../../models/api/response/deployment-response.model";

const { Text } = Typography;

interface CoveragePanelProps {
  clientId: string;
}

/** Manning on a day: people each post needs against people deployed to it (regulars and relievers), with the gaps. */
export function CoveragePanel({ clientId }: CoveragePanelProps) {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const coverage = useCoverage(clientId, date.format(DATE_FORMAT));
  const report = coverage.data;

  const columns: ColumnsType<CoverageRow> = [
    { title: "Site", dataIndex: "siteName" },
    {
      title: "Post",
      key: "post",
      render: (_, r) => (
        <div>
          <div>{r.postName}</div>
          <Text type="secondary" className="text-xs">
            {r.position}
          </Text>
        </div>
      ),
    },
    { title: "Shifts", dataIndex: "shifts" },
    { title: "Needed", dataIndex: "required", align: "right" },
    { title: "Regulars", dataIndex: "regulars", align: "right" },
    { title: "Relievers", dataIndex: "relievers", align: "right" },
    { title: "Augmentation", dataIndex: "augmentation", align: "right" },
    {
      title: "Gap",
      key: "gap",
      align: "right",
      render: (_, r) =>
        r.gap > 0 ? (
          <Tag color="red">{r.gap} short</Tag>
        ) : r.gap < 0 ? (
          <Tag color="gold">{-r.gap} over</Tag>
        ) : (
          <Tag color="green">Covered</Tag>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-6">
        <DatePicker
          value={date}
          allowClear={false}
          onChange={(d) => d && setDate(d)}
        />
        <Statistic title="People needed" value={report?.required ?? 0} />
        <Statistic title="Deployed" value={report?.deployed ?? 0} />
        <Statistic title="Short" value={report?.gap ?? 0} />
      </div>
      <Text type="secondary">
        People are deployed to a post, not a shift: who works which shift is set
        in the work schedule. Regulars and relievers count against the need;
        augmentation is extra.
      </Text>
      <Table<CoverageRow>
        rowKey="postId"
        size="small"
        loading={coverage.isLoading}
        dataSource={report?.rows ?? []}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No manning set for this day." }}
      />
    </div>
  );
}
