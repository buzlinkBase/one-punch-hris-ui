import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useMinimumWageRates,
  useDeleteMinimumWageRate,
} from "../../hooks/use-minimum-wage-rate-queries";
import MinimumWageRateTable from "../../components/minimum-wage-rate-table";
import { MINIMUM_WAGE_RATE_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function MinimumWageRateList() {
  const navigate = useNavigate();
  const {
    data: rates = [],
    isLoading,
    refetch,
    isFetching,
  } = useMinimumWageRates();
  const { mutate: remove } = useDeleteMinimumWageRate();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {MINIMUM_WAGE_RATE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Regional daily minimum wage rates — used to auto-classify Minimum
              Wage Earners for BIR Form 1601-C.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                navigate({ to: "/setup/minimum-wage-rate/create" })
              }
            >
              Add Rate
            </Button>
          </Space>
        </div>
      </div>
      <MinimumWageRateTable
        data={rates}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
