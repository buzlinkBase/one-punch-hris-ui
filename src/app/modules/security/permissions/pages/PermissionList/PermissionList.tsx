import { Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import {
  usePermissions,
  useDeletePermission,
} from '../../hooks/usePermissionQueries';
import PermissionTable from '../../components/PermissionTable';
import { PERMISSION_LABEL } from '../../constants/label.const';

const { Title } = Typography;

export default function PermissionList() {
  const navigate = useNavigate();
  const { data: permissions = [], isLoading } = usePermissions();
  const { mutate: remove } = useDeletePermission();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {PERMISSION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define granular access rights assigned to roles across all system modules.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: '/security/permissions/create' })}
          >
            Add Permission
          </Button>
        </div>
      </div>
      <PermissionTable
        data={permissions}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
