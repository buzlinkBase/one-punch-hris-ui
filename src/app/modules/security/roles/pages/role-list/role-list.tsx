import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useRoles, useDeleteRole } from "../../hooks/use-role-queries";
import RoleTable from "../../components/role-table";
import { ROLE_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

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
              Manage custom roles and their permission grants. System roles are
              fixed and view-only.
            </p>
          </div>
          <PermissionGate permission={["Tenant Roles:Manage", "Roles:Create"]}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/security/roles/create" })}
            >
              Add Role
            </Button>
          </PermissionGate>
        </div>
      </div>

      <RoleTable data={roles} loading={isLoading} onDelete={remove} />
    </div>
  );
}
