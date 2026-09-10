import { Typography } from "antd";
import { usePermissions } from "../../hooks/use-permission-queries";
import PermissionTable from "../../components/permission-table";
import { PERMISSION_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function PermissionList() {
  const { data: permissions = [], isLoading } = usePermissions();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {PERMISSION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              System-seeded catalog of granular access rights that roles can be
              granted. Read-only — assign these to a role from Security → Roles.
            </p>
          </div>
        </div>
      </div>
      <PermissionTable data={permissions} loading={isLoading} />
    </div>
  );
}
