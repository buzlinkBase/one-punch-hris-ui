import { useState } from "react";
import type { Key } from "react";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import {
  Alert,
  Button,
  Card,
  Collapse,
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
import { ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { useDevices } from "@/app/modules/biometric/manage-devices/hooks/use-device-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import type { EmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/models/api/request/employee-filter.model";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import type { DeviceCommandRecord } from "../../models/api/response/device-command-record.model";
import type { SetEmployeeCommandPayload } from "../../models/api/request/set-employee-command.model";
import type { SyncBioPayload } from "../../models/api/request/sync-bio.model";
import {
  usePendingCommands,
  useDeleteCommand,
  useEnrollFingerprint,
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
  useQueryTemplatesBulk,
  useRegistryReset,
  useDeleteEmployeesBulk,
} from "../../hooks/use-commands-queries";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

const BIO_ID_REQUIRED_NOTE =
  "Only employees who already have a Bio ID appear here. Bio ID is a critical, device-level identifier — it isn't assigned from this screen; set it on the employee's record first (Setup → Employee).";

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
        <PermissionGate permission="Biometric Setup:Delete">
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
        </PermissionGate>
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

  const { data: employeeData = [] } = useEmployeeFilter();
  const employeeOptions = employeeData
    .filter((e) => (e.bioId ?? 0) > 0)
    .map((e) => ({ value: e.id, label: e.name ?? e.id, bioId: e.bioId! }));

  const { mutateAsync: enrollFP, isPending: enrollingFP } =
    useEnrollFingerprint();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
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
          <PermissionGate permission="Biometric Setup:Create">
            <Button
              type="primary"
              htmlType="submit"
              loading={enrollingFP}
              block
            >
              Queue Enroll Command
            </Button>
          </PermissionGate>
        </Form>
      </Card>
    </div>
  );
}

// ─── Section: Query Templates ─────────────────────────────────────────────────

