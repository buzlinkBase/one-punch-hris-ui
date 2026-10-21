import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import {
  useAssignDeployment,
  useClientPosts,
  useClientSites,
  useDeploymentList,
  useEndDeployment,
} from "../../hooks/use-deployment-queries";
import {
  DATE_FORMAT,
  DEPLOYMENT_PERMISSION,
  ROLE_OPTIONS,
  ROLE_TAG,
} from "../../constants/label.const";
import {
  assignDeploymentFormSchema,
  endDeploymentFormSchema,
  type AssignDeploymentFormValues,
  type EndDeploymentFormValues,
} from "../../models/forms/deployment-form.schema";
import type { DeploymentResponse } from "../../models/api/response/deployment-response.model";
import { FormField } from "../form-field";

const { Text } = Typography;

const dateValue = (value: string) => (value ? dayjs(value) : null);
const toDate = (d: dayjs.Dayjs | null) => (d ? d.format(DATE_FORMAT) : "");

interface DeploymentsPanelProps {
  clientId: string;
}

/** Who is deployed to the client's posts: today, or the whole history; assign and end deployments. */
export function DeploymentsPanel({ clientId }: DeploymentsPanelProps) {
  const sites = useClientSites(clientId);
  const [siteId, setSiteId] = useState<string>();
  const [activeOnly, setActiveOnly] = useState(true);
  const today = dayjs().format(DATE_FORMAT);
  const deployments = useDeploymentList({
    clientId,
    siteId,
    activeOn: activeOnly ? today : undefined,
  });
  const [assignOpen, setAssignOpen] = useState(false);
  const [ending, setEnding] = useState<DeploymentResponse>();

  const columns: ColumnsType<DeploymentResponse> = [
    {
      title: "Employee",
      key: "employee",
      render: (_, d) => (
        <div>
          <div>{d.employeeName}</div>
          <Text type="secondary" className="text-xs">
            {d.employeeNo}
          </Text>
        </div>
      ),
    },
    {
      title: "Post",
      key: "post",
      render: (_, d) => (
        <div>
          <div>{d.postName}</div>
          <Text type="secondary" className="text-xs">
            {d.siteName}
          </Text>
        </div>
      ),
    },
    {
      title: "Role",
      key: "role",
      render: (_, d) => <Tag color={ROLE_TAG[d.role]}>{d.role}</Tag>,
    },
    {
      title: "Dates",
      key: "dates",
      render: (_, d) => `${d.startDate} → ${d.endDate ?? "open"}`,
    },
    {
      title: "Notes",
      key: "notes",
      render: (_, d) => [d.eventTag, d.reason].filter(Boolean).join(" · "),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, d) =>
        d.active ? (
          <PermissionGate permission={DEPLOYMENT_PERMISSION.EDIT}>
            <Button size="small" onClick={() => setEnding(d)}>
              End
            </Button>
          </PermissionGate>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          allowClear
          placeholder="All sites"
          className="min-w-56"
          value={siteId}
          onChange={setSiteId}
          options={(sites.data ?? []).map((s) => ({
            value: s.id,
            label: s.name,
          }))}
        />
        <div className="flex items-center gap-2">
          <Switch checked={activeOnly} onChange={setActiveOnly} />
          <Text>Deployed today only</Text>
        </div>
        <div className="ml-auto">
          <PermissionGate permission={DEPLOYMENT_PERMISSION.EDIT}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAssignOpen(true)}
            >
              Deploy someone
            </Button>
          </PermissionGate>
        </div>
      </div>
      <Table<DeploymentResponse>
        rowKey="id"
        size="small"
        loading={deployments.isLoading}
        dataSource={deployments.data ?? []}
        columns={columns}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Nobody deployed." }}
      />
      {assignOpen && (
        <AssignModal clientId={clientId} onClose={() => setAssignOpen(false)} />
      )}
      {ending && (
        <EndModal deployment={ending} onClose={() => setEnding(undefined)} />
      )}
    </div>
  );
}

