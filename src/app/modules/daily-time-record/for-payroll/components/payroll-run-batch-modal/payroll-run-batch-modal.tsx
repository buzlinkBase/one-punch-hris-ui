import {
  Button,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Text } = Typography;

export interface PayrollBatchGroup {
  payrollBatchId: string;
  count: number;
  allPosted: boolean;
  hasPosted: boolean;
  fromDate: string;
  toDate: string;
  payDate?: string | null;
  remarks?: string | null;
  runTypeFeature: string;
}

interface Props {
  open: boolean;
  batchGroups: PayrollBatchGroup[];
  onClose: () => void;
  onPost: (payrollBatchId: string, count: number) => void;
  onDelete: (payrollBatchId: string, count: number) => void;
  isPosting: boolean;
  isDeleting: boolean;
}

// The "Post / Delete Payroll Run" toolbar action on Payroll Summary — every row here is one
// whole Generate run (grouped by PayrollBatchId), acted on as a unit rather than one employee
// at a time, since an employee's payroll is never generated on its own.
export default function PayrollRunBatchModal({
  open,
  batchGroups,
  onClose,
  onPost,
  onDelete,
  isPosting,
  isDeleting,
}: Props) {
  return (
    <Modal
      title="Payroll Run"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <p className="mb-4">
        Each row below is one Generate run for the selected date range. Post
        locks a run in as final; Delete removes every employee&apos;s payroll in
        it along with its SSS/PhilHealth/Pag-IBIG/W-Tax contribution records, so
        you can regenerate it from the same DTR batch(es). Both act on the whole
        run, not one employee at a time.
      </p>
      <Table
        rowKey="payrollBatchId"
        size="small"
        dataSource={batchGroups}
        pagination={false}
        scroll={{ x: "max-content" }}
        columns={[
          {
            title: "Period",
            key: "period",
            render: (_, g) =>
              `${dayjs(g.fromDate).format("MMM DD")} – ${dayjs(g.toDate).format("MMM DD, YYYY")}`,
          },
          {
            title: "Payout Date",
            key: "payDate",
            render: (_, g) =>
              g.payDate ? dayjs(g.payDate).format("MMM DD, YYYY") : "—",
          },
          {
            title: "Employees",
            dataIndex: "count",
            key: "count",
            align: "right",
          },
          {
            title: "Remarks",
            key: "remarks",
            width: 200,
            ellipsis: { showTitle: false },
            render: (_, g) =>
              g.remarks ? (
                <Tooltip title={g.remarks}>
                  <Text type="secondary">{g.remarks}</Text>
                </Tooltip>
              ) : (
                <Text type="secondary">—</Text>
              ),
          },
          {
            title: "Status",
            key: "status",
            render: (_, g) => (
              <Tag
                color={
                  g.allPosted ? "success" : g.hasPosted ? "warning" : "default"
                }
              >
                {g.allPosted
                  ? "Posted"
                  : g.hasPosted
                    ? "Partially Posted"
                    : "Draft"}
              </Tag>
            ),
          },
          {
            title: "",
            key: "actions",
            render: (_, g) => (
              <Space size={4}>
                <PermissionGate permission={`${g.runTypeFeature}:Approve`}>
                  <Popconfirm
                    title="Post this entire payroll run?"
                    description={`Locks all ${g.count} record${g.count !== 1 ? "s" : ""} in this run as final.`}
                    okText="Post"
                    cancelText="Cancel"
                    disabled={g.allPosted}
                    onConfirm={() => onPost(g.payrollBatchId, g.count)}
                  >
                    <Button
                      size="small"
                      icon={<CheckCircleOutlined />}
                      disabled={g.allPosted}
                      loading={isPosting}
                    >
                      Post
                    </Button>
                  </Popconfirm>
                </PermissionGate>
                <PermissionGate permission={`${g.runTypeFeature}:Create`}>
                  <Popconfirm
                    title="Delete this entire payroll run?"
                    description={`This removes all ${g.count} record${g.count !== 1 ? "s" : ""} in this run.`}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancel"
                    disabled={g.hasPosted}
                    onConfirm={() => onDelete(g.payrollBatchId, g.count)}
                  >
                    <Tooltip
                      title={
                        g.hasPosted
                          ? "This run has been posted and can no longer be deleted."
                          : undefined
                      }
                    >
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        disabled={g.hasPosted}
                        loading={isDeleting}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  </Popconfirm>
                </PermissionGate>
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  );
}
