import { Card, Progress, Skeleton, Typography, theme } from "antd";
import type { DepartmentHeadcount } from "../../models/api/response/dashboard-response.model";
import { DASHBOARD_LABEL } from "../../constants/label.const";

const { Title } = Typography;

interface DepartmentHeadcountCardProps {
  data: DepartmentHeadcount[];
  loading?: boolean;
}

export default function DepartmentHeadcountCard({
  data,
  loading,
}: DepartmentHeadcountCardProps) {
  const { token } = theme.useToken();
  const max = Math.max(1, ...data.map((d) => d.headcount));

  return (
    <Card size="small" className="h-full">
      <Title level={5} className="mb-4!">
        {DASHBOARD_LABEL.DEPARTMENT_HEADCOUNT}
      </Title>
      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <div className="flex flex-col gap-3">
          {[...data]
            .sort((a, b) => b.headcount - a.headcount)
            .map((dept) => (
              <div key={dept.departmentId}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm" style={{ color: token.colorText }}>
                    {dept.departmentName}
                  </span>
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: token.colorText }}
                  >
                    {dept.headcount}
                  </span>
                </div>
                <Progress
                  percent={(dept.headcount / max) * 100}
                  showInfo={false}
                  strokeColor="#1DA081"
                  trailColor={token.colorFillSecondary}
                  size="small"
                />
              </div>
            ))}
        </div>
      )}
    </Card>
  );
}
