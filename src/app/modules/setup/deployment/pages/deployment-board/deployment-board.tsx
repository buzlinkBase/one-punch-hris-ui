import { useState } from "react";
import { Button, Select, Tabs, Tooltip, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  DEPLOYMENT_LABEL,
  DEPLOYMENT_PERMISSION,
} from "../../constants/label.const";
import { useSendManningToPortal } from "../../hooks/use-deployment-queries";
import { SitesPanel } from "../../components/sites-panel";
import { DeploymentsPanel } from "../../components/deployments-panel";
import { CoveragePanel } from "../../components/coverage-panel";

const { Title, Text } = Typography;

export default function DeploymentBoard() {
  const clients = useClients();
  const [clientId, setClientId] = useState<string>();
  const sendManning = useSendManningToPortal();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          {DEPLOYMENT_LABEL.TITLE}
        </Title>
        <Text type="secondary">{DEPLOYMENT_LABEL.SUBTITLE}</Text>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          showSearch
          optionFilterProp="label"
          placeholder={DEPLOYMENT_LABEL.CHOOSE_CLIENT}
          className="w-full max-w-sm"
          value={clientId}
          loading={clients.isLoading}
          options={(clients.data ?? []).map((c) => ({
            value: c.id,
            label: `${c.name} (${c.code})`,
          }))}
          onChange={setClientId}
        />
        {clientId && (
          <PermissionGate permission={DEPLOYMENT_PERMISSION.EDIT}>
            <Tooltip title={DEPLOYMENT_LABEL.SEND_TO_PORTAL_HINT}>
              <Button
                icon={<SendOutlined />}
                loading={sendManning.isPending}
                onClick={async () => {
                  await sendManning.mutateAsync(clientId);
                  getNotify().success({
                    message: DEPLOYMENT_LABEL.SENT_TO_PORTAL,
                  });
                }}
              >
                {DEPLOYMENT_LABEL.SEND_TO_PORTAL}
              </Button>
            </Tooltip>
          </PermissionGate>
        )}
      </div>

      {clientId && (
        <div className="rounded-lg bg-white p-4">
          <Tabs
            items={[
              {
                key: "sites",
                label: DEPLOYMENT_LABEL.TAB_SITES,
                children: <SitesPanel clientId={clientId} />,
              },
              {
                key: "personnel",
                label: DEPLOYMENT_LABEL.TAB_PERSONNEL,
                children: <DeploymentsPanel clientId={clientId} />,
              },
              {
                key: "manning",
                label: DEPLOYMENT_LABEL.TAB_MANNING,
                children: <CoveragePanel clientId={clientId} />,
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
