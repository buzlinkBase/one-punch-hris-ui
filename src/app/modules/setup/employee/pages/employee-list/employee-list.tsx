import { useRef } from "react";
import { Button, Space, Typography, message } from "antd";
import { DownloadOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useEmployees,
  useDeleteEmployee,
  useDownloadEmployeeTemplate,
  useUploadEmployees,
} from "../../hooks/use-employee-queries";
import EmployeeTable from "../../components/employee-table";
import { EMPLOYEE_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function EmployeeList() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: employees = [], isLoading } = useEmployees();
  const { mutate: remove } = useDeleteEmployee();
  const { mutate: downloadTemplate, isPending: downloading } =
    useDownloadEmployeeTemplate();
  const { mutate: uploadEmployees, isPending: uploading } = useUploadEmployees();
  const [messageApi, contextHolder] = message.useMessage();

  const handleDownloadTemplate = () => {
    downloadTemplate(undefined, {
      onError: () => messageApi.error("Failed to download template."),
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadEmployees(file, {
      onSuccess: () => messageApi.success("Employees imported successfully."),
      onError: () => messageApi.error("Import failed. Please check the file and try again."),
    });
    e.target.value = "";
  };

  return (
    <div className="content-page">
      {contextHolder}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {EMPLOYEE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage and maintain employee records across your organization.
            </p>
          </div>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              loading={downloading}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
            <Button
              icon={<UploadOutlined />}
              loading={uploading}
              onClick={handleImportClick}
            >
              Import
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/setup/employee/create" })}
            >
              Add Employee
            </Button>
          </Space>
        </div>
      </div>

      <EmployeeTable data={employees} loading={isLoading} onDelete={remove} />
    </div>
  );
}
