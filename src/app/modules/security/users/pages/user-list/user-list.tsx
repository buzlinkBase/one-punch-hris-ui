import { useState } from "react";
import { Button, Modal, Space, Tabs, Typography, notification } from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  MailOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  type BulkResult,
  useBulkRemoveMembership,
  useBulkUpdateStatus,
  useRemoveMembership,
  useUpdateMemberStatus,
  useUserRows,
} from "../../hooks/use-user-queries";
import UserTable from "../../components/user-table";
import type { UserTableVariant } from "../../components/user-table/user-table";
import BatchInviteModal from "../../components/batch-invite-modal/batch-invite-modal";
import type {
  UserKind,
  UserRow,
} from "../../models/api/response/user-response.model";
import type { InviteEntityType } from "../../models/api/request/batch-invitation-request.model";
import {
  USER_BULK_LABEL,
  USER_LABEL,
  USER_TAB_LABEL,
} from "../../constants/label.const";

const { Title } = Typography;

interface TabDefinition {
  label: string;
  /** Which users the tab lists; none means everyone. */
  kind?: UserKind;
  /** What the Invite button starts on from this tab. */
  inviteAs: InviteEntityType;
}

const TABS: Record<UserTableVariant, TabDefinition> = {
  all: { label: USER_TAB_LABEL.ALL, inviteAs: "Employee" },
  employee: {
    label: USER_TAB_LABEL.EMPLOYEE,
    kind: "Employee",
    inviteAs: "Employee",
  },
  client: { label: USER_TAB_LABEL.CLIENT, kind: "Client", inviteAs: "Client" },
  other: { label: USER_TAB_LABEL.OTHER, kind: "Other", inviteAs: "Employee" },
};

const isTab = (value: unknown): value is UserTableVariant =>
  typeof value === "string" && value in TABS;

type BulkAction = "activate" | "revoke" | "remove";

interface BulkActionConfig {
  title: (count: number) => string;
  content?: string;
  okText: string;
  danger?: boolean;
  /** Past tense for the result notification, e.g. "Revoked 3 user(s)." */
  done: string;
  run: (ids: string[]) => Promise<BulkResult>;
}

