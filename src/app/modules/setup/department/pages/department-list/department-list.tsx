import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useDepartments,
  useDeleteDepartment,
} from "../../hooks/use-department-queries";
import DepartmentTable from "../../components/department-table";
import { DEPARTMENT_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function DepartmentList() {
  const navigate = useNavigate();
  const {
    data: departments = [],
    isLoading,
    refetch,
    isFetching,
  } = useDepartments();
  const { mutate: remove } = useDeleteDepartment();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {DEPARTMENT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Organize teams and ownership for employee assignment and reports.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/setup/department/create" })}
            >
              Add Department
            </Button>
          </Space>
        </div>
      </div>
      <DepartmentTable
        data={departments}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
