import { Card, Progress, Skeleton, Typography } from "antd";
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
                  <span className="text-sm text-gray-700">
                    {dept.departmentName}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {dept.headcount}
                  </span>
                </div>
                <Progress
                  percent={(dept.headcount / max) * 100}
                  showInfo={false}
                  strokeColor="#1DA081"
                  trailColor="#eef7f4"
                  size="small"
                />
              </div>
            ))}
        </div>
      )}
    </Card>
  );
}
