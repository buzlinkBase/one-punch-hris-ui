import { Modal, Table, Tag } from "antd";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { useAttendanceEntryRecords } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import type { AttendanceEntryResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/attendance-entry-response.model";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string | null | undefined;
  workDate: string;
}

const COLUMNS: ColumnsType<AttendanceEntryResponse> = [
  {
    title: "Time Log",
    dataIndex: "timeLog",
    key: "timeLog",
    width: 180,
    render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "—"),
  },
  {
    title: "Log Source",
    dataIndex: "logSource",
    key: "logSource",
    width: 130,
    render: (v: string) =>
      v ? <Tag color={v === "BIOMETRIC" ? "blue" : "purple"}>{v}</Tag> : "—",
  },
  {
    title: "Branch",
    dataIndex: "branch",
    key: "branch",
    render: (v: string | null) => v ?? "—",
  },
  {
    title: "Client",
    dataIndex: "client",
    key: "client",
    render: (v: string | null) => v ?? "—",
  },
  {
    title: "Area",
    dataIndex: "area",
    key: "area",
    render: (v: string | null) => v ?? "—",
  },
];

export default function DtrAttendanceLogsModal({
  open,
  onClose,
  employeeId,
  employeeName,
  workDate,
}: Props) {
  const { data: records = [], isFetching } = useAttendanceEntryRecords(
    { fromDate: workDate, toDate: workDate, employeeId },
    { enabled: open && !!employeeId && !!workDate },
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div>
          <div>Attendance Logs</div>
          <div style={{ fontSize: 13, fontWeight: 400, color: "#8c8c8c" }}>
            {employeeName ?? employeeId} &mdash; {workDate}
          </div>
        </div>
      }
      width={720}
      destroyOnClose
    >
      <Table<AttendanceEntryResponse>
        rowKey="id"
        columns={COLUMNS}
        dataSource={records}
        loading={isFetching}
        size="small"
        pagination={false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No attendance logs found for this date." }}
      />
    </Modal>
  );
}
