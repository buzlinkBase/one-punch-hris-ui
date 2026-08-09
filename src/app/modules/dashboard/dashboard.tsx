import { Typography } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useDashboardOverview } from "./hooks/use-dashboard-queries";
import StatCard from "./components/stat-card";
import AttendanceOverviewCard from "./components/attendance-overview-card";
import DepartmentHeadcountCard from "./components/department-headcount-card";
import UpcomingHolidaysCard from "./components/upcoming-holidays-card";
import RecentActivityCard from "./components/recent-activity-card";
import PendingRequestsCard from "./components/pending-requests-card";
import QuickActionsCard from "./components/quick-actions-card";
import { DASHBOARD_LABEL } from "./constants/label.const";

const { Title } = Typography;

export default function Dashboard() {
  const { data, isLoading } = useDashboardOverview();
  const stats = data?.stats;

  const attendanceRate =
    stats && stats.totalEmployees > 0
      ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
      : null;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {DASHBOARD_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">{DASHBOARD_LABEL.SUBTITLE}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title={DASHBOARD_LABEL.TOTAL_EMPLOYEES}
          value={stats?.totalEmployees ?? 0}
          icon={<TeamOutlined />}
          color="#1DA081"
          loading={isLoading}
        />
        <StatCard
          title={DASHBOARD_LABEL.PRESENT_TODAY}
          value={stats?.presentToday ?? 0}
          icon={<ClockCircleOutlined />}
          color="#1890FF"
          loading={isLoading}
          subtext={
            attendanceRate !== null
              ? `${attendanceRate}% attendance`
              : undefined
          }
        />
        <StatCard
          title={DASHBOARD_LABEL.LATE_TODAY}
          value={stats?.lateToday ?? 0}
          icon={<ClockCircleOutlined />}
          color="#FAAD14"
          loading={isLoading}
        />
        <StatCard
          title={DASHBOARD_LABEL.ABSENT_TODAY}
          value={stats?.absentToday ?? 0}
          icon={<UserSwitchOutlined />}
          color="#F5222D"
          loading={isLoading}
        />
        <StatCard
          title={DASHBOARD_LABEL.ON_LEAVE_TODAY}
          value={stats?.onLeaveToday ?? 0}
          icon={<CalendarOutlined />}
          color="#722ED1"
          loading={isLoading}
        />
        <StatCard
          title={DASHBOARD_LABEL.NEW_HIRES}
          value={stats?.newHiresThisMonth ?? 0}
          icon={<UserAddOutlined />}
          color="#13C2C2"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <AttendanceOverviewCard
            data={data?.attendanceTrend ?? []}
            loading={isLoading}
          />
        </div>
        <QuickActionsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DepartmentHeadcountCard
          data={data?.departmentHeadcount ?? []}
          loading={isLoading}
        />
        <UpcomingHolidaysCard
          data={data?.upcomingHolidays ?? []}
          loading={isLoading}
        />
        <PendingRequestsCard
          data={data?.pendingRequests ?? []}
          loading={isLoading}
        />
      </div>

      <RecentActivityCard
        data={data?.recentActivity ?? []}
        loading={isLoading}
      />
    </div>
  );
}
