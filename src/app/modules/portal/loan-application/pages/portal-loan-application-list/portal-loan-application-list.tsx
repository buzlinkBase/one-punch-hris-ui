import { useMemo } from "react";
import {
  Button,
  Card,
  Popconfirm,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyLoanApplications,
  useWithdrawMyLoanApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import { useDeductions } from "@/app/modules/setup/deduction/hooks/use-deduction-queries";
import { FREQUENCY_LABEL } from "@/app/modules/applications/deduction-application/constants/label.const";
import type { DeductionApplicationResponse } from "@/app/modules/applications/deduction-application/models/api/response/deduction-application-response.model";
import {
  loanBreakdownColumns,
  type LoanBreakdownRow,
} from "@/shared/utils/loan-amortization.util";
import { ApprovalStatusCell } from "@/shared/components/approval-status-cell/approval-status-cell";

const { Title } = Typography;

export default function PortalLoanApplicationList() {
  const navigate = useNavigate();
  const { data: loans = [], isLoading } = useMyLoanApplications();
  const { data: rawDeductions = [] } = useDeductions();
  const { mutateAsync: withdraw, isPending: isWithdrawing } =
    useWithdrawMyLoanApplication();

  const handleWithdraw = async (id: string) => {
    try {
      await withdraw(id);
      message.success("Loan application withdrawn.");
    } catch {
      message.error("Failed to withdraw loan application.");
    }
  };

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
      key: "status",
      render: (_, r) => (
        <ApprovalStatusCell
          applicationType="Loan"
          applicationId={r.id}
          approvalStatus={r.approvalStatus ?? "Approved"}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      render: (_, r) =>
        r.approvalStatus === "ForApproval" && (
          <Popconfirm
            title="Withdraw this loan application?"
            description="This cannot be undone. You'll need to file again if you change your mind."
            onConfirm={() => handleWithdraw(r.id)}
            okText="Withdraw"
            okButtonProps={{ danger: true, loading: isWithdrawing }}
            cancelText="Cancel"
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<CloseOutlined />}
              title="Withdraw"
            />
          </Popconfirm>
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
