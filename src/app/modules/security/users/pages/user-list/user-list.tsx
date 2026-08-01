import { useState } from "react";
import { Button, Space, Typography } from "antd";
import { MailOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useUsers, useDeleteUser } from "../../hooks/use-user-queries";
import UserTable from "../../components/user-table";
import InviteUserModal from "../../components/invite-user-modal/invite-user-modal";
import { USER_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function UserList() {
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsers();
  const { mutate: remove } = useDeleteUser();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {USER_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage system users, credentials, and access profile status.
            </p>
          </div>
          <Space>
            <Button icon={<MailOutlined />} onClick={() => setInviteOpen(true)}>
              Invite User
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/security/users/create" })}
            >
              Add User
            </Button>
          </Space>
        </div>
      </div>

      <UserTable data={users} loading={isLoading} onDelete={remove} />

      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
