import { Button, Popconfirm, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { UploadBatchResponse } from "../../models/api/response/upload-batch-response.model";

interface Props {
  data: UploadBatchResponse[];
  loading?: boolean;
  canDelete: boolean;
  deletingBatch: string | null;
  onDelete: (batchCode: string) => void;
}

const formatTime = (v: string | null) =>
  v ? dayjs(v).format("MMM DD, YYYY hh:mm A") : "—";

const formatDay = (v: string | null) =>
  v ? dayjs(v).format("MMM DD, YYYY") : "—";

// A saved DTR built from the upload's logs has to be deleted before the upload can be.
const savedDtrMessage = (batches: string[]) =>
  batches.length === 1
    ? `Saved in DTR batch ${batches[0]}. Delete that saved DTR first.`
    : `Saved in DTR batches ${batches.join(", ")}. Delete those saved DTRs first.`;

export default function UploadBatchTable({
  data,
  loading,
  canDelete,
  deletingBatch,
  onDelete,
}: Props) {
  const columns: ColumnsType<UploadBatchResponse> = [
    {
      title: "Uploaded",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      width: 180,
      render: (v: string | null) => formatTime(v),
    },
    {
      title: "Reason / Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (v: string) => v || "—",
    },
    {
      title: "Device",
      dataIndex: "deviceName",
      key: "deviceName",
      width: 120,
      render: (v: string) => v || "—",
    },
    {
      title: "Logs",
      dataIndex: "logCount",
      key: "logCount",
      width: 80,
      align: "right",
    },
    {
      title: "Employees",
      dataIndex: "employeeCount",
      key: "employeeCount",
      width: 100,
      align: "right",
    },
    {
      title: "Log Dates",
      key: "dates",
      width: 220,
      render: (_, record) =>
        record.firstLog === record.lastLog
          ? formatDay(record.firstLog)
          : `${formatDay(record.firstLog)} – ${formatDay(record.lastLog)}`,
    },
    {
      title: "Changed",
      dataIndex: "changedCount",
      key: "changedCount",
      width: 100,
      render: (v: number) =>
        v > 0 ? (
          <Tooltip title="Logs of this upload that were edited or removed. Their originals are kept until the upload is deleted.">
            <Tag color="gold">{v}</Tag>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    ...(canDelete
      ? [
          {
            title: "",
            key: "actions",
            width: 60,
            fixed: "right" as const,
            render: (_: unknown, record: UploadBatchResponse) =>
              record.savedDtrBatches.length > 0 ? (
                <Tooltip title={savedDtrMessage(record.savedDtrBatches)}>
                  <span>
                    <Button
                      type="text"
                      size="small"
                      danger
                      disabled
                      icon={<DeleteOutlined />}
                    />
                  </span>
                </Tooltip>
              ) : (
                <Popconfirm
                  title="Delete this upload?"
                  description={
                    <div className="max-w-72">
                      Deletes all {record.logCount} log(s) from this upload and
                      their saved originals. Re-uploading the file will import
                      them again.
                    </div>
                  }
                  onConfirm={() => onDelete(record.batchCode)}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="Delete upload">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      loading={deletingBatch === record.batchCode}
                    />
                  </Tooltip>
                </Popconfirm>
              ),
          },
        ]
      : []),
  ];

  return (
    <Table<UploadBatchResponse>
      rowKey="batchCode"
      dataSource={data}
      columns={columns}
      size="small"
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content" }}
    />
  );
}
