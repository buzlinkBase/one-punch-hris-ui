import { useState } from "react";
import { Button, Space, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useUsers } from "../../hooks/use-user-queries";
import UserTable from "../../components/user-table";
import InviteUserModal from "../../components/invite-user-modal/invite-user-modal";
import { USER_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function UserList() {
  const { data: users = [], isLoading, refetch, isFetching } = useUsers();
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
              Manage tenant members, roles, and access status.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => refetch()}
            ></Button>
            {/* <Button
              icon={<MailOutlined />}
              onClick={() => setInviteOpen(true)}
            ></Button> */}
          </Space>
        </div>
      </div>

      <UserTable data={users} loading={isLoading} />

      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
