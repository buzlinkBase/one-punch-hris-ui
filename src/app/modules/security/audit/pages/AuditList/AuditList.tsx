import { Typography } from "antd";
import { useAuditLogs } from "../../hooks/useAuditQueries";
import AuditTable from "../../components/AuditTable";
import { AUDIT_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function AuditList() {
  const { data: audits = [], isLoading } = useAuditLogs();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {AUDIT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Track all user actions and system events for accountability and
              compliance.
            </p>
          </div>
        </div>
      </div>
      <AuditTable data={audits} loading={isLoading} />
    </div>
  );
}
