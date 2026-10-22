import { Typography } from "antd";
import { authStorage } from "@/core/auth/auth-storage";
import { phNow } from "@/shared/utils/ph-time.util";
import { useDrillDown } from "@/shared/drilldown/use-drill-down";
import StatTiles from "./components/stat-tiles/stat-tiles";
import AttendanceOverviewCard from "./components/attendance-overview-card/attendance-overview-card";
import TodayAttendanceCard from "./components/today-attendance-card/today-attendance-card";
import DepartmentHeadcountCard from "./components/department-headcount-card/department-headcount-card";
import CountBarCard from "./components/count-bar-card/count-bar-card";
import RecentActivityCard from "./components/recent-activity-card/recent-activity-card";
import UpcomingHolidaysCard from "./components/upcoming-holidays-card/upcoming-holidays-card";
import UpcomingBirthdaysCard from "./components/upcoming-birthdays-card/upcoming-birthdays-card";
import PendingRequestsCard from "./components/pending-requests-card/pending-requests-card";
import { DASHBOARD_LABEL } from "./constants/label.const";
import { useDashboardOverview } from "./hooks/use-dashboard-queries";
import { spaceWords } from "./utils/space-words";
import {
  attendanceDayDrill,
  branchDrill,
  departmentDrill,
  employmentStatusDrill,
  pendingRequestDrill,
  siteDrill,
  statDrill,
  tenureDrill,
} from "./utils/dashboard-drill";

const { Title, Text } = Typography;

function getGreeting(): string {
  const h = phNow().hour();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { data, isLoading } = useDashboardOverview();
  // Figures open the list behind them -- only for screens this person may open.
  const { action } = useDrillDown();

  const user = authStorage.getUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const now = phNow();
  const today = now.format("dddd, MMMM D, YYYY");

  return (
    <div className="content-page">
      {/* Greeting */}
      <div className="mb-6">
        <Title level={4} className="m-0!">
          {getGreeting()}, {firstName}
        </Title>
        <Text type="secondary" className="text-[13px]">
          {today}
        </Text>
      </div>

      {/* The dashboard's own report: today, the last 7 days and who works here now -- not the
          Analytics pages' monthly history. */}
      <div className="mb-4">
        <StatTiles
          stats={data?.stats}
          loading={isLoading}
          drillAction={(key) => action(statDrill(key, now))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <AttendanceOverviewCard
            data={data?.attendanceTrend ?? []}
            loading={isLoading}
            drillAction={(point) => action(attendanceDayDrill(point.workDate))}
          />
        </div>
        <TodayAttendanceCard
          stats={data?.stats}
          loading={isLoading}
          drillAction={(key) => action(statDrill(key, now))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <DepartmentHeadcountCard
          data={data?.departmentHeadcount ?? []}
          loading={isLoading}
          drillAction={(dept) => action(departmentDrill(dept))}
        />
        <CountBarCard
          title={DASHBOARD_LABEL.BRANCH_HEADCOUNT}
          data={data?.workforce?.branches ?? []}
          loading={isLoading}
          horizontal
          drillAction={(row) => action(branchDrill(row))}
        />
        <CountBarCard
          title={DASHBOARD_LABEL.SITE_HEADCOUNT}
          data={data?.workforce?.sites ?? []}
          loading={isLoading}
          horizontal
          drillAction={(row) => action(siteDrill(row))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <CountBarCard
          title={DASHBOARD_LABEL.EMPLOYMENT_STATUS}
          data={data?.workforce?.employmentStatus ?? []}
          loading={isLoading}
          formatLabel={spaceWords}
          horizontal
          drillAction={(row) => action(employmentStatusDrill(row))}
        />
        <CountBarCard
          title={DASHBOARD_LABEL.TENURE}
          data={data?.workforce?.tenure ?? []}
          loading={isLoading}
          drillAction={(row) => action(tenureDrill(row, now))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <UpcomingHolidaysCard
          data={data?.upcomingHolidays ?? []}
          loading={isLoading}
        />
        <UpcomingBirthdaysCard
          data={data?.upcomingBirthdays ?? []}
          loading={isLoading}
        />
        <PendingRequestsCard
          data={data?.pendingRequests ?? []}
          loading={isLoading}
          drillAction={(request) => action(pendingRequestDrill(request))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RecentActivityCard
          data={data?.recentActivity ?? []}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
