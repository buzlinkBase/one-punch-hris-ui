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
              The system's feature/action catalog. Permissions are
              system-defined — assign them to a Role to grant access.
            </p>
          </div>
        </div>
      </div>
      <PermissionTable data={permissions} loading={isLoading} />
    </div>
  );
}
