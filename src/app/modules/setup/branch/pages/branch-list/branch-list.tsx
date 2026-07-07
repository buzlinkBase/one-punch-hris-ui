import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useBranches, useDeleteBranch } from "../../hooks/use-branch-queries";
import BranchTable from "../../components/branch-table";
import { BRANCH_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function BranchList() {
  const navigate = useNavigate();
  const { data: branches = [], isLoading } = useBranches();
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/setup/branch/create" })}
          >
            Add Branch
          </Button>
        </div>
      </div>
      <BranchTable data={branches} loading={isLoading} onDelete={remove} />
    </div>
  );
}
