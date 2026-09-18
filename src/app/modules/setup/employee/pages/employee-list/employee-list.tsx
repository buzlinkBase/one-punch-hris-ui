import { useRef, useState } from "react";
import { Button, Dropdown, Input, Space, Typography, message } from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate } from "@tanstack/react-router";
import {
  useEmployees,
  useDownloadEmployeeTemplate,
  usePreviewEmployeesUpload,
  useCommitEmployeesImport,
} from "../../hooks/use-employee-queries";
import EmployeeTable, { formatFullName } from "../../components/employee-table";
import EmployeeImportPreviewModal from "../../components/employee-import-preview-modal/employee-import-preview-modal";
import { EMPLOYEE_LABEL } from "../../constants/label.const";
import InviteUserModal from "@/app/modules/security/users/components/invite-user-modal/invite-user-modal";
import EmployeePriorEmployerTaxModal from "../../components/employee-prior-employer-tax-modal";
import EmployeeOpeningBalanceModal from "../../components/employee-opening-balance-modal";
import type { EmployeeResponse } from "../../models/api/response/employee-response.model";
import type { EmployeeImportPreviewRow } from "../../models/api/response/employee-import-preview-response.model";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

const { Search } = Input;

export default function EmployeeList() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState("");
  const {
    data: employees = [],
    isLoading,
    refetch,
    isFetching,
  } = useEmployees(keyword);
  // Delete is temporarily hidden from the Employee list — see onDelete below.
  // const { mutate: remove } = useDeleteEmployee();
  const { mutate: downloadTemplate, isPending: downloading } =
    useDownloadEmployeeTemplate();
  const { mutate: commitImport, isPending: committing } =
    useCommitEmployeesImport();
  const { mutate: previewUpload, isPending: previewing } =
    usePreviewEmployeesUpload();
  const [messageApi, contextHolder] = message.useMessage();

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<EmployeeImportPreviewRow[]>(
    [],
  );

  const [inviteTarget, setInviteTarget] = useState<EmployeeResponse | null>(
    null,
  );
  const [priorEmployerTarget, setPriorEmployerTarget] =
    useState<EmployeeResponse | null>(null);
  const [openingBalanceTarget, setOpeningBalanceTarget] =
    useState<EmployeeResponse | null>(null);

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
    previewUpload(file, {
      onSuccess: (rows) => {
        setPendingFile(file);
        setPreviewRows(rows);
      },
      onError: () =>
        messageApi.error(
          "Could not read the file. Please check the format and try again.",
        ),
    });
    e.target.value = "";
  };

  const closePreview = () => {
    setPendingFile(null);
    setPreviewRows([]);
  };

  const handleDeleteRow = (rowNumber: number) => {
    setPreviewRows((rows) => rows.filter((r) => r.rowNumber !== rowNumber));
  };

  const handleConfirmImport = () => {
    if (previewRows.length === 0) return;
    commitImport(previewRows, {
      onSuccess: () => {
        messageApi.success("Employees imported successfully.");
        closePreview();
      },
      onError: () =>
        messageApi.error("Import failed. Please check the file and try again."),
    });
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
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "template",
                    icon: <DownloadOutlined />,
                    label: "Download Template",
                    onClick: handleDownloadTemplate,
                    disabled: downloading,
                  },
                  {
                    key: "upload",
                    icon: <UploadOutlined />,
                    label: "Upload File",
                    onClick: handleImportClick,
                    disabled: previewing,
                  },
                ] as MenuProps["items"],
              }}
            >
              <Button
                icon={<UploadOutlined />}
                loading={previewing || downloading}
              >
                Import
              </Button>
            </Dropdown>
            <PermissionGate permission="Workforce Setup:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: "/setup/employee/create" })}
              >
                Add Employee
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <Search
        placeholder="Search employees..."
        allowClear
        enterButton={<SearchOutlined />}
        loading={isFetching}
        onSearch={(value) => setKeyword(value.trim())}
        className="mb-3 w-full sm:max-w-xs"
      />

      <EmployeeTable
        data={employees}
        loading={isLoading}
        // onDelete hidden for now — omitting it makes EmployeeTable's delete menu item not
        // render at all (see its `{onDelete && (...)}` guard).
        onInvite={(record) => setInviteTarget(record)}
        onPriorEmployerTax={(record) => setPriorEmployerTarget(record)}
        onOpeningBalance={(record) => setOpeningBalanceTarget(record)}
      />

      <InviteUserModal
        open={!!inviteTarget}
        onClose={() => setInviteTarget(null)}
        employeeId={inviteTarget?.id}
        employeeName={
          inviteTarget
            ? `${inviteTarget.firstName} ${inviteTarget.lastName}`
            : undefined
        }
        employeeEmail={inviteTarget?.email ?? undefined}
      />

      <EmployeePriorEmployerTaxModal
        open={!!priorEmployerTarget}
        onClose={() => setPriorEmployerTarget(null)}
        employeeId={priorEmployerTarget?.id}
        employeeName={
          priorEmployerTarget ? formatFullName(priorEmployerTarget) : undefined
        }
      />

      <EmployeeOpeningBalanceModal
        open={!!openingBalanceTarget}
        onClose={() => setOpeningBalanceTarget(null)}
        employeeId={openingBalanceTarget?.id}
        employeeName={
          openingBalanceTarget
            ? formatFullName(openingBalanceTarget)
            : undefined
        }
      />

      <EmployeeImportPreviewModal
        open={!!pendingFile}
        onClose={closePreview}
        rows={previewRows}
        onDeleteRow={handleDeleteRow}
        onConfirm={handleConfirmImport}
        confirming={committing}
      />
    </div>
  );
}