function AssignModal({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const assign = useAssignDeployment();
  const sites = useClientSites(clientId);
  const [siteId, setSiteId] = useState<string>();
  const posts = useClientPosts(siteId);
  const [keyword, setKeyword] = useState("");
  const employees = useEmployees(keyword);
  const { control, handleSubmit, setValue } =
    useForm<AssignDeploymentFormValues>({
      resolver: zodResolver(assignDeploymentFormSchema),
      defaultValues: {
        employeeId: "",
        postId: "",
        role: "Regular",
        startDate: dayjs().format(DATE_FORMAT),
        endDate: "",
        reason: "",
        eventTag: "",
      },
    });
  const role = useWatch({ control, name: "role" });

  const submit = handleSubmit(async (v) => {
    await assign.mutateAsync({
      ...v,
      endDate: v.endDate || null,
      reason: v.reason || null,
      eventTag: v.eventTag || null,
    });
    getNotify().success({ message: "Deployment saved." });
    onClose();
  });

  return (
    <Modal
      open
      title="Deploy someone"
      okText="Save"
      confirmLoading={assign.isPending}
      onCancel={onClose}
      onOk={submit}
    >
      <Form layout="vertical" component="div">
        <FormField
          control={control}
          name="employeeId"
          label="Employee"
          render={(f) => (
            <Select
              {...f}
              showSearch
              filterOption={false}
              placeholder="Type a name or employee number"
              loading={employees.isLoading}
              onSearch={setKeyword}
              options={(employees.data ?? []).slice(0, 50).map((e) => ({
                value: e.id,
                label: `${e.lastName}, ${e.firstName} (${e.employeeNo})`,
              }))}
            />
          )}
        />
        <Form.Item label="Site">
          <Select
            value={siteId}
            placeholder="Choose the site"
            options={(sites.data ?? []).map((s) => ({
              value: s.id,
              label: s.name,
            }))}
            onChange={(value) => {
              setSiteId(value);
              setValue("postId", "");
            }}
          />
        </Form.Item>
        <FormField
          control={control}
          name="postId"
          label="Post"
          render={(f) => (
            <Select
              {...f}
              disabled={!siteId}
              loading={posts.isLoading}
              options={(posts.data ?? []).map((p) => ({
                value: p.id,
                label: `${p.code} - ${p.name} (${p.position})`,
              }))}
            />
          )}
        />
        <FormField
          control={control}
          name="role"
          label="Role"
          extra={
            role === "Regular"
              ? "A new regular deployment ends the person's current one the day before."
              : undefined
          }
          render={(f) => <Select {...f} options={ROLE_OPTIONS} />}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name="startDate"
            label="From"
            render={(f) => (
              <DatePicker
                className="w-full"
                value={dateValue(f.value)}
                onChange={(d) => f.onChange(toDate(d))}
              />
            )}
          />
          <FormField
            control={control}
            name="endDate"
            label="Until"
            render={(f) => (
              <DatePicker
                className="w-full"
                value={dateValue(f.value)}
                onChange={(d) => f.onChange(toDate(d))}
              />
            )}
          />
        </div>
        {role === "Augmentation" && (
          <FormField
            control={control}
            name="eventTag"
            label="Event or requesting party"
            render={(f) => (
              <Input {...f} maxLength={200} placeholder="CWE 2026 - PGB" />
            )}
          />
        )}
        <FormField
          control={control}
          name="reason"
          label="Notes"
          render={(f) => <Input.TextArea {...f} rows={2} maxLength={500} />}
        />
      </Form>
    </Modal>
  );
}

function EndModal({
  deployment,
  onClose,
}: {
  deployment: DeploymentResponse;
  onClose: () => void;
}) {
  const end = useEndDeployment();
  const { control, handleSubmit } = useForm<EndDeploymentFormValues>({
    resolver: zodResolver(endDeploymentFormSchema),
    defaultValues: { endDate: dayjs().format(DATE_FORMAT), reason: "" },
  });

  const submit = handleSubmit(async (v) => {
    await end.mutateAsync({
      id: deployment.id,
      request: { endDate: v.endDate, reason: v.reason || null },
    });
    getNotify().success({ message: "Deployment ended." });
    onClose();
  });

  return (
    <Modal
      open
      title={`End deployment: ${deployment.employeeName}`}
      okText="End deployment"
      confirmLoading={end.isPending}
      onCancel={onClose}
      onOk={submit}
    >
      <Form layout="vertical" component="div">
        <FormField
          control={control}
          name="endDate"
          label="Last day"
          render={(f) => (
            <DatePicker
              className="w-full"
              value={dateValue(f.value)}
              onChange={(d) => f.onChange(toDate(d))}
            />
          )}
        />
        <FormField
          control={control}
          name="reason"
          label="Reason"
          render={(f) => <Input.TextArea {...f} rows={2} maxLength={500} />}
        />
      </Form>
    </Modal>
  );
}
