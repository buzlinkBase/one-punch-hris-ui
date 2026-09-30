import { useState } from "react";
import { Button, Space, Typography, notification } from "antd";
import { MailOutlined, ReloadOutlined } from "@ant-design/icons";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useRemoveMembership, useUsers } from "../../hooks/use-user-queries";
import UserTable from "../../components/user-table";
import BatchInviteModal from "../../components/batch-invite-modal/batch-invite-modal";
import { USER_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function UserList() {
  const { data: users = [], isLoading, refetch, isFetching } = useUsers();
  const { mutate: removeMembership, isPending: removingMembership } =
    useRemoveMembership();
  const [inviteOpen, setInviteOpen] = useState(false);

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

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {USER_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage tenant members, roles, and access status.
            </p>
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

      <UserTable
        data={users}
        loading={isLoading || removingMembership}
        onDelete={handleRemoveMembership}
      />

      <BatchInviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}
