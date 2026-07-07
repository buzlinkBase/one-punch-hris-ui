import { useState } from "react";
import { Badge, Button, Card, Typography } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useIncompletePunches } from "../../hooks/use-incomplete-punches-queries";
import IncompletePunchesFilter from "../../components/incomplete-punches-filter";
import IncompletePunchesTable from "../../components/incomplete-punches-table";
import { INCOMPLETE_PUNCHES_LABEL } from "../../constants/label.const";
import type { IncompletePunchesFilterRequest } from "../../models/api/response/incomplete-punch.model";

const { Title } = Typography;

export default function IncompletePunchesList() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<IncompletePunchesFilterRequest>({});

  const activeFilterCount = [
    filters.fromDate,
    filters.departmentId,
    filters.clientId,
    filters.employeeId,
    filters.payrollGroupId,
  ].filter(Boolean).length;

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
          <div className="flex gap-2">
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen((v) => !v)}
                type={filtersOpen ? "default" : "text"}
              >
                Filters
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filtersOpen && (
          <Card size="small">
            <IncompletePunchesFilter
              onFilter={handleFilter}
              onReset={() => setFiltersOpen(false)}
              loading={isLoading}
            />
          </Card>
        )}
        <IncompletePunchesTable data={incompletePunches} loading={isLoading} />
      </div>
    </div>
  );
}
