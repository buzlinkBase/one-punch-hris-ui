import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useAnnualTaxTableRows,
  useDeleteAnnualTaxTableRow,
} from "../../hooks/use-annual-tax-table-queries";
import AnnualTaxTableTable from "../../components/annual-tax-table-table";
import { ANNUAL_TAX_TABLE_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function AnnualTaxTableList() {
  const navigate = useNavigate();

  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
  } = useAnnualTaxTableRows();
  const { mutate: remove } = useDeleteAnnualTaxTableRow();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {ANNUAL_TAX_TABLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage annual income tax brackets.
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
              onClick={() => navigate({ to: "/setup/annual-tax-table/create" })}
            >
              Add Bracket
            </Button>
          </Space>
        </div>
      </div>

      <AnnualTaxTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
