import { useState } from "react";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import {
  Button,
  Card,
  Collapse,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { useDevices } from "@/app/modules/biometric/manage-devices/hooks/use-device-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import type { DeviceCommandRecord } from "../../models/api/response/device-command-record.model";
import type { SetEmployeeCommandPayload } from "../../models/api/request/set-employee-command.model";
import type { SyncBioPayload } from "../../models/api/request/sync-bio.model";
import {
  usePendingCommands,
  useDeleteCommand,
  useEnrollFingerprint,
  useEnrollFace,
  useSyncEmployees,
  useSyncBiometric,
  useSyncFace,
  useReboot,
  useClearLogs,
  useSetTime,
  useEnableAttendance,
  useClearAdmin,
  usePullAttendance,
  useQueryTemplates,
  useRegistryReset,
} from "../../hooks/use-commands-queries";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const FINGER_OPTIONS = [
  { value: 0, label: "0 – Left Pinky" },
  { value: 1, label: "1 – Left Ring" },
  { value: 2, label: "2 – Left Middle" },
  { value: 3, label: "3 – Left Index" },
  { value: 4, label: "4 – Left Thumb" },
  { value: 5, label: "5 – Right Thumb" },
  { value: 6, label: "6 – Right Index" },
  { value: 7, label: "7 – Right Middle" },
  { value: 8, label: "8 – Right Ring" },
  { value: 9, label: "9 – Right Pinky" },
];

const FACE_TYPE_OPTIONS = [
  { value: 1, label: "Type 1" },
  { value: 2, label: "Type 2 (Default)" },
];

const PRIVILEGE_OPTIONS = [
  { value: 0, label: "User (0)" },
  { value: 2, label: "Enroller (2)" },
  { value: 6, label: "Manager (6)" },
  { value: 14, label: "Admin (14)" },
];

// ─── Section: Pending Commands ───────────────────────────────────────────────

function PendingCommandsSection({ sn }: { sn: string }) {
  const {
    data: commands = [],
    isLoading,
    refetch,
    isFetching,
  } = usePendingCommands(sn);
  const { mutate: removeCmd, isPending: removing } = useDeleteCommand();
  const { widths, handleResize } = useResizableColumns({
    sn: 200,
    commandType: 220,
  });

  const columns: ColumnsType<DeviceCommandRecord> = [
    {
      title: "Serial No",
      dataIndex: "sn",
      key: "sn",
      width: widths.sn,
      onHeaderCell: () =>
        ({
          width: widths.sn,
          onResize: (w: number) => handleResize("sn", w),
        }) as object,
      render: (v: string) => <span className="font-mono text-xs">{v}</span>,
    },
    {
      title: "Type",
      dataIndex: "commandType",
      key: "commandType",
      width: widths.commandType,
      onHeaderCell: () =>
        ({
          width: widths.commandType,
          onResize: (w: number) => handleResize("commandType", w),
        }) as object,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: DeviceCommandRecord) => (
        <Popconfirm
          title="Remove this command?"
          onConfirm={() => removeCmd(record.id)}
          okText="Remove"
          cancelText="Cancel"
        >
          <Button type="link" danger size="small" loading={removing}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3 pt-3">
      <div className="flex justify-end">
        <Button
          icon={<ReloadOutlined spin={isFetching} />}
          onClick={() => refetch()}
          loading={isFetching && !isLoading}
        >
          Refresh
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={commands}
        columns={columns}
        components={{ header: { cell: ResizableTitle } }}
        size="small"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No pending commands for this device" }}
      />
    </div>
  );
}

// ─── Section: Enroll ─────────────────────────────────────────────────────────

function EnrollSection({ sn }: { sn: string }) {
  const [fpForm] = Form.useForm();
  const [faceForm] = Form.useForm();
  const [queryForm] = Form.useForm();

  const { data: employeeData = [] } = useEmployeeFilter();
  const employeeOptions = employeeData
    .filter((e) => (e.bioId ?? 0) > 0)
    .map((e) => ({ value: e.id, label: e.name ?? e.id, bioId: e.bioId! }));

  const { mutateAsync: enrollFP, isPending: enrollingFP } =
    useEnrollFingerprint();
  const { mutateAsync: enrollFace, isPending: enrollingFace } = useEnrollFace();
  const { mutateAsync: queryTemplates, isPending: querying } =
    useQueryTemplates();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
      {/* Enroll Fingerprint */}
      <Card title="Enroll Fingerprint" size="small">
        <Form
          form={fpForm}
          layout="vertical"
          onFinish={async (v: { bioId: number; fingerIndex: number }) => {
            await enrollFP({
              sn,
              payload: { bioId: v.bioId, fingerIndex: v.fingerIndex },
            });
            fpForm.resetFields();
          }}
        >
          <Form.Item label="Employee" required>
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder="Select employee"
              options={employeeOptions}
              onChange={(val, opt) => {
                fpForm.setFieldValue(
                  "bioId",
                  val ? (opt as (typeof employeeOptions)[number]).bioId : null,
                );
              }}
            />
          </Form.Item>
          <Form.Item
            name="bioId"
            label="Bio ID"
            rules={[{ required: true, message: "Required" }]}
          >
            <InputNumber className="w-full" readOnly />
          </Form.Item>
          <Form.Item
            name="fingerIndex"
            label="Finger"
            rules={[{ required: true, message: "Required" }]}
          >
            <Select options={FINGER_OPTIONS} placeholder="Select finger" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={enrollingFP} block>
            Queue Enroll Command
          </Button>
        </Form>
      </Card>

      {/* Enroll Face */}
      <Card title="Enroll Face" size="small">
        <Form
          form={faceForm}
          layout="vertical"
          initialValues={{ faceType: 2, overwrite: true }}
          onFinish={async (v: {
            bioId: number;
            cardNo: string;
            faceType: number;
            overwrite: boolean;
          }) => {
            await enrollFace({ sn, payload: v });
            faceForm.resetFields();
          }}
        >
          <Form.Item label="Employee" required>
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder="Select employee"
              options={employeeOptions}
              onChange={(val, opt) => {
                faceForm.setFieldValue(
                  "bioId",
                  val ? (opt as (typeof employeeOptions)[number]).bioId : null,
                );
              }}
            />
          </Form.Item>
          <Form.Item
            name="bioId"
            label="Bio ID"
            rules={[{ required: true, message: "Required" }]}
          >
            <InputNumber className="w-full" readOnly />
          </Form.Item>
          <Form.Item
            name="cardNo"
            label="Card No"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="e.g. 12345678" />
          </Form.Item>
          <Form.Item name="faceType" label="Face Type">
            <Select options={FACE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="overwrite" label="Overwrite" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={enrollingFace}
            block
          >
            Queue Enroll Command
          </Button>
        </Form>
      </Card>

      {/* Query Templates */}
      <Card title="Query Templates" size="small">
        <Form
          form={queryForm}
          layout="vertical"
          onFinish={async (v: { pin?: string; fid?: number | null }) => {
            await queryTemplates({
              sn,
              pin: v.pin || undefined,
              fid: v.fid ?? undefined,
            });
            queryForm.resetFields();
          }}
        >
          <Form.Item label="Employee" help="Leave blank to query all users">
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder="Select employee (optional)"
              options={employeeOptions}
              onChange={(val, opt) => {
                queryForm.setFieldValue(
                  "pin",
                  val
                    ? String((opt as (typeof employeeOptions)[number]).bioId)
                    : undefined,
                );
              }}
            />
          </Form.Item>
          <Form.Item name="pin" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="fid"
            label="Finger ID"
            help="Leave blank to query all fingers"
          >
            <Select
              options={FINGER_OPTIONS}
              allowClear
              placeholder="All fingers"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={querying} block>
            Query Templates
          </Button>
        </Form>
      </Card>
    </div>
  );
}

// ─── Section: Sync ───────────────────────────────────────────────────────────

function SyncSection({ sn }: { sn: string }) {
  const [empForm] = Form.useForm<{ employees: SetEmployeeCommandPayload[] }>();
  const [bioJson, setBioJson] = useState("");
  const [faceJson, setFaceJson] = useState("");

  const { data: employeeData = [] } = useEmployeeFilter();
  const employeeOptions = employeeData
    .filter((e) => (e.bioId ?? 0) > 0)
    .map((e) => ({ value: e.id, label: e.name ?? e.id, bioId: e.bioId! }));

  const { mutateAsync: syncEmployees, isPending: syncingEmp } =
    useSyncEmployees();
  const { mutateAsync: syncBiometric, isPending: syncingBio } =
    useSyncBiometric();
  const { mutateAsync: syncFace, isPending: syncingFace } = useSyncFace();

  const handleSyncEmp = async (values: {
    employees: SetEmployeeCommandPayload[];
  }) => {
    if (!values.employees?.length) {
      void message.warning("Add at least one employee");
      return;
    }
    await syncEmployees({ sn, payload: values.employees });
    empForm.resetFields();
  };

  const parseBioJson = (json: string): SyncBioPayload[] | null => {
    try {
      const parsed = JSON.parse(json) as unknown;
      if (!Array.isArray(parsed)) throw new Error();
      return parsed as SyncBioPayload[];
    } catch {
      void message.error(
        "Invalid JSON. Expected an array matching SyncBioPayload[].",
      );
      return null;
    }
  };

  const collapseItems = [
    {
      key: "employees",
      label: "Sync Employees",
      children: (
        <Form
          form={empForm}
          layout="vertical"
          initialValues={{
            employees: [{ privilege: 0, password: "", card: "" }],
          }}
          onFinish={handleSyncEmp}
        >
          <Form.List name="employees">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-lg p-3 mb-2 bg-gray-50/50"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      <Form.Item
                        label="Employee"
                        className="col-span-2"
                        required
                      >
                        <Select
                          showSearch
                          allowClear
                          optionFilterProp="label"
                          placeholder="Select employee"
                          options={employeeOptions}
                          onChange={(val, opt) => {
                            if (!val) {
                              empForm.setFieldValue(
                                ["employees", name, "bioId"],
                                null,
                              );
                              empForm.setFieldValue(
                                ["employees", name, "name"],
                                "",
                              );
                            } else {
                              const o = opt as (typeof employeeOptions)[number];
                              empForm.setFieldValue(
                                ["employees", name, "bioId"],
                                o.bioId,
                              );
                              empForm.setFieldValue(
                                ["employees", name, "name"],
                                o.label,
                              );
                            }
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[name, "bioId"]}
                        label="Bio ID"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <InputNumber className="w-full" readOnly />
                      </Form.Item>
                      <Form.Item name={[name, "name"]} hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item name={[name, "privilege"]} label="Privilege">
                        <Select options={PRIVILEGE_OPTIONS} />
                      </Form.Item>
                      <Form.Item name={[name, "password"]} label="Password">
                        <Input placeholder="Device password" />
                      </Form.Item>
                      <Form.Item name={[name, "card"]} label="Card No">
                        <Input placeholder="Card number" />
                      </Form.Item>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => add({ privilege: 0, password: "", card: "" })}
                >
                  Add Employee
                </Button>
              </>
            )}
          </Form.List>
          <div className="mt-4">
            <Button type="primary" htmlType="submit" loading={syncingEmp}>
              Sync Employees
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: "fingerprints",
      label: "Sync Fingerprint Templates",
      children: (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500 m-0">
            Paste a JSON array of fingerprint templates. Each item:{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">
              {"{ bioId, index, template (base64), dures }"}
            </code>
          </p>
          <Input.TextArea
            value={bioJson}
            onChange={(e) => setBioJson(e.target.value)}
            rows={6}
            placeholder='[{"bioId":1001,"index":0,"template":"BASE64_TEMPLATE","dures":false}]'
            className="font-mono text-xs"
          />
          <div>
            <Button
              type="primary"
              loading={syncingBio}
              disabled={!bioJson.trim()}
              onClick={async () => {
                const payload = parseBioJson(bioJson);
                if (!payload) return;
                await syncBiometric({ sn, payload });
                setBioJson("");
              }}
            >
              Sync Fingerprints
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: "face",
      label: "Sync Face Templates",
      children: (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500 m-0">
            Paste a JSON array of face templates. Each item:{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">
              {"{ bioId, index: 50, template (base64), dures }"}
            </code>
          </p>
          <Input.TextArea
            value={faceJson}
            onChange={(e) => setFaceJson(e.target.value)}
            rows={6}
            placeholder='[{"bioId":1001,"index":50,"template":"BASE64_FACE_TEMPLATE","dures":false}]'
            className="font-mono text-xs"
          />
          <div>
            <Button
              type="primary"
              loading={syncingFace}
              disabled={!faceJson.trim()}
              onClick={async () => {
                const payload = parseBioJson(faceJson);
                if (!payload) return;
                await syncFace({ sn, payload });
                setFaceJson("");
              }}
            >
              Sync Face Templates
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-3">
      <Collapse items={collapseItems} defaultActiveKey={["employees"]} />
    </div>
  );
}

// ─── Section: Device Controls ─────────────────────────────────────────────────

function ControlsSection({ sn }: { sn: string }) {
  const [autoServerTime, setAutoServerTime] = useState(true);
  const [pullDates, setPullDates] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const { mutateAsync: reboot, isPending: rebooting } = useReboot();
  const { mutateAsync: clearLogs, isPending: clearingLogs } = useClearLogs();
  const { mutateAsync: setTime, isPending: settingTime } = useSetTime();
  const { mutateAsync: enableAtt, isPending: togglingAtt } =
    useEnableAttendance();
  const { mutateAsync: clearAdmin, isPending: clearingAdmin } = useClearAdmin();
  const { mutateAsync: pullAtt, isPending: pullingAtt } = usePullAttendance();
  const { mutateAsync: registryReset, isPending: resettingReg } =
    useRegistryReset();

  const canPull = Boolean(pullDates?.[0] && pullDates?.[1]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
      {/* Set Time */}
      <Card title="Set Device Time" size="small">
        <Space direction="vertical" className="w-full">
          <Space>
            <Switch checked={autoServerTime} onChange={setAutoServerTime} />
            <span className="text-sm text-gray-600">
              {autoServerTime ? "Auto Server Time" : "Current Server Time"}
            </span>
          </Space>
          <Button
            type="primary"
            block
            loading={settingTime}
            onClick={() => setTime({ sn, autoServerTime })}
          >
            Set Time
          </Button>
        </Space>
      </Card>

      {/* Attendance Status */}
      <Card title="Attendance Recording" size="small">
        <Space direction="vertical" className="w-full">
          <Button
            type="default"
            block
            loading={togglingAtt}
            onClick={() => enableAtt({ sn, enable: 1 })}
          >
            Enable Attendance
          </Button>
          <Popconfirm
            title="Disable attendance recording?"
            description="The device will stop recording punches."
            onConfirm={() => enableAtt({ sn, enable: 0 })}
            okText="Disable"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger block loading={togglingAtt}>
              Disable Attendance
            </Button>
          </Popconfirm>
        </Space>
      </Card>

      {/* Pull Attendance */}
      <Card title="Pull Attendance Logs" size="small">
        <Space direction="vertical" className="w-full">
          <RangePicker
            className="w-full"
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            onChange={(vals) =>
              setPullDates(vals as [Dayjs | null, Dayjs | null] | null)
            }
          />
          <Button
            type="primary"
            block
            loading={pullingAtt}
            disabled={!canPull}
            onClick={() => {
              if (!pullDates?.[0] || !pullDates?.[1]) return;
              void pullAtt({
                sn,
                startDate: pullDates[0].toISOString(),
                endDate: pullDates[1].toISOString(),
              });
            }}
          >
            Pull Attendance
          </Button>
        </Space>
      </Card>

      {/* Reboot */}
      <Card title="Reboot Device" size="small">
        <p className="text-xs text-gray-500 mb-3">
          The device will restart and be briefly unavailable.
        </p>
        <Popconfirm
          title="Reboot this device?"
          onConfirm={() => reboot(sn)}
          okText="Reboot"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button danger block loading={rebooting}>
            Reboot
          </Button>
        </Popconfirm>
      </Card>

      {/* Clear Logs */}
      <Card title="Clear Attendance Logs" size="small">
        <p className="text-xs text-gray-500 mb-3">
          Permanently deletes all attendance records stored on the device.
        </p>
        <Popconfirm
          title="Clear all attendance logs?"
          description="This action cannot be undone."
          onConfirm={() => clearLogs(sn)}
          okText="Clear"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button danger block loading={clearingLogs}>
            Clear Logs
          </Button>
        </Popconfirm>
      </Card>

      {/* Clear Admin */}
      <Card title="Clear Admin Privileges" size="small">
        <p className="text-xs text-gray-500 mb-3">
          Removes admin privileges from all users on this device.
        </p>
        <Popconfirm
          title="Remove all admin privileges?"
          onConfirm={() => clearAdmin(sn)}
          okText="Clear"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button danger block loading={clearingAdmin}>
            Clear Admin
          </Button>
        </Popconfirm>
      </Card>

      {/* Registry Reset */}
      <Card title="Registry Reset" size="small">
        <p className="text-xs text-gray-500 mb-3">
          Resets sync timestamps to force a full re-sync from the server on next
          connection.
        </p>
        <Popconfirm
          title="Reset device registry?"
          description="Sync counters will be zeroed. A full re-sync will occur."
          onConfirm={() => registryReset(sn)}
          okText="Reset"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button danger block loading={resettingReg}>
            Registry Reset
          </Button>
        </Popconfirm>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EnrollBiometrics() {
  const [selectedSN, setSelectedSN] = useState<string | undefined>();
  const { data: devices = [], isLoading: loadingDevices } = useDevices();

  const deviceOptions = devices
    .filter((d) => d.status === "Active")
    .map((d) => ({
      value: d.sn,
      label: d.description ? `${d.sn} — ${d.description}` : d.sn,
    }));

  const selectedDevice = devices.find((d) => d.sn === selectedSN);

  const tabItems = selectedSN
    ? [
        {
          key: "pending",
          label: "Pending Commands",
          children: <PendingCommandsSection sn={selectedSN} />,
        },
        {
          key: "enroll",
          label: "Enroll",
          children: <EnrollSection sn={selectedSN} />,
        },
        {
          key: "sync",
          label: "Sync",
          children: <SyncSection sn={selectedSN} />,
        },
        {
          key: "controls",
          label: "Device Controls",
          children: <ControlsSection sn={selectedSN} />,
        },
      ]
    : [];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Enroll Biometrics
            </Title>
            <p className="page-toolbar-subtitle">
              Send commands to biometric devices and manage enrollments.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b flex items-center gap-3">
        <span className="text-sm font-medium shrink-0">Target Device:</span>
        <Select
          className="min-w-72"
          options={deviceOptions}
          loading={loadingDevices}
          value={selectedSN}
          onChange={(val) => setSelectedSN(val)}
          placeholder="Select a device by serial number"
          showSearch
          allowClear
          optionFilterProp="label"
          notFoundContent={
            loadingDevices ? "Loading..." : "No active devices found"
          }
        />
        {selectedSN && (
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Tag color="success">{selectedSN}</Tag>
            {selectedDevice?.state && (
              <Tag color="processing">{selectedDevice.state}</Tag>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        {selectedSN ? (
          <Tabs key={selectedSN} defaultActiveKey="enroll" items={tabItems} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-65 text-center rounded-xl border border-emerald-100 bg-emerald-50/40 mt-4">
            <p className="text-base font-medium text-emerald-900">
              No device selected
            </p>
            <p className="text-sm text-emerald-700">
              Select an active biometric device above to send commands.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
