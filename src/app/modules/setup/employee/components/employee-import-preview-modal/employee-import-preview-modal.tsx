import { Modal, Table, Tag, Tooltip, Button, Typography } from "antd";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { EmployeeImportPreviewRow } from "../../models/api/response/employee-import-preview-response.model";
import { useExportImportErrors } from "../../hooks/use-employee-queries";

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  rows: EmployeeImportPreviewRow[];
  onDeleteRow: (rowNumber: number) => void;
  onConfirm: () => void;
  confirming: boolean;
}

function yesNo(value?: boolean) {
  return value ? "Yes" : "No";
}

// Calendar dates only (Date of Birth, Hire Date) -- no timezone marker on these values, and none
// should be applied: parse and display the date components exactly as sent, never shifted
// through a UTC interpretation the way a real timestamp (e.g. CreatedAt) would be.
function formatDate(value?: string | null) {
  return value ? dayjs(value).format("MMM D, YYYY") : "—";
}

function buildColumns(
  onDeleteRow: (rowNumber: number) => void,
): ColumnsType<EmployeeImportPreviewRow> {
  return [
    {
      title: "",
      key: "remove",
      width: 50,
      fixed: "left",
      render: (_, row) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onDeleteRow(row.rowNumber)}
          title="Exclude this row from the import"
        />
      ),
    },
    { title: "Row #", dataIndex: "rowNumber", width: 70, fixed: "left" },
    { title: "BioId", dataIndex: "bioId", width: 90 },
    { title: "First Name", dataIndex: "firstName", width: 120 },
    { title: "Middle Name", dataIndex: "middleName", width: 120 },
    { title: "Last Name", dataIndex: "lastName", width: 120 },
    { title: "Suffix", dataIndex: "suffix", width: 80 },
    { title: "Gender", dataIndex: "gender", width: 90 },
    { title: "Civil Status", dataIndex: "civilStatus", width: 110 },
    { title: "Blood Type", dataIndex: "bloodType", width: 100 },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      width: 120,
      render: formatDate,
    },
    { title: "Email", dataIndex: "email", width: 180 },
    { title: "Contact No.", dataIndex: "contactNo", width: 130 },
    { title: "Address 1", dataIndex: "address1", width: 160 },
    { title: "Address 2", dataIndex: "address2", width: 160 },
    { title: "Branch", dataIndex: "branchCode", width: 100 },
    { title: "Department", dataIndex: "departmentName", width: 140 },
    { title: "Client", dataIndex: "clientName", width: 140 },
    { title: "Rest Day 1", dataIndex: "restDay1", width: 100 },
    { title: "Rest Day 2", dataIndex: "restDay2", width: 100 },
    { title: "Payroll Group", dataIndex: "payrollGroup", width: 140 },
    { title: "Cut-Off 1", dataIndex: "cutoff1", width: 90 },
    { title: "EOM 1", dataIndex: "eom1", width: 70, render: yesNo },
    { title: "Cut-Off 2", dataIndex: "cutoff2", width: 90 },
    { title: "EOM 2", dataIndex: "eom2", width: 70, render: yesNo },
    { title: "Cut-Off 3", dataIndex: "cutoff3", width: 90 },
    { title: "EOM 3", dataIndex: "eom3", width: 70, render: yesNo },
    { title: "Cut-Off 4", dataIndex: "cutoff4", width: 90 },
    { title: "EOM 4", dataIndex: "eom4", width: 70, render: yesNo },
    { title: "Shift", dataIndex: "shiftName", width: 120 },
    { title: "Shift Type", dataIndex: "shiftType", width: 100 },
    { title: "AM In", dataIndex: "amIn", width: 90 },
    { title: "AM Out", dataIndex: "amOut", width: 90 },
    { title: "PM In", dataIndex: "pmIn", width: 90 },
    { title: "PM Out", dataIndex: "pmOut", width: 90 },
    {
      title: "Paid Lunch Break",
      dataIndex: "paidLunchBreak",
      width: 130,
      render: yesNo,
    },
    { title: "Break Duration", dataIndex: "breakDuration", width: 120 },
    {
      title: "Max Working Minutes",
      dataIndex: "maxWorkingMinutes",
      width: 150,
    },
    { title: "Salary Type", dataIndex: "salaryType", width: 110 },
    { title: "Daily Rate", dataIndex: "dailyRate", width: 100 },
    { title: "Monthly Rate", dataIndex: "monthlyRate", width: 110 },
    {
      title: "Hire Date",
      dataIndex: "hireDate",
      width: 110,
      render: formatDate,
    },
    { title: "SSS", dataIndex: "sss", width: 110 },
    { title: "PHIC", dataIndex: "phic", width: 110 },
    { title: "HDMF", dataIndex: "hdmf", width: 110 },
    { title: "TIN", dataIndex: "tin", width: 110 },
    { title: "Bank Name", dataIndex: "bankName", width: 130 },
    { title: "Bank No.", dataIndex: "bankNo", width: 130 },
    {
      title: "Issues",
      key: "issues",
      width: 220,
      fixed: "right",
      render: (_, row) =>
        row.errors.length === 0 ? (
          <Tag color="success">OK</Tag>
        ) : (
          <Tooltip title={row.errors.join("; ")}>
            <Tag color="error">{row.errors.length} issue(s)</Tag>
          </Tooltip>
        ),
    },
  ];
}

export default function EmployeeImportPreviewModal({
  open,
  onClose,
  rows,
  onDeleteRow,
  onConfirm,
  confirming,
}: Props) {
  const { mutate: exportErrors, isPending: exporting } =
    useExportImportErrors();
  const columns = buildColumns(onDeleteRow);

  const errorRows = rows.filter((r) => r.errors.length > 0);
  const hasErrors = errorRows.length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      className="modal-fullscreen"
      title="Preview Import"
      destroyOnClose
      footer={
        <div className="flex items-center justify-between">
          <div>
            {hasErrors && (
              <Button
                icon={<DownloadOutlined />}
                loading={exporting}
                onClick={() => exportErrors(errorRows)}
              >
                Download Rows With Errors
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              loading={confirming}
              disabled={hasErrors || rows.length === 0}
              onClick={onConfirm}
            >
              Confirm Import
            </Button>
          </div>
        </div>
      }
    >
      {hasErrors && (
        <Text type="danger" className="mb-2 block">
          {errorRows.length} of {rows.length} row(s) have issues and must be
          fixed before importing.
        </Text>
      )}
      <Table
        rowKey="rowNumber"
        columns={columns}
        dataSource={rows}
        size="small"
        pagination={{ pageSize: 50, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
      />
    </Modal>
  );
}
