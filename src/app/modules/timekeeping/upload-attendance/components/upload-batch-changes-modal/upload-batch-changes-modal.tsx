import { Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useUploadBatchChanges } from "../../hooks/use-upload-attendance-queries";
import type { UploadBatchChangeResponse } from "../../models/api/response/upload-batch-change-response.model";

interface Props {
  /** The upload whose edited/removed logs to show; null keeps the modal closed. */
  batchCode: string | null;
  onClose: () => void;
}

const formatTime = (v: string | null) =>
  v ? dayjs(v).format("MMM DD, YYYY hh:mm A") : "—";

const columns: ColumnsType<UploadBatchChangeResponse> = [
  {
    title: "Employee",
    key: "employee",
    render: (_, r) => r.employeeName || (r.bioId ? `Bio ID ${r.bioId}` : "—"),
  },
  {
    title: "Change",
    dataIndex: "action",
    key: "action",
    width: 100,
    render: (v: UploadBatchChangeResponse["action"]) =>
      v === "EDITED" ? (
        <Tag color="gold">Edited</Tag>
      ) : (
        <Tag color="red">Removed</Tag>
      ),
  },
  {
    title: "Original Log",
    dataIndex: "originalDateTime",
    key: "originalDateTime",
    width: 180,
    render: (v: string) => formatTime(v),
  },
  {
    title: "Current Log",
    dataIndex: "currentDateTime",
    key: "currentDateTime",
    width: 180,
    render: (v: string | null) => formatTime(v),
  },
  {
    title: "Reason",
    dataIndex: "reason",
    key: "reason",
    render: (v: string) => v || "—",
  },
  {
    title: "Changed By",
    dataIndex: "changedBy",
    key: "changedBy",
    width: 160,
    render: (v: string) => v || "—",
  },
  {
    title: "Changed On",
    dataIndex: "changedAt",
    key: "changedAt",
    width: 180,
    render: (v: string) => formatTime(v),
  },
];

// The edited and removed logs behind an upload's "Changed" count in Upload History.
export default function UploadBatchChangesModal({ batchCode, onClose }: Props) {
  const { data = [], isFetching } = useUploadBatchChanges(batchCode);

  return (
    <Modal
      title="Changed Logs"
      open={batchCode !== null}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnHidden
    >
      <Table<UploadBatchChangeResponse>
        rowKey="id"
        dataSource={data}
        columns={columns}
        size="small"
        loading={isFetching}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
      />
    </Modal>
  );
}
