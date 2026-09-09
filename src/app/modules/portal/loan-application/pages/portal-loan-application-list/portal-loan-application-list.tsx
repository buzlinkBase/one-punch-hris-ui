import { useMemo } from "react";
import { Button, Card, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMyLoanApplications } from "../../../shared/hooks/use-my-employee-queries";
import { useDeductions } from "@/app/modules/setup/deduction/hooks/use-deduction-queries";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "@/app/modules/applications/pass-slip/constants/label.const";
import { FREQUENCY_LABEL } from "@/app/modules/applications/deduction-application/constants/label.const";
import type { DeductionApplicationResponse } from "@/app/modules/applications/deduction-application/models/api/response/deduction-application-response.model";
import {
  loanBreakdownColumns,
  type LoanBreakdownRow,
} from "@/shared/utils/loan-amortization.util";

const { Title } = Typography;

export default function PortalLoanApplicationList() {
  const navigate = useNavigate();
  const { data: loans = [], isLoading } = useMyLoanApplications();
  const { data: rawDeductions = [] } = useDeductions();

  const deductionMap = useMemo(
    () => Object.fromEntries(rawDeductions.map((d) => [d.id, d.name])),
    [rawDeductions],
  );

  const columns: ColumnsType<DeductionApplicationResponse> = [
    {
      title: "Loan Type",
      dataIndex: "deductionId",
      key: "deductionId",
      render: (v: string) => deductionMap[v] ?? v,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (v: string) =>
        v ? dayjs(v.replace(/Z$/, "")).format("MMM DD, YYYY") : "—",
    },
    {
      title: "Frequency",
      dataIndex: "frequencyOfPayment",
      key: "frequencyOfPayment",
      render: (v: string) => <Tag>{FREQUENCY_LABEL[v] ?? v}</Tag>,
    },
    { title: "Terms", dataIndex: "terms", key: "terms", align: "right" },
    {
      title: "Principal",
      dataIndex: "totalPrincipal",
      key: "totalPrincipal",
      align: "right",
      render: (v: number) =>
        (v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (v: number) =>
        (v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
    },
    {
      title: "Status",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      render: (v?: string) => (
        <Tag color={APPROVAL_STATUS_COLOR[v ?? ""] ?? "success"}>
          {APPROVAL_STATUS_LABEL[v ?? ""] ?? v ?? "Approved"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Loan Ledger
            </Title>
            <p className="page-toolbar-subtitle">
              Every loan you've filed and its amortization schedule.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/portal/loan-applications/create" })}
          >
            Request Loan
          </Button>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <Table<DeductionApplicationResponse>
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={loans}
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: (record) => (
                <Table<LoanBreakdownRow>
                  rowKey="period"
                  size="small"
                  pagination={false}
                  columns={loanBreakdownColumns}
                  dataSource={(record.breakdown ?? []).map((b, i) => ({
                    period: i + 1,
                    date: b.date?.replace(/Z$/, "").split("T")[0] ?? "",
                    principal: b.principal,
                    interest: b.interest,
                    amount: b.amount,
                    balance: b.balance,
                  }))}
                />
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
}
