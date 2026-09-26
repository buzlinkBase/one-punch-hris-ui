import { useRef, useState } from "react";
import { Button, Dropdown, Input, Space, Typography, message } from "antd";
import {
  ClearOutlined,
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate } from "@tanstack/react-router";
import {
  useEmployeeSearch,
  useDownloadEmployeeTemplate,
  usePreviewEmployeesUpload,
  useCommitEmployeesImport,
} from "../../hooks/use-employee-queries";
import EmployeeTable, { formatFullName } from "../../components/employee-table";
import {
  clearedQuery,
  hasActiveFilters,
} from "../../components/employee-table/employee-list-query.mapper";
import type { EmployeeListQuery } from "../../models/api/request/employee-list-query.model";
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

const EMPLOYEE_PAGE_SIZE = 20;

const INITIAL_QUERY: EmployeeListQuery = {
  page: 1,
  limit: EMPLOYEE_PAGE_SIZE,
};

export default function EmployeeList() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Single source of truth for the table: page, size, sort, keyword and every column filter.
  // Paging/sorting/filtering all run on the server (GET employees/list).
  const [query, setQuery] = useState<EmployeeListQuery>(INITIAL_QUERY);
  const [searchText, setSearchText] = useState("");
  const { data, isLoading, refetch, isFetching } = useEmployeeSearch(query);
  const employees = data?.data ?? [];
  const total = data?.metaData?.totalCount ?? 0;
  const filtersActive = hasActiveFilters(query);
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

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Search
          placeholder="Search name, Bio ID, client, SSS/TIN…"
          allowClear
          enterButton={<SearchOutlined />}
          loading={isFetching}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) =>
            setQuery((q) => ({
              ...q,
              keyword: value.trim() || undefined,
              page: 1,
            }))
          }
          className="w-full sm:max-w-sm"
        />
        {filtersActive && (
          <Button
            icon={<ClearOutlined />}
            onClick={() => {
              setSearchText("");
              setQuery((q) => clearedQuery(q));
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <EmployeeTable
        data={employees}
        loading={isFetching}
        query={query}
        total={total}
        onQueryChange={setQuery}
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
