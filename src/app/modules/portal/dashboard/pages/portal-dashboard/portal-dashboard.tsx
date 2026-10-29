import { Empty, Statistic, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useDrillDown } from "@/shared/drilldown/use-drill-down";
import { authStorage } from "@/core/auth/auth-storage";
import {
  useMy13thMonth,
  useMyCashBond,
  useMyEmployee,
  useMyIncompletePunches,
  useMyLeaveApplications,
  useMyLeaveCredits,
  useMyLoanApplications,
  useMyOvertimeApplications,
  useMyPassSlipApplications,
  useMySchedule,
  useMyTravelOrderApplications,
  usePortalVisibility,
} from "../../../shared/hooks/use-my-employee-queries";
import {
  useMyLatestAnnouncements,
  useMyUnreadAnnouncementCount,
} from "../../../announcements/hooks/use-my-announcement-queries";
import { DashboardCard } from "../../components/dashboard-card";
import { PORTAL_DASHBOARD_LABEL as L } from "../../constants/label.const";
import {
  countPending,
  fmtAmount,
  fmtDays,
  monthToDateRange,
  firstVisibleRequestPath,
  nextWeekRange,
  totalLoanBalance,
} from "../../utils/portal-dashboard.util";

const { Title, Text } = Typography;

export default function PortalDashboard() {
  const { action } = useDrillDown();
  const today = dayjs();
  const year = today.year();
  const week = nextWeekRange(today);
  const month = monthToDateRange(today);

  const { data: employee } = useMyEmployee();
  const { data: visibility } = usePortalVisibility();

  // A page the company switched off is neither shown nor fetched (its API answers 404).
  const showLeaveCredits = visibility?.showLeaveCredits ?? true;
  const showThirteenth = visibility?.showThirteenthMonth ?? true;
  const showCashBond = visibility?.showCashBond ?? true;
  const showSchedule = visibility?.showShiftSchedule ?? true;
  const showIncomplete = visibility?.showIncompletePunches ?? true;
  const showDeductions = visibility?.showDeductions ?? true;
  const showLeaveApps = visibility?.showLeaveApplications ?? true;
  const showOvertime = visibility?.showOvertime ?? true;
  const showOfficialBusiness = visibility?.showOfficialBusiness ?? true;
  const showPassSlip = visibility?.showPassSlip ?? true;
  const showAnnouncements = visibility?.showAnnouncements ?? true;
  const requestsPath = firstVisibleRequestPath(visibility);

  const leaves = useMyLeaveCredits(undefined, showLeaveCredits);
  const thirteenth = useMy13thMonth(year, showThirteenth);
  const cashBond = useMyCashBond(showCashBond);
  const schedule = useMySchedule(week.from, week.to, showSchedule);
  const incomplete = useMyIncompletePunches(month, showIncomplete);
  const loans = useMyLoanApplications(showDeductions);
  const leaveApps = useMyLeaveApplications(showLeaveApps);
  const overtimeApps = useMyOvertimeApplications(showOvertime);
  const officialBusinessApps =
    useMyTravelOrderApplications(showOfficialBusiness);
  const passSlipApps = useMyPassSlipApplications(showPassSlip);
  const unread = useMyUnreadAnnouncementCount();
  const latest = useMyLatestAnnouncements(3);

  const todayRow = schedule.data?.find(
    (r) => r.workDate.slice(0, 10) === week.from,
  );
  const pending =
    countPending(leaveApps.data ?? []) +
    countPending(overtimeApps.data ?? []) +
    countPending(officialBusinessApps.data ?? []) +
    countPending(passSlipApps.data ?? []);
  const pendingLoading =
    leaveApps.isLoading ||
    overtimeApps.isLoading ||
    officialBusinessApps.isLoading ||
    passSlipApps.isLoading;
  const name = employee?.firstName ?? authStorage.getUser()?.name;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <Title level={4} className="mb-0!">
          {L.title}
        </Title>
        <p className="page-toolbar-subtitle">
          {name ? `Welcome, ${name} · ` : ""}
          {today.format("dddd, MMMM D, YYYY")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {showLeaveCredits && (
          <DashboardCard
            title={L.leaveBalance}
            tone="success"
            loading={leaves.isLoading}
            drillAction={action({ to: "/portal/leave-credits" })}
          >
            {leaves.data?.length ? (
              <ul className="m-0 list-none p-0">
                {leaves.data.map((l) => (
                  <li key={l.leaveCode} className="flex justify-between py-0.5">
                    <Text>{l.leaveDescription}</Text>
                    <Text strong>{fmtDays(l.availableToFile)}</Text>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </DashboardCard>
        )}

        {showThirteenth && (
          <DashboardCard
            title={`${L.thirteenthMonth} (${year})`}
            tone="primary"
            loading={thirteenth.isLoading}
            drillAction={action({ to: "/portal/thirteenth-month" })}
          >
            <Statistic
              prefix="₱"
              value={fmtAmount(thirteenth.data?.thirteenthMonthPay ?? 0)}
            />
            {thirteenth.data && <Tag>{thirteenth.data.status}</Tag>}
          </DashboardCard>
        )}

        {showCashBond && (
          <DashboardCard
            title={L.cashBond}
            tone="info"
            loading={cashBond.isLoading}
            drillAction={action({ to: "/portal/cash-bond" })}
          >
            <Statistic
              prefix="₱"
              value={fmtAmount(cashBond.data?.totalCollected ?? 0)}
            />
            <Text type="secondary">
              ₱{fmtAmount(cashBond.data?.cashBondRate ?? 0)} per payroll
            </Text>
          </DashboardCard>
        )}

        {showSchedule && (
          <DashboardCard
            title={L.schedule}
            tone="primary"
            loading={schedule.isLoading}
            drillAction={action({ to: "/portal/shift-schedule" })}
          >
            <Text strong>
              {todayRow
                ? todayRow.isRestDay
                  ? "Rest day today"
                  : todayRow.shiftName
                : "No schedule today"}
            </Text>
            <ul className="m-0 mt-2 list-none p-0">
              {(schedule.data ?? []).slice(1, 4).map((r) => (
                <li key={r.workDate} className="flex justify-between py-0.5">
                  <Text type="secondary">
                    {dayjs(r.workDate).format("ddd, MMM D")}
                  </Text>
                  <Text>{r.isRestDay ? "Rest day" : r.shiftName}</Text>
                </li>
              ))}
            </ul>
          </DashboardCard>
        )}

        {showIncomplete && (
          <DashboardCard
            title={L.incompleteLogs}
            tone="error"
            loading={incomplete.isLoading}
            drillAction={action({ to: "/portal/incomplete-punches" })}
          >
            <Statistic
              value={incomplete.data?.length ?? 0}
              suffix="this month"
            />
            <Text type="secondary">
              {(incomplete.data ?? [])
                .slice(0, 3)
                .map((r) => dayjs(r.workDate).format("MMM D"))
                .join(", ")}
            </Text>
          </DashboardCard>
        )}

        {showDeductions && (
          <DashboardCard
            title={L.loanBalance}
            tone="warning"
            loading={loans.isLoading}
            drillAction={action({ to: "/portal/deductions" })}
          >
            <Statistic
              prefix="₱"
              value={fmtAmount(totalLoanBalance(loans.data ?? []))}
            />
          </DashboardCard>
        )}

        {requestsPath && (
          <DashboardCard
            title={L.pendingRequests}
            tone="warning"
            loading={pendingLoading}
            drillAction={action({ to: requestsPath })}
          >
            <Statistic value={pending} suffix="awaiting approval" />
          </DashboardCard>
        )}

        {showAnnouncements && (
          <DashboardCard
            title={L.announcements}
            tone="info"
            loading={latest.isLoading}
            drillAction={action({ to: "/portal/announcements" })}
          >
            <Text type="secondary">{unread.data ?? 0} unread</Text>
            <ul className="m-0 mt-2 list-none p-0">
              {(latest.data?.data ?? []).map((a) => (
                <li key={a.id} className="truncate py-0.5">
                  <Text>{a.title}</Text>
                </li>
              ))}
            </ul>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}
