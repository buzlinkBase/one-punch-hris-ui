import { useState } from "react";
import { Button, DatePicker, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import {
  useHdmfTableRows,
  useDeleteHdmfTableRow,
} from "../../hooks/use-hdmf-table-queries";
import HdmfTableTable from "../../components/hdmf-table-table";
import { HDMF_TABLE_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function HdmfTableList() {
  const navigate = useNavigate();
  const [effectivity, setEffectivity] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );

  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
  } = useHdmfTableRows(effectivity);
  const { mutate: remove } = useDeleteHdmfTableRow();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {HDMF_TABLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage Pag-IBIG contribution brackets by effectivity date.
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
              onClick={() => navigate({ to: "/setup/hdmf-table/create" })}
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

      <HdmfTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
