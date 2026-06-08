import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useAssignAssets,
  useDeleteAssignAsset,
} from "../../hooks/useAssignAssetQueries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/useEmployeeQueries";
import AssignAssetTable from "../../components/AssignAssetTable";
import { ASSIGN_ASSET_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function AssignAssetList() {
  const navigate = useNavigate();
  const { data: assets = [], isLoading } = useAssignAssets();
  const { data: employees = [] } = useEmployees();
  const { mutate: remove } = useDeleteAssignAsset();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {ASSIGN_ASSET_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Track company assets issued to employees including issuance and return dates.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate({ to: "/employee-management/assign-assets/create" })
            }
          >
            Assign Asset
          </Button>
        </div>
      </div>
      <AssignAssetTable
        data={assets}
        employees={employees}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