export default function UserList() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const tab: UserTableVariant = isTab(search.tab) ? search.tab : "all";

  const { rows, isLoading, isFetching, refetch } = useUserRows();
  const { mutate: removeMembership, isPending: removingMembership } =
    useRemoveMembership();
  const {
    mutate: updateStatus,
    isPending: updatingStatus,
    variables: statusVariables,
  } = useUpdateMemberStatus();
  const { mutateAsync: bulkUpdateStatus, isPending: bulkUpdating } =
    useBulkUpdateStatus();
  const { mutateAsync: bulkRemove, isPending: bulkRemoving } =
    useBulkRemoveMembership();
  const [modal, contextHolder] = Modal.useModal();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const rowsOf = (variant: UserTableVariant): UserRow[] => {
    const { kind } = TABS[variant];
    return kind ? rows.filter((row) => row.kind === kind) : rows;
  };
  const visibleRows = rowsOf(tab);
  // Only what's on the current tab can be acted on, even if other rows were ticked before.
  const selected = selectedIds.filter((id) =>
    visibleRows.some((row) => row.id === id),
  );
  const bulkBusy = bulkUpdating || bulkRemoving;

  const changeTab = (next: string) => {
    setSelectedIds([]);
    navigate({
      to: "/security/users",
      search: next === "all" ? {} : { tab: next },
      replace: true,
    });
  };

  const handleRemoveMembership = (membershipId: string) => {
    removeMembership(
      { membershipId },
      {
        onSuccess: () => {
          notification.success({
            message: "Member removed",
            description: "This member has been removed from the company.",
            placement: "topRight",
          });
        },
        onError: () => {
          notification.error({
            message: "Unable to remove member",
            description: "This member could not be removed from the company.",
            placement: "topRight",
          });
        },
      },
    );
  };

  const handleToggleStatus = (record: UserRow, status: string) => {
    updateStatus(
      { membershipId: record.id, status },
      {
        onSuccess: () => {
          notification.success({
            message:
              status === "Active" ? "User activated" : "User access revoked",
            description: record.fullName || record.email,
            placement: "topRight",
          });
        },
        onError: () => {
          notification.error({
            message: "Unable to update user",
            description: `${record.fullName || record.email} could not be updated.`,
            placement: "topRight",
          });
        },
      },
    );
  };

  const reportBulk = (done: string, result: BulkResult) => {
    const notify =
      result.failed > 0 ? notification.warning : notification.success;
    notify({
      message: USER_BULK_LABEL.DONE(done, result.succeeded),
      description:
        result.failed > 0 ? USER_BULK_LABEL.PARTIAL(result.failed) : undefined,
      placement: "topRight",
    });
    setSelectedIds([]);
  };

  const bulkActions: Record<BulkAction, BulkActionConfig> = {
    activate: {
      title: USER_BULK_LABEL.CONFIRM_ACTIVATE,
      okText: USER_BULK_LABEL.ACTIVATE,
      done: "Activated",
      run: (ids) => bulkUpdateStatus({ membershipIds: ids, status: "Active" }),
    },
    revoke: {
      title: USER_BULK_LABEL.CONFIRM_REVOKE,
      content: USER_BULK_LABEL.REVOKE_DESCRIPTION,
      okText: USER_BULK_LABEL.REVOKE,
      danger: true,
      done: "Revoked",
      run: (ids) => bulkUpdateStatus({ membershipIds: ids, status: "Revoked" }),
    },
    remove: {
      title: USER_BULK_LABEL.CONFIRM_REMOVE,
      content: USER_BULK_LABEL.REMOVE_DESCRIPTION,
      okText: USER_BULK_LABEL.REMOVE,
      danger: true,
      done: "Removed",
      run: (ids) => bulkRemove({ membershipIds: ids }),
    },
  };

  const runBulk = (action: BulkAction) => {
    const ids = selected;
    const config = bulkActions[action];
    modal.confirm({
      title: config.title(ids.length),
      content: config.content,
      okText: config.okText,
      okButtonProps: { danger: config.danger },
      cancelText: "Cancel",
      onOk: async () => reportBulk(config.done, await config.run(ids)),
    });
  };

  return (
    <div className="content-page">
      {contextHolder}
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {USER_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">{USER_LABEL.SUBTITLE}</p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => refetch()}
            ></Button>
            <PermissionGate permission="Users:Invite">
              <Button
                type="primary"
                icon={<MailOutlined />}
                onClick={() => setInviteOpen(true)}
              >
                Invite Users
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <Tabs
        activeKey={tab}
        onChange={changeTab}
        items={(Object.keys(TABS) as UserTableVariant[]).map((key) => ({
          key,
          label: `${TABS[key].label} (${rowsOf(key).length})`,
        }))}
      />

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-(--ant-color-border-secondary) px-3 py-2">
          <Typography.Text strong>
            {USER_BULK_LABEL.SELECTED(selected.length)}
          </Typography.Text>
          <PermissionGate permission={["Tenant Members:Manage", "Users:Edit"]}>
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              disabled={bulkBusy}
              onClick={() => runBulk("activate")}
            >
              {USER_BULK_LABEL.ACTIVATE}
            </Button>
            <Button
              size="small"
              icon={<StopOutlined />}
              disabled={bulkBusy}
              onClick={() => runBulk("revoke")}
            >
              {USER_BULK_LABEL.REVOKE}
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={bulkBusy}
              onClick={() => runBulk("remove")}
            >
              {USER_BULK_LABEL.REMOVE}
            </Button>
          </PermissionGate>
          <Button size="small" type="link" onClick={() => setSelectedIds([])}>
            {USER_BULK_LABEL.CLEAR}
          </Button>
        </div>
      )}

      <UserTable
        key={tab}
        variant={tab}
        data={visibleRows}
        loading={isLoading || removingMembership || bulkBusy}
        selectedIds={selected}
        onSelectionChange={setSelectedIds}
        onToggleStatus={handleToggleStatus}
        togglingId={updatingStatus ? statusVariables?.membershipId : null}
        onDelete={handleRemoveMembership}
      />

      <BatchInviteModal
        key={TABS[tab].inviteAs}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        defaultEntityType={TABS[tab].inviteAs}
      />
    </div>
  );
}
