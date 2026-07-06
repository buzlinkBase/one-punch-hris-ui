import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  DatePicker,
  Form,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  ClearOutlined,
  FilterOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UploadAttendanceTable from "../../components/UploadAttendanceTable";
import { UPLOAD_ATTENDANCE_LABEL } from "../../constants/label.const";
import {
  useUploadAttendanceEmployees,
  useUploadAttendanceRecords,
  useUploadRawAttendanceLog,
} from "../../hooks/useUploadAttendanceQueries";
import type { UploadAttendanceFilter } from "../../models/api/request/upload-attendance-filter.model";

const { Title, Text } = Typography;

export default function UploadAttendanceList() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState<UploadAttendanceFilter>({});
  const [pending, setPending] = useState<UploadAttendanceFilter>({});
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const activeFilterCount = [filter.fromDate, filter.employeeId].filter(
    Boolean,
  ).length;

  const { data: records = [], isLoading } = useUploadAttendanceRecords(filter);
  const { data: employees = [] } = useUploadAttendanceEmployees();
  const { mutateAsync: uploadRawLog, isPending: isUploading } =
    useUploadRawAttendanceLog();

  const handleSearch = () => setFilter(pending);

  const handleClear = () => {
    setPending({});
    setFilter({});
    setFiltersOpen(false);
  };

  const handleUpload = async () => {
    if (!selectedFile?.originFileObj) {
      messageApi.warning("Please browse and select a raw DTR log file first.");
      return;
    }

    await uploadRawLog(selectedFile.originFileObj);
    setSelectedFile(null);
    messageApi.success("Raw DTR log uploaded successfully.");
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
              Browse and upload raw DTR logs, then review employee time log
              entries in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen((v) => !v)}
                type={filtersOpen ? "default" : "text"}
              >
                Filters
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <Card size="small" className="mb-4">
          <Form layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
              <Form.Item
                label={UPLOAD_ATTENDANCE_LABEL.FILTER_FROM_DATE}
                className="mb-0"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  value={pending.fromDate ? dayjs(pending.fromDate) : null}
                  onChange={(date) =>
                    setPending((current) => ({
                      ...current,
                      fromDate: date?.format("YYYY-MM-DD"),
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={UPLOAD_ATTENDANCE_LABEL.FILTER_TO_DATE}
                className="mb-0"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  value={pending.toDate ? dayjs(pending.toDate) : null}
                  onChange={(date) =>
                    setPending((current) => ({
                      ...current,
                      toDate: date?.format("YYYY-MM-DD"),
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={UPLOAD_ATTENDANCE_LABEL.FILTER_EMPLOYEE}
                className="mb-0"
              >
                <Select
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="All Employees"
                  options={employees}
                  value={pending.employeeId}
                  onChange={(value) =>
                    setPending((current) => ({ ...current, employeeId: value }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button icon={<ClearOutlined />} onClick={handleClear}>
                Clear
              </Button>
              <Button
                icon={<FilterOutlined />}
                type="primary"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <Card className="mb-4" title="Raw DTR Log Upload">
        <Space direction="vertical" size="middle" className="w-full">
          <Alert
            type="info"
            showIcon
            message="Upload a .csv or .txt raw DTR log file"
            description="Use Browse to select a file, then click Upload File to import attendance logs."
          />

          <Space wrap>
            <Upload
              maxCount={1}
              accept=".csv,.txt"
              beforeUpload={(file) => {
                setSelectedFile(file);
                return false;
              }}
              onRemove={() => {
                setSelectedFile(null);
              }}
              fileList={selectedFile ? [selectedFile] : []}
            >
              <Button icon={<UploadOutlined />}>Browse File</Button>
            </Upload>

            <Button
              type="primary"
              loading={isUploading}
              icon={<UploadOutlined />}
              onClick={handleUpload}
            >
              Upload File
            </Button>
          </Space>

          <Text type="secondary">
            Uploaded records are immediately reflected in the table below.
          </Text>
        </Space>
      </Card>

      <UploadAttendanceTable data={records} loading={isLoading} />
    </div>
  );
}
