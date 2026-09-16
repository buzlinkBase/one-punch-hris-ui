import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useBranches, useDeleteBranch } from "../../hooks/use-branch-queries";
import BranchTable from "../../components/branch-table";
import { BRANCH_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function BranchList() {
  const navigate = useNavigate();
  const { data: branches = [], isLoading, refetch, isFetching } = useBranches();
  const { mutate: remove } = useDeleteBranch();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {BRANCH_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage company branches and their assignment to employees.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Organization Setup:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: "/setup/branch/create" })}
              >
                Add Branch
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>
      <BranchTable data={branches} loading={isLoading} onDelete={remove} />
    </div>
  );
}