function QueryTemplatesSection({ sn }: { sn: string }) {
  const [filter, setFilter] = useState<EmployeeFilter>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [fingerIndex, setFingerIndex] = useState<number | undefined>();

  const { data: employeeData = [], isFetching } = useEmployeeFilter(filter);
  const { data: departments = [] } = useDepartments();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: clients = [] } = useClients();

  const { mutateAsync: queryAll, isPending: queryingAll } = useQueryTemplates();
  const { mutateAsync: queryBulk, isPending: queryingBulk } =
    useQueryTemplatesBulk();

  const employees = employeeData.filter((e) => (e.bioId ?? 0) > 0);

  const columns = [
    { title: "Bio ID", dataIndex: "bioId", key: "bioId", width: 80 },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      width: 160,
    },
    { title: "Client", dataIndex: "clientName", key: "clientName", width: 160 },
    {
      title: "Payroll Group",
      dataIndex: "payrollGroupName",
      key: "payrollGroupName",
      width: 140,
    },
  ];

  const fingerLabel =
    fingerIndex !== undefined
      ? (FINGER_OPTIONS.find((f) => f.value === fingerIndex)?.label ??
        String(fingerIndex))
      : "all fingers";

  const handleQuerySelected = async () => {
    const selected = employees.filter((e) => selectedRowKeys.includes(e.id));
    await queryBulk({
      sn,
      pins: selected.map((e) => String(e.bioId!)),
      fid: fingerIndex,
    });
    setSelectedRowKeys([]);
  };

  return (
    <div className="flex flex-col gap-3 pt-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All Departments"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          value={filter.departmentId ?? undefined}
          onChange={(val) =>
            setFilter((f) => ({ ...f, departmentId: val ?? null }))
          }
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All Payroll Groups"
          options={payrollGroups.map((p) => ({ value: p.id, label: p.name }))}
          value={filter.payrollGroupId ?? undefined}
          onChange={(val) =>
            setFilter((f) => ({ ...f, payrollGroupId: val ?? null }))
          }
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All Clients"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          value={filter.clientId ?? undefined}
          onChange={(val) =>
            setFilter((f) => ({ ...f, clientId: val ?? null }))
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 shrink-0">Finger:</span>
        <Select
          allowClear
          placeholder="All fingers"
          options={FINGER_OPTIONS}
          value={fingerIndex}
          onChange={(val) => setFingerIndex(val as number | undefined)}
          style={{ width: 220 }}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={employees}
        columns={columns}
        loading={isFetching}
        size="small"
        pagination={{ pageSize: 15, size: "small" }}
        scroll={{ x: "max-content" }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        locale={{ emptyText: "No employees with a Bio ID found" }}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {selectedRowKeys.length > 0
            ? `${selectedRowKeys.length} employee${selectedRowKeys.length !== 1 ? "s" : ""} selected — ${fingerLabel}`
            : `No selection — use Query All to query every employee on device`}
        </span>
        <PermissionGate permission="Biometric Setup:View">
          <Space>
            <Button
              loading={queryingAll}
              onClick={() => queryAll({ sn, fid: fingerIndex })}
            >
              Query All
            </Button>
            <Button
              type="primary"
              disabled={selectedRowKeys.length === 0}
              loading={queryingBulk}
              onClick={handleQuerySelected}
            >
              Query Selected ({selectedRowKeys.length})
            </Button>
          </Space>
        </PermissionGate>
      </div>
    </div>
  );
}

// ─── Sync Employees Panel ─────────────────────────────────────────────────────

interface RowOverride {
  privilege: number;
  password: string;
  card: string;
}

function SyncEmployeesPanel({
  onSync,
  syncing,
}: {
  onSync: (payload: SetEmployeeCommandPayload[]) => Promise<void>;
  syncing: boolean;
}) {
  const [filter, setFilter] = useState<EmployeeFilter>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [overrides, setOverrides] = useState<Record<string, RowOverride>>({});

  const { data: employeeData = [], isFetching } = useEmployeeFilter(filter);
  const { data: departments = [] } = useDepartments();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: clients = [] } = useClients();

  const employees = employeeData.filter((e) => (e.bioId ?? 0) > 0);

  const getOverride = (row: (typeof employees)[number]): RowOverride =>
    overrides[row.id] ?? { privilege: 0, password: "", card: "" };

  const setField = (
    row: (typeof employees)[number],
    field: keyof RowOverride,
    value: string | number,
  ) =>
    setOverrides((prev) => ({
      ...prev,
      [row.id]: { ...getOverride(row), [field]: value },
    }));

  const columns = [
    { title: "Bio ID", dataIndex: "bioId", key: "bioId", width: 75 },
    { title: "Name", dataIndex: "name", key: "name", width: 180 },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      width: 150,
    },
    { title: "Client", dataIndex: "clientName", key: "clientName", width: 150 },
    {
      title: "Privilege",
      key: "privilege",
      width: 130,
      render: (_: unknown, row: (typeof employees)[number]) => (
        <Select
          size="small"
          options={PRIVILEGE_OPTIONS}
          value={getOverride(row).privilege}
          onChange={(val) => setField(row, "privilege", val as number)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Password",
      key: "password",
      width: 120,
      render: (_: unknown, row: (typeof employees)[number]) => (
        <Input
          size="small"
          placeholder="(none)"
          value={getOverride(row).password}
          onChange={(e) => setField(row, "password", e.target.value)}
        />
      ),
    },
    {
      title: "Card No",
      key: "card",
      width: 120,
      render: (_: unknown, row: (typeof employees)[number]) => (
        <Input
          size="small"
          placeholder="(none)"
          value={getOverride(row).card}
          onChange={(e) => setField(row, "card", e.target.value)}
        />
      ),
    },
  ];

  const handleSync = async () => {
    const selected = employees.filter((e) => selectedRowKeys.includes(e.id));
    const payload: SetEmployeeCommandPayload[] = selected.map((e) => ({
      bioId: e.bioId!,
      name: e.name ?? "",
      ...getOverride(e),
    }));
    await onSync(payload);
    setSelectedRowKeys([]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All Departments"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          value={filter.departmentId ?? undefined}
          onChange={(val) =>
            setFilter((f) => ({ ...f, departmentId: val ?? null }))
          }
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All Payroll Groups"
          options={payrollGroups.map((p) => ({ value: p.id, label: p.name }))}
          value={filter.payrollGroupId ?? undefined}
          onChange={(val) =>
            setFilter((f) => ({ ...f, payrollGroupId: val ?? null }))
          }
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All Clients"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          value={filter.clientId ?? undefined}
          onChange={(val) =>
            setFilter((f) => ({ ...f, clientId: val ?? null }))
          }
        />
      </div>

      <Table
        rowKey="id"
        dataSource={employees}
        columns={columns}
        loading={isFetching}
        size="small"
        pagination={{ pageSize: 15, size: "small" }}
        scroll={{ x: "max-content" }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        locale={{ emptyText: "No employees with a Bio ID found" }}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {selectedRowKeys.length} employee
          {selectedRowKeys.length !== 1 ? "s" : ""} selected
        </span>
        <PermissionGate permission="Biometric Setup:Edit">
          <Button
            type="primary"
            disabled={selectedRowKeys.length === 0}
            loading={syncing}
            onClick={handleSync}
          >
            Sync Selected ({selectedRowKeys.length})
          </Button>
        </PermissionGate>
      </div>
    </div>
  );
}

// ─── Section: Sync ───────────────────────────────────────────────────────────

function SyncSection({ sn }: { sn: string }) {
  const [bioJson, setBioJson] = useState("");
  const [faceJson, setFaceJson] = useState("");

  const { mutateAsync: syncEmployees, isPending: syncingEmp } =
    useSyncEmployees();
  const { mutateAsync: syncBiometric, isPending: syncingBio } =
    useSyncBiometric();
  const { mutateAsync: syncFace, isPending: syncingFace } = useSyncFace();

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
        <SyncEmployeesPanel
          syncing={syncingEmp}
          onSync={(payload) => syncEmployees({ sn, payload })}
        />
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
            <PermissionGate permission="Biometric Setup:Edit">
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
            </PermissionGate>
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
            <PermissionGate permission="Biometric Setup:Edit">
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
            </PermissionGate>
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
          <PermissionGate permission="Biometric Setup:Edit">
            <Button
              type="primary"
              block
              loading={settingTime}
              onClick={() => setTime({ sn, autoServerTime })}
            >
              Set Time
            </Button>
          </PermissionGate>
        </Space>
      </Card>

      {/* Attendance Status */}
      <Card title="Attendance Recording" size="small">
        <PermissionGate permission="Biometric Setup:Edit">
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
        </PermissionGate>
      </Card>

      {/* Pull Attendance */}
      <Card title="Pull Attendance Logs" size="small">
        <PermissionGate permission="Biometric Setup:View">
          <Space direction="vertical" className="w-full">
            <MobileRangePicker
              className="w-full"
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              value={pullDates}
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
                  startDate: pullDates[0].format("YYYY-MM-DDTHH:mm:ss"),
                  endDate: pullDates[1].format("YYYY-MM-DDTHH:mm:ss"),
                });
              }}
            >
              Pull Attendance
            </Button>
          </Space>
        </PermissionGate>
      </Card>

      {/* Reboot */}
      <Card title="Reboot Device" size="small">
        <p className="text-xs text-gray-500 mb-3">
          The device will restart and be briefly unavailable.
        </p>
        <PermissionGate permission="Biometric Setup:Edit">
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
        </PermissionGate>
      </Card>

      {/* Clear Logs */}
      <Card title="Clear Attendance Logs" size="small">
        <p className="text-xs text-gray-500 mb-3">
          Permanently deletes all attendance records stored on the device.
        </p>
        <PermissionGate permission="Biometric Setup:Edit">
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
        </PermissionGate>
      </Card>

      {/* Clear Admin */}
      <Card title="Clear Admin Privileges" size="small">
        <p className="text-xs text-gray-500 mb-3">
          Removes admin privileges from all users on this device.
        </p>
        <PermissionGate permission="Biometric Setup:Edit">
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
        </PermissionGate>
      </Card>

      {/* Registry Reset */}
      <Card title="Registry Reset" size="small">
        <p className="text-xs text-gray-500 mb-3">
          Resets sync timestamps to force a full re-sync from the server on next
          connection.
        </p>
        <PermissionGate permission="Biometric Setup:Edit">
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
        </PermissionGate>
      </Card>
    </div>
  );
}

