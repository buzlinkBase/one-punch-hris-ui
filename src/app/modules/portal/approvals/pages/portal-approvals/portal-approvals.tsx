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
import {
  CheckOutlined,
  CloseOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useActOnApproval,
  useApprovalHistory,
  useInProgressApprovals,
  usePendingApprovals,
} from "../../hooks/use-my-approvals-queries";
import type {
  MyApproval,
  MyApprovalHistory,
} from "../../models/my-approval.model";
import type { ApprovalInstanceStatus } from "@/shared/types/approval.model";
import { ApprovalStatusCell } from "@/shared/components/approval-status-cell/approval-status-cell";
import { QuickRangeBar } from "@/shared/components/quick-range-bar/quick-range-bar";
import { QUICK_RANGES } from "@/shared/utils/quick-date-ranges.util";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { APPLICATION_TYPE_LABEL } from "@/app/modules/setup/approval-workflows/constants/label.const";
import { useCreateMyDelegation } from "@/app/modules/setup/approval-delegations/hooks/use-approval-delegation-queries";
import { DelegationFormModal } from "@/app/modules/setup/approval-delegations/components/delegation-form-modal/delegation-form-modal";

dayjs.extend(relativeTime);

const { Title } = Typography;

type ApprovalsTab = "for-approval" | "in-progress" | "history";

const FINAL_STATUS_COLOR: Record<ApprovalInstanceStatus, string> = {
  InProgress: "blue",
  Approved: "green",
  Declined: "red",
  Cancelled: "default",
};

// What the person decided, and how the request ended up (a later step may still have declined it).
const historyColumns: ColumnsType<MyApprovalHistory> = [
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
    title: "My decision",
    key: "decision",
    width: 240,
    render: (_, r) => (
      <Space direction="vertical" size={0}>
        <Tag
          color={r.myDecision === "Approved" ? "green" : "red"}
          className="me-0!"
        >
          {r.myDecision}
        </Tag>
        {r.onBehalfOfName && (
          <Tag color="purple" className="mt-1 me-0!">
            For {r.onBehalfOfName}
          </Tag>
        )}
        {r.decidedByName && (
          <span className="text-xs opacity-60">By {r.decidedByName}</span>
        )}
        {r.note && <span className="text-xs opacity-60">{r.note}</span>}
      </Space>
    ),
  },
  {
    title: "Decided",
    key: "decided",
    width: 150,
    render: (_, r) => (
      <Tooltip title={dayjs(r.decidedAt).format("MMM D, YYYY h:mm A")}>
        {dayjs(r.decidedAt).fromNow()}
      </Tooltip>
    ),
  },
  {
    // Same display as the Applications lists' History tabs: the status, who approved each step,
    // and a "View progress" link to the full timeline.
    title: "Final status",
    key: "status",
    width: 260,
    render: (_, r) => (
      <ApprovalStatusCell
        applicationType={r.applicationType}
        applicationId={r.applicationId}
        approvalStatus={r.finalStatus}
        statusTag={
          <Tag color={FINAL_STATUS_COLOR[r.finalStatus]} className="me-0!">
            {r.finalStatus}
          </Tag>
        }
      />
    ),
  },
];

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
        {r.flowName && <span className="text-xs opacity-60">{r.flowName}</span>}{" "}
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
  const [historyRange, setHistoryRange] = useState<[string, string]>(() =>
    QUICK_RANGES.find((q) => q.key === "thisMonth")!.range(),
  );
  const { data: history = [], isLoading: isLoadingHistory } =
    useApprovalHistory(historyRange[0], historyRange[1]);
  const [delegating, setDelegating] = useState(false);
  const { mutateAsync: createDelegation, isPending: isDelegating } =
    useCreateMyDelegation();

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
          <Button
            icon={<UserSwitchOutlined />}
            onClick={() => setDelegating(true)}
          >
            While I'm away
          </Button>
        </div>
      </div>

      <DelegationFormModal
        open={delegating}
        mode="self"
        submitting={isDelegating}
        onCancel={() => setDelegating(false)}
        onSubmit={async (data) => {
          await createDelegation(data);
          messageApi.success(
            "Delegation saved. Manage it anytime from My Profile.",
          );
        }}
      />

      <Tabs
        className="mb-2"
        activeKey={tab}
        onChange={(key) => setTab(key as ApprovalsTab)}
        items={[
          { key: "for-approval", label: `For Approval (${items.length})` },
          { key: "in-progress", label: `In Progress (${inProgress.length})` },
          { key: "history", label: "History" },
        ]}
      />

      {tab === "history" && (
        <div className="mb-3">
          <QuickRangeBar
            dateRange={historyRange}
            onDateRangeChange={setHistoryRange}
          />
        </div>
      )}

      {tab === "history" ? (
        <Table
          rowKey={(r) => `${r.applicationType}-${r.applicationId}`}
          size="small"
          loading={isLoadingHistory}
          dataSource={history}
          columns={historyColumns}
          pagination={history.length > 15 ? { pageSize: 15 } : false}
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="You haven't decided any requests in this period"
              />
            ),
          }}
        />
      ) : (
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
      )}

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
