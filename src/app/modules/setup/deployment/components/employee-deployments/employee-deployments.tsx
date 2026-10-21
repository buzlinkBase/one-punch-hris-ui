import { Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDeploymentList } from "../../hooks/use-deployment-queries";
import { ROLE_TAG } from "../../constants/label.const";
import type { DeploymentResponse } from "../../models/api/response/deployment-response.model";

const { Text } = Typography;

/** An employee's deployment history (Setup > Employee). Deployments are made in Setup > Deployment. */
export function EmployeeDeployments({
  employeeId,
}: {
  employeeId: string | undefined;
}) {
  const deployments = useDeploymentList({ employeeId }, !!employeeId);

  const columns: ColumnsType<DeploymentResponse> = [
    {
      title: "Client / post",
      key: "post",
      render: (_, d) => (
        <div>
          <div>{d.clientName}</div>
          <Text type="secondary" className="text-xs">
            {d.siteName} · {d.postName}
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
      title: "",
      key: "active",
      render: (_, d) => (d.active ? <Tag color="green">Current</Tag> : null),
    },
    {
      title: "Notes",
      key: "notes",
      render: (_, d) => [d.eventTag, d.reason].filter(Boolean).join(" · "),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Text type="secondary">
        Where this person has been deployed. Deploy or transfer people in Setup
        &gt; Deployment; the current regular deployment sets their client and
        project site.
      </Text>
      <Table<DeploymentResponse>
        rowKey="id"
        size="small"
        loading={deployments.isLoading}
        dataSource={deployments.data ?? []}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No deployments yet." }}
      />
    </div>
  );
}
