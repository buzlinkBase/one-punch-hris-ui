import { useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  Input,
  Skeleton,
  Tag,
  Typography,
  theme,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { authStorage } from "@/core/auth/auth-storage";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import DtrBatchesCard from "./components/dtr-batches-card";
import PayrollSnapshotCard from "./components/payroll-snapshot-card";
import UpcomingHolidaysCard from "./components/upcoming-holidays-card";
import PendingRequestsCard from "./components/pending-requests-card";
import { useDashboardOverview } from "./hooks/use-dashboard-queries";

const { Title, Text } = Typography;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const STATUS_COLOR: Record<string, string> = {
  Regular: "green",
  Probationary: "blue",
  Contract: "orange",
  Temporary: "orange",
  Casual: "default",
  PartTime: "purple",
  Intern: "cyan",
  OnLeave: "gold",
  Suspended: "warning",
  Terminated: "red",
  Resigned: "default",
  Retired: "default",
  Deceased: "default",
};

function EmployeeDirectoryCard() {
  const { token } = theme.useToken();
  const [search, setSearch] = useState("");
  const { data: employees = [], isLoading } = useEmployees();

  const q = search.toLowerCase().trim();
  const filtered = q
    ? employees.filter(
        (e) =>
          e.fullName?.toLowerCase().includes(q) ||
          e.positionName?.toLowerCase().includes(q) ||
          e.departmentName?.toLowerCase().includes(q),
      )
    : employees;

  return (
    <Card
      size="small"
      title={
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          Employee Directory
          <Tag
            style={{ marginLeft: 8, fontWeight: 400, fontSize: 11 }}
            color="default"
          >
            {employees.length}
          </Tag>
        </span>
      }
      style={{ height: "100%" }}
    >
      <Input
        prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
        placeholder="Search by name, position, or department…"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10 }}
        allowClear
      />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <div
          style={{
            maxHeight: 260,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {filtered.length === 0 ? (
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                textAlign: "center",
                padding: "16px 0",
                display: "block",
              }}
            >
              No employees found
            </Text>
          ) : (
            filtered.slice(0, 20).map((emp) => (
              <div
                key={emp.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 4px",
                  borderRadius: 6,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    token.colorFillQuaternary)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                <Avatar
                  size={32}
                  icon={emp.fullName ? undefined : <UserOutlined />}
                  style={{ background: "#1DA081", flexShrink: 0, fontSize: 12 }}
                >
                  {emp.fullName ? getInitials(emp.fullName) : null}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {emp.fullName ?? "—"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: token.colorTextTertiary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {emp.positionName ?? emp.departmentName ?? "—"}
                  </div>
                </div>
                {emp.employmentStatus && (
                  <Badge
                    color={STATUS_COLOR[emp.employmentStatus] ?? "default"}
                    text={
                      <span
                        style={{
                          fontSize: 11,
                          color: token.colorTextSecondary,
                        }}
                      >
                        {emp.employmentStatus}
                      </span>
                    }
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useDashboardOverview();

  const user = authStorage.getUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const today = dayjs().format("dddd, MMMM D, YYYY");

  return (
    <div className="content-page">
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {getGreeting()}, {firstName}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {today}
        </Text>
      </div>

      {/* Timekeeping + Payroll snapshot */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 16,
          alignItems: "start",
          marginBottom: 16,
        }}
      >
        <DtrBatchesCard />
        <PayrollSnapshotCard />
      </div>

      {/* Bottom row: directory, holidays, actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        <EmployeeDirectoryCard />
        <UpcomingHolidaysCard
          data={data?.upcomingHolidays ?? []}
          loading={isLoading}
        />
        <PendingRequestsCard
          data={data?.pendingRequests ?? []}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
