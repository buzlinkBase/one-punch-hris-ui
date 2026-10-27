import { useState } from "react";
import {
  Button,
  Empty,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useActOnApproval,
  useInProgressApprovals,
  usePendingApprovals,
} from "../../hooks/use-my-approvals-queries";
import type { MyApproval } from "../../models/my-approval.model";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { APPLICATION_TYPE_LABEL } from "@/app/modules/setup/approval-workflows/constants/label.const";

dayjs.extend(relativeTime);

const { Title } = Typography;

type ApprovalsTab = "for-approval" | "in-progress";

interface Pending {
  item: MyApproval;
  action: "Approved" | "Declined";
}

// The parts both lists show: the request, when it was filed, and where it stands -- the step and
// who it's waiting on.
const baseColumns: ColumnsType<MyApproval> = [
  {
    title: "Request",
    key: "request",
    render: (_, r) => (
      <Space direction="vertical" size={0}>
        <span>
          <Tag className="me-1!">
            {APPLICATION_TYPE_LABEL[r.applicationType]}
          </Tag>
          {r.summary}
        </span>
        <span className="text-xs opacity-60">From {r.applicantName}</span>
      </Space>
    ),
  },
  {
    title: "Filed",
    key: "filed",
    width: 150,
    render: (_, r) => (
      <Tooltip title={dayjs(r.filedAt).format("MMM D, YYYY h:mm A")}>
        {dayjs(r.filedAt).fromNow()}
      </Tooltip>
    ),
  },
  {
    title: "Step / Approver",
    key: "step",
    width: 240,
    render: (_, r) => (
      <Space direction="vertical" size={0}>
        <span>
          Step {r.stepNumber} of {r.totalSteps}
        </span>
        {r.currentApproverLabel && (
          <span className="text-xs">Pending with {r.currentApproverLabel}</span>
        )}
        {r.flowName && <span className="text-xs opacity-60">{r.flowName}</span>}
        {r.onBehalfOfName && (
          <Tag color="purple" className="mt-1 me-0!">
            For {r.onBehalfOfName}
          </Tag>
        )}
      </Space>
    ),
  },
];

// "My Approvals": what's waiting on me now -- directly, or because someone delegated to me -- and,
// separately, what's still being approved on someone else's step. Open to anyone with a login
// (employee-only managers included); approving here goes through the same module service as the
// request's own screen, so credits, DTR and status updates all still happen.
export default function PortalApprovals() {
  const [messageApi, contextHolder] = message.useMessage();
  const [tab, setTab] = useState<ApprovalsTab>("for-approval");
  const [pending, setPending] = useState<Pending | null>(null);
  const { data: items = [], isLoading } = usePendingApprovals();
  const { data: inProgress = [], isLoading: isLoadingInProgress } =
    useInProgressApprovals();
  const { mutate: act, isPending: isActing } = useActOnApproval();

  const confirm = (note?: string) => {
    if (!pending) return;
    const { item, action } = pending;
    act(
      {
        applicationType: item.applicationType,
        applicationId: item.applicationId,
        action: action === "Approved" ? "approve" : "decline",
        note,
      },
      {
        onSuccess: () => {
          setPending(null);
          messageApi.success(
            action === "Approved" ? "Request approved." : "Request declined.",
          );
        },
        onError: () =>
          messageApi.error(
            "That didn't go through. It may already have been decided, or you may no longer be able to approve it.",
          ),
      },
    );
  };

  const forApprovalColumns: ColumnsType<MyApproval> = [
    ...baseColumns,
    {
      title: "",
      key: "actions",
      width: 220,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => setPending({ item: r, action: "Approved" })}
          >
            Approve
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            onClick={() => setPending({ item: r, action: "Declined" })}
          >
            Decline
          </Button>
        </Space>
      ),
    },
  ];

  const showingForApproval = tab === "for-approval";
  const rows = showingForApproval ? items : inProgress;

  return (
    <div className="content-page">
      {contextHolder}
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Approvals
            </Title>
            <p className="page-toolbar-subtitle">
              Requests on your step, including those you cover for someone who
              is away, and requests still with other approvers.
            </p>
          </div>
        </div>
      </div>

      <Tabs
        className="mb-2"
        activeKey={tab}
        onChange={(key) => setTab(key as ApprovalsTab)}
        items={[
          { key: "for-approval", label: `For Approval (${items.length})` },
          { key: "in-progress", label: `In Progress (${inProgress.length})` },
        ]}
      />

      <Table
        rowKey={(r) => `${r.applicationType}-${r.applicationId}`}
        size="small"
        loading={showingForApproval ? isLoading : isLoadingInProgress}
        dataSource={rows}
        columns={showingForApproval ? forApprovalColumns : baseColumns}
        pagination={rows.length > 15 ? { pageSize: 15 } : false}
        scroll={{ x: true }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                showingForApproval
                  ? "Nothing is waiting on you"
                  : "No requests are with other approvers"
              }
            />
          ),
        }}
      />

      <ApprovalActionModal
        open={!!pending}
        action={pending?.action ?? "Approved"}
        noteRequirement={pending?.item.noteRequirement}
        loading={isActing}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </div>
  );
}
