import { useState } from "react";
import { Button, DatePicker, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
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
  const [effectivity, setEffectivity] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );

  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
  } = useAnnualTaxTableRows(effectivity);
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
              Manage annual income tax brackets by effectivity date.
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
        <div className="page-toolbar-row">
          <Space>
            <span>Effectivity Date:</span>
            <DatePicker
              value={dayjs(effectivity)}
              onChange={(d: Dayjs | null) => {
                if (d) setEffectivity(d.format("YYYY-MM-DD"));
              }}
              format="YYYY-MM-DD"
              allowClear={false}
            />
          </Space>
        </div>
      </div>

      <AnnualTaxTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
