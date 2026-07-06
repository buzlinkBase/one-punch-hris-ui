import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useEmployeeDocRecords,
  useDeleteEmployeeDocRecord,
} from "../../hooks/useEmployeeDocRecordQueries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/useEmployeeQueries";
import EmployeeDocRecordTable from "../../components/EmployeeDocRecordTable";
import { EMPLOYEE_DOC_RECORD_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function EmployeeDocRecordList() {
  const navigate = useNavigate();
  const { data: records = [], isLoading } = useEmployeeDocRecords();
  const { data: employees = [] } = useEmployees();
  const { mutate: remove } = useDeleteEmployeeDocRecord();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {EMPLOYEE_DOC_RECORD_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage and track employee document records and file attachments.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate({ to: "/employee-management/doc-records/create" })
            }
          >
            Add Document
          </Button>
        </div>
      </div>
      <EmployeeDocRecordTable
        data={records}
        employees={employees}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
