import { useMemo } from "react";
import { Button, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { UnregisteredAttendanceLog } from "../../models/api/response/unregister-employee-response.model";
import { UNREGISTER_EMPLOYEE_LABEL } from "../../constants/label.const";

const { Text } = Typography;

interface BioIdGroup {
  key: string;
  bioId: number | null;
  name: string | null;
  count: number;
  fromDate: string;
  toDate: string;
  entries: UnregisteredAttendanceLog[];
  representative: UnregisteredAttendanceLog;
}

interface Props {
  data: UnregisteredAttendanceLog[];
  loading?: boolean;
  onTag?: (entries: UnregisteredAttendanceLog[]) => void;
}

const dash = <span style={{ color: "#d9d9d9" }}>—</span>;

const fmt = (v: string) => dayjs(v).format("MMM DD, YYYY hh:mm A");

export default function UnregisterEmployeeTable({
  data,
  loading,
  onTag,
}: Props) {
  const groups = useMemo<BioIdGroup[]>(() => {
    const map = new Map<string, UnregisteredAttendanceLog[]>();
    for (const log of data) {
      const key = log.bioId != null ? String(log.bioId) : `null-${log.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(log);
    }
    return Array.from(map.entries()).map(([key, entries]) => {
      const sorted = [...entries].sort((a, b) =>
        a.workDateTime.localeCompare(b.workDateTime),
      );
      const withName = entries.find((e) => e.name);
      return {
        key,
        bioId: entries[0].bioId,
        name: withName?.name ?? null,
        count: entries.length,
        fromDate: sorted[0].workDateTime,
        toDate: sorted[sorted.length - 1].workDateTime,
        entries: sorted,
        representative: entries[0],
      };
    });
  }, [data]);

  const parentColumns: ColumnsType<BioIdGroup> = [
    {
      title: "Bio ID",
      dataIndex: "bioId",
      key: "bioId",
      width: 90,
      render: (v: number | null) => (v != null ? v : dash),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (v: string | null) => v ?? dash,
    },
    {
      title: "Entries",
      dataIndex: "count",
      key: "count",
      width: 80,
    },
    {
      title: "Date Range",
      key: "dateRange",
      width: 380,
      render: (_: unknown, row: BioIdGroup) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {fmt(row.fromDate)}
          {" — "}
          {fmt(row.toDate)}
        </Text>
      ),
    },
    {
      title: UNREGISTER_EMPLOYEE_LABEL.ACTIONS,
      key: "actions",
      width: 220,
      fixed: "right",
      render: (_: unknown, row: BioIdGroup) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            onClick={() => onTag?.(row.entries)}
          >
            {UNREGISTER_EMPLOYEE_LABEL.TAG}
          </Button>
        </Space>
      ),
    },
  ];

  const childColumns: ColumnsType<UnregisteredAttendanceLog> = [
    {
      title: "Work Date Time",
      dataIndex: "workDateTime",
      key: "workDateTime",
      width: 200,
      render: (v: string) => fmt(v),
    },
    {
      title: "Log Source",
      dataIndex: "logSource",
      key: "logSource",
      width: 120,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      width: 130,
      render: (v: string | null) => v ?? dash,
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      width: 130,
      render: (v: string | null) => v ?? dash,
    },
    {
      title: "Project Site",
      dataIndex: "area",
      key: "area",
      width: 130,
      render: (v: string | null) => v ?? dash,
    },
    {
      title: "Batch",
      dataIndex: "batch",
      key: "batch",
      width: 200,
      render: (v: string) =>
        v ? <Tag color="blue">{v}</Tag> : <Tag color="default">Manual</Tag>,
    },
  ];

  return (
    <Table<BioIdGroup>
      rowKey="key"
      dataSource={groups}
      columns={parentColumns}
      loading={loading}
      size="small"
      pagination={{ pageSize: 15 }}
      scroll={{ x: "max-content" }}
      sticky
      locale={{ emptyText: "No unregistered attendance logs found." }}
      expandable={{
        expandedRowRender: (group) => (
          <div style={{ paddingLeft: 32, paddingBlock: 8 }}>
            <Table<UnregisteredAttendanceLog>
              rowKey="id"
              dataSource={group.entries}
              columns={childColumns}
              pagination={false}
              size="small"
              scroll={{ x: "max-content" }}
            />
          </div>
        ),
        rowExpandable: (group) => group.entries.length > 0,
      }}
    />
  );
}
