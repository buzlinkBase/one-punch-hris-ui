import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useRoles, useDeleteRole } from "../../hooks/useRoleQueries";
import RoleTable from "../../components/RoleTable";
import { ROLE_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function RoleList() {
  const navigate = useNavigate();
  const { data: roles = [], isLoading } = useRoles();
  const { mutate: remove } = useDeleteRole();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {ROLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage role definitions and activation status for access control.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/security/roles/create" })}
          >
            Add Role
          </Button>
        </div>
      </div>

      <RoleTable data={roles} loading={isLoading} onDelete={remove} />
    </div>
  );
}
