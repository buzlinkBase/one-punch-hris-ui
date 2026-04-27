import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useUsers, useDeleteUser } from "../../hooks/useUserQueries";
import UserTable from "../../components/UserTable";
import { USER_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function UserList() {
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsers();
  const { mutate: remove } = useDeleteUser();

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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/security/users/create" })}
          >
            Add User
          </Button>
        </div>
      </div>

      <UserTable data={users} loading={isLoading} onDelete={remove} />
    </div>
  );
}
