import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { InboxOutlined } from "@ant-design/icons";
import { UPLOAD_ATTENDANCE_LABEL } from "../../constants/label.const";
import { useUploadAttendanceLog } from "../../hooks/useUploadAttendanceQueries";
import { useBranches } from "@/app/modules/setup/branch/hooks/useBranchQueries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/useOperationAreaQueries";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ALLOWED_EXTENSIONS = [".dat", ".csv", ".txt", ".xls"];

export default function UploadAttendanceList() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [operationAreaId, setOperationAreaId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();
  const { data: areas = [], isLoading: isAreasLoading } = useOperationAreas();
  const { mutateAsync: upload, isPending: isUploading } =
    useUploadAttendanceLog();

  const branchOptions = branches
    .filter((b) => b.status === "ACTIVE")
    .map((b) => ({ value: b.id, label: `${b.code} - ${b.name}` }));

  const areaOptions = areas
    .filter((a) => a.status === "ACTIVE")
    .map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }));

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
      await upload({ file, branchId, operationAreaId });
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
          {/* Left: branch + file picker */}
          <div className="flex flex-col gap-3">
            <Form layout="vertical">
              <Form.Item label="Branch">
                <Select
                  placeholder="Select branch (optional)"
                  options={branchOptions}
                  loading={isBranchesLoading}
                  value={branchId}
                  onChange={setBranchId}
                  showSearch={{ optionFilterProp: "label" }}
                  allowClear
                />
              </Form.Item>
              <Form.Item label="Operation Area">
                <Select
                  placeholder="Select operation area (optional)"
                  options={areaOptions}
                  loading={isAreasLoading}
                  value={operationAreaId}
                  onChange={setOperationAreaId}
                  showSearch={{ optionFilterProp: "label" }}
                  allowClear
                />
              </Form.Item>
            </Form>

            <Dragger
              maxCount={1}
              fileList={fileList}
              beforeUpload={beforeUpload}
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
                Supported formats: .dat, .csv, .txt, .xls
              </p>
            </Dragger>

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
          <Space direction="vertical" size="middle">
            <Alert
              type="info"
              showIcon
              message="Supported file formats"
              description={
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
                    <Text strong>.xls</Text> — Excel spreadsheet
                  </li>
                </ul>
              }
            />
            <Alert
              type="warning"
              showIcon
              message="Select the correct branch"
              description="Attendance logs will be tagged to the selected branch. Make sure to choose the branch whose biometric device generated the file."
            />
          </Space>
        </div>
      </Card>
    </div>
  );
}
