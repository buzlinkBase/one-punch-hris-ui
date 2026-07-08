import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Select,
  Typography,
  Upload,
  message,
} from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { DeleteOutlined, FileOutlined, InboxOutlined } from "@ant-design/icons";
import { UPLOAD_ATTENDANCE_LABEL } from "../../constants/label.const";
import { useUploadAttendanceLog } from "../../hooks/use-upload-attendance-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ALLOWED_EXTENSIONS = [".dat", ".csv", ".txt", ".xls", ".xlsx"];

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export default function UploadAttendanceList() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [operationAreaId, setOperationAreaId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();
  const { data: areas = [], isLoading: isAreasLoading } = useOperationAreas();
  const { data: clients = [], isLoading: isClientsLoading } = useClients();
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useDepartments();
  const { mutateAsync: upload, isPending: isUploading } =
    useUploadAttendanceLog();

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: `${b.code} - ${b.name}`,
  }));

  const areaOptions = areas.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}`,
  }));

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.code} - ${d.name}`,
  }));

  const beforeUpload = (file: RcFile) => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      messageApi.error(
        `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
      );
      return Upload.LIST_IGNORE;
    }
    setFileList([
      { uid: file.uid, name: file.name, status: "done", originFileObj: file },
    ]);
    return false;
  };

  const handleUpload = async () => {
    const file = fileList[0]?.originFileObj;
    if (!file) {
      messageApi.warning("Please select a file first.");
      return;
    }

    try {
      await upload({ file, branchId, operationAreaId, clientId, departmentId });
      setFileList([]);
      messageApi.success("Attendance log uploaded successfully.");
    } catch {
      messageApi.error("Upload failed. Please try again.");
    }
  };

  return (
    <div className="content-page">
      {contextHolder}

      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {UPLOAD_ATTENDANCE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Upload biometric device export files to import attendance logs.
            </p>
          </div>
        </div>
      </div>

      <Card title="Upload Attendance Log">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left: filters + file picker */}
          <div className="flex flex-col gap-3">
            <Form layout="vertical">
              <Form.Item label="Branch">
                <Select
                  placeholder="Select branch (optional)"
                  options={branchOptions}
                  loading={isBranchesLoading}
                  value={branchId ?? undefined}
                  onChange={(v: string | undefined) => setBranchId(v ?? null)}
                  showSearch={{ filterOption: filterByLabel }}
                  allowClear
                />
              </Form.Item>
              <Form.Item label="Operation Area">
                <Select
                  placeholder="Select operation area (optional)"
                  options={areaOptions}
                  loading={isAreasLoading}
                  value={operationAreaId ?? undefined}
                  onChange={(v: string | undefined) =>
                    setOperationAreaId(v ?? null)
                  }
                  showSearch={{ filterOption: filterByLabel }}
                  allowClear
                />
              </Form.Item>
              <Form.Item label="Client">
                <Select
                  placeholder="Select client (optional)"
                  options={clientOptions}
                  loading={isClientsLoading}
                  value={clientId ?? undefined}
                  onChange={(v: string | undefined) => setClientId(v ?? null)}
                  showSearch={{ filterOption: filterByLabel }}
                  allowClear
                />
              </Form.Item>
              <Form.Item label="Department">
                <Select
                  placeholder="Select department (optional)"
                  options={departmentOptions}
                  loading={isDepartmentsLoading}
                  value={departmentId ?? undefined}
                  onChange={(v: string | undefined) =>
                    setDepartmentId(v ?? null)
                  }
                  showSearch={{ filterOption: filterByLabel }}
                  allowClear
                />
              </Form.Item>
            </Form>

            <Dragger
              maxCount={1}
              fileList={fileList}
              beforeUpload={beforeUpload}
              showUploadList={false}
              onChange={({ fileList: next }) => {
                if (next.length === 0) setFileList([]);
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag a file here to select
              </p>
              <p className="ant-upload-hint">
                Supported formats: .dat, .csv, .txt, .xls, .xlsx
              </p>
            </Dragger>

            {fileList.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: 6,
                }}
              >
                <FileOutlined style={{ color: "#52c41a", flexShrink: 0 }} />
                <Text style={{ flex: 1, fontSize: 13, wordBreak: "break-all" }}>
                  {fileList[0].name}
                </Text>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setFileList([])}
                />
              </div>
            )}

            <Button
              type="primary"
              loading={isUploading}
              disabled={fileList.length === 0}
              onClick={handleUpload}
              block
            >
              Upload
            </Button>
          </div>

          {/* Right: info panel */}
          <div className="flex flex-col gap-4">
            <Alert
              type="info"
              showIcon
              description={
                <>
                  <Text strong>Supported file formats</Text>
                  <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                    <li>
                      <Text strong>.dat</Text> — biometric device binary export
                    </li>
                    <li>
                      <Text strong>.csv</Text> — comma-separated values
                    </li>
                    <li>
                      <Text strong>.txt</Text> — space/tab-delimited text log
                    </li>
                    <li>
                      <Text strong>.xls / .xlsx</Text> — Excel spreadsheet
                    </li>
                  </ul>
                </>
              }
            />
            <Alert
              type="warning"
              showIcon
              description="Attendance logs will be tagged to the selected branch/area. Make sure to choose the branch/area whose biometric device generated the file."
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
