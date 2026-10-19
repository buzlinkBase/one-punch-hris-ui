import { useEffect } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Switch,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import {
  usePortalConnection,
  useSavePortalConnection,
  useSendAllPortalClients,
} from "../../hooks/use-client-portal-queries";
import { CLIENT_PORTAL_LABEL } from "../../constants/label.const";

const { Title, Text } = Typography;

interface ConnectionForm {
  enabled: boolean;
  portalUrl: string;
  apiKey: string;
}

export default function PortalConnection() {
  const connection = usePortalConnection();
  const save = useSavePortalConnection();
  const sendAll = useSendAllPortalClients();
  const [form] = Form.useForm<ConnectionForm>();

  useEffect(() => {
    if (connection.data) {
      form.setFieldsValue({
        enabled: connection.data.enabled,
        portalUrl: connection.data.portalUrl,
        apiKey: "",
      });
    }
  }, [connection.data, form]);

  const submit = async (values: ConnectionForm) => {
    await save.mutateAsync({
      enabled: values.enabled,
      portalUrl: values.portalUrl,
      apiKey: values.apiKey?.trim() ? values.apiKey.trim() : null,
    });
    getNotify().success({ message: "Connection saved." });
  };

  const sendAllClients = async () => {
    const count = await sendAll.mutateAsync();
    getNotify().success({
      message: `Sent ${count} ${count === 1 ? "client" : "clients"} to the client portal.`,
    });
  };

  const last = connection.data?.lastSync;
  const removal = last?.operation === "Remove";

  const statusTag = () => {
    if (!last) return null;
    if (last.waiting) return <Tag color="blue">Waiting for the portal</Tag>;
    if (!last.succeeded) return <Tag color="red">Needs attention</Tag>;
    return <Tag color="green">{removal ? "Removed" : "Sent"}</Tag>;
  };

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div>
        <Title level={3} className="m-0!">
          {CLIENT_PORTAL_LABEL.CONNECTION_TITLE}
        </Title>
        <Text type="secondary">{CLIENT_PORTAL_LABEL.CONNECTION_SUBTITLE}</Text>
      </div>

      <Card loading={connection.isLoading}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item
            label="Send approved time records to the client portal"
            name="enabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="Portal address"
            name="portalUrl"
            extra="For example https://portal.example.com"
          >
            <Input placeholder="https://" />
          </Form.Item>
          <Form.Item
            label="API key"
            name="apiKey"
            extra={
              connection.data?.hasApiKey
                ? "A key is saved. Leave this empty to keep it, or paste a new key to replace it. Time records do not use it; it is only for the company name and logo."
                : "Create an integration under Integrations, then paste its key here. Time records do not use it; it is only for the company name and logo."
            }
          >
            <Input.Password autoComplete="off" placeholder="cpk_…" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={save.isPending}>
            Save
          </Button>
        </Form>
      </Card>

      <Card title="Clients" loading={connection.isLoading}>
        <div className="flex flex-col gap-3">
          <Text type="secondary">
            Clients are sent to the portal when they are created or changed.
            Send them all once after switching the connection on, or whenever
            the portal was unavailable.
          </Text>
          <div>
            <Button
              onClick={sendAllClients}
              loading={sendAll.isPending}
              disabled={!connection.data?.enabled}
            >
              Send all clients
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Last send" loading={connection.isLoading}>
        {last ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {statusTag()}
              <Text>
                Batch {last.batchCode} ·{" "}
                {dayjs(last.atUtc).format("MMM D, YYYY h:mm A")}
              </Text>
            </div>
            <Text type="secondary">
              {last.waiting && last.partsReceived === 0
                ? `${last.records} time records sent.`
                : `${last.accepted} of ${last.records} time records ${removal ? "removed" : "accepted"}${last.rejected > 0 ? `, ${last.rejected} refused` : ""}.`}
            </Text>
            {last.message && (
              <Alert
                type={last.waiting || last.succeeded ? "info" : "warning"}
                showIcon
                message={last.message}
              />
            )}
            {last.errors && last.errors.length > 0 && (
              <ul className="m-0 pl-4">
                {last.errors.slice(0, 10).map((e, i) => (
                  <li key={`${e.externalId}-${i}`}>{e.error}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <Text type="secondary">
            Nothing has been sent yet. Time records are sent when a DTR batch is
            approved, sent again when a punch they use is edited or deleted, and
            removed when the batch is unposted or deleted.
          </Text>
        )}
      </Card>
    </div>
  );
}