// ─── Section: Delete ─────────────────────────────────────────────────────────

function BulkDeleteEmployeePanel({ sn }: { sn: string }) {
  const [filter, setFilter] = useState<EmployeeFilter>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const { data: employeeData = [], isFetching } = useEmployeeFilter(filter);
  const { data: departments = [] } = useDepartments();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: clients = [] } = useClients();
  const { mutateAsync: deleteEmployees, isPending: deleting } =
    useDeleteEmployeesBulk();

  const employees = employeeData.filter((e) => (e.bioId ?? 0) > 0);

  const columns = [
    { title: "Bio ID", dataIndex: "bioId", key: "bioId", width: 80 },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      width: 160,
    },
    { title: "Client", dataIndex: "clientName", key: "clientName", width: 160 },
    {
      title: "Payroll Group",
      dataIndex: "payrollGroupName",
      key: "payrollGroupName",
      width: 140,
    },
  ];

  const handleDelete = async () => {
    const selected = employees.filter((e) => selectedRowKeys.includes(e.id));
    await deleteEmployees({ sn, bioIds: selected.map((e) => e.bioId!) });
    setSelectedRowKeys([]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All Departments"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          value={filter.departmentId ?? undefined}
          onChange={(val) =>
            setFilter((f) => ({ ...f, departmentId: val ?? null }))
          }
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All Payroll Groups"
          options={payrollGroups.map((p) => ({ value: p.id, label: p.name }))}
          value={filter.payrollGroupId ?? undefined}
          onChange={(val) =>
            setFilter((f) => ({ ...f, payrollGroupId: val ?? null }))
          }
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All Clients"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          value={filter.clientId ?? undefined}
          onChange={(val) =>
            setFilter((f) => ({ ...f, clientId: val ?? null }))
          }
        />
      </div>

      <Table
        rowKey="id"
        dataSource={employees}
        columns={columns}
        loading={isFetching}
        size="small"
        pagination={{ pageSize: 10, size: "small" }}
        scroll={{ x: "max-content" }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        locale={{ emptyText: "No employees with a Bio ID found" }}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {selectedRowKeys.length} employee
          {selectedRowKeys.length !== 1 ? "s" : ""} selected
        </span>
        <PermissionGate permission="Biometric Setup:Delete">
          <Popconfirm
            title={`Delete ${selectedRowKeys.length} employee(s) from device?`}
            description="This will remove their records from the device."
            onConfirm={handleDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              danger
              disabled={selectedRowKeys.length === 0}
              loading={deleting}
            >
              Delete Selected ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
        </PermissionGate>
      </div>
    </div>
  );
}

function DeleteSection({ sn }: { sn: string }) {
  const collapseItems = [
    {
      key: "delete-employee",
      label: "Delete Employee",
      children: <BulkDeleteEmployeePanel sn={sn} />,
    },
  ];

  return (
    <div className="pt-3">
      <Collapse items={collapseItems} defaultActiveKey={["delete-employee"]} />
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
          key: "query-templates",
          label: "Query Templates",
          children: <QueryTemplatesSection sn={selectedSN} />,
        },
        {
          key: "sync",
          label: "Sync",
          children: <SyncSection sn={selectedSN} />,
        },
        {
          key: "delete",
          label: "Delete",
          children: <DeleteSection sn={selectedSN} />,
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
          <>
            <Alert
              type="info"
              showIcon
              banner
              message={BIO_ID_REQUIRED_NOTE}
              className="mb-3"
              style={{ fontSize: 12 }}
            />
            <Tabs key={selectedSN} defaultActiveKey="enroll" items={tabItems} />
          </>
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
