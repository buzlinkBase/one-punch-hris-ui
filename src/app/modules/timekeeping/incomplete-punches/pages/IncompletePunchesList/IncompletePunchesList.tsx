import { useState } from "react";
import { Typography } from "antd";
import { useIncompletePunches } from "../../hooks/useIncompletePunchesQueries";
import IncompletePunchesFilter from "../../components/IncompletePunchesFilter";
import IncompletePunchesTable from "../../components/IncompletePunchesTable";
import { INCOMPLETE_PUNCHES_LABEL } from "../../constants/label.const";
import type { IncompletePunchesFilterRequest } from "../../models/api/response/incomplete-punch.model";

const { Title } = Typography;

export default function IncompletePunchesList() {
  const [filters, setFilters] = useState<IncompletePunchesFilterRequest>({});

  const { data: response, isLoading } = useIncompletePunches(filters);

  const incompletePunches = response?.incompletePunches ?? [];

  const handleFilter = (newFilters: IncompletePunchesFilterRequest) => {
    setFilters(newFilters);
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {INCOMPLETE_PUNCHES_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {INCOMPLETE_PUNCHES_LABEL.SUBTITLE}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <IncompletePunchesFilter onFilter={handleFilter} loading={isLoading} />
        <IncompletePunchesTable data={incompletePunches} loading={isLoading} />
      </div>
    </div>
  );
}
