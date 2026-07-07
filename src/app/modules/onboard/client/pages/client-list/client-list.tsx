import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Button, Typography } from "antd";
import ClientTable from "../../components/client-table";
import { CLIENT_LABEL } from "../../constants/label.const";
import type { DeactivateClient } from "../../models/api/request/deactivate-client.model";
import {
  useClients,
  useDeactivateClient,
} from "../../hooks/use-client-queries";

const { Title } = Typography;

export default function ClientList() {
  const navigate = useNavigate();
  const { data: clients = [], isLoading } = useClients();
  const { mutateAsync: deactivate, isPending: isDeactivating } =
    useDeactivateClient();

  const handleDeactivate = async (id: string) => {
    const payload: DeactivateClient = {
      id,
      deactivationReason: "UNPAID_DUES",
    };

    await deactivate(payload);
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="!mb-0">
              {CLIENT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage client records and deactivate accounts when dues remain
              unpaid.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/clients/create" })}
          >
            Add Client
          </Button>
        </div>
      </div>

      <ClientTable
        data={clients}
        loading={isLoading || isDeactivating}
        onDeactivate={handleDeactivate}
      />
    </div>
  );
}
