import { useState } from "react";
import { Button, DatePicker, Select, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import {
  useWtaxTableRows,
  useDeleteWtaxTableRow,
} from "../../hooks/use-wtax-table-queries";
import WtaxTableTable from "../../components/wtax-table-table";
import {
  WTAX_TABLE_LABEL,
  PAYROLL_TYPE_OPTIONS,
} from "../../constants/label.const";

const { Title } = Typography;

export default function WtaxTableList() {
  const navigate = useNavigate();
  const [effectivity, setEffectivity] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );
  const [payrollType, setPayrollType] = useState<string>("SEMI_MONTHLY");

  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
  } = useWtaxTableRows(effectivity, payrollType);
  const { mutate: remove } = useDeleteWtaxTableRow();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {WTAX_TABLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage withholding tax brackets by effectivity date and payroll
              type.
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
              onClick={() => navigate({ to: "/setup/wtax-table/create" })}
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
            <span>{WTAX_TABLE_LABEL.PAYROLL_TYPE}:</span>
            <Select
              value={payrollType}
              onChange={setPayrollType}
              options={PAYROLL_TYPE_OPTIONS}
              style={{ width: 160 }}
            />
          </Space>
        </div>
      </div>

      <WtaxTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
