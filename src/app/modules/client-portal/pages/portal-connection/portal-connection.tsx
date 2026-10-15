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

  const last = connection.data?.lastSync;

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
                ? "A key is saved. Leave this empty to keep it, or paste a new key to replace it."
                : "Create an integration under Integrations, then paste its key here."
            }
          >
            <Input.Password autoComplete="off" placeholder="cpk_…" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={save.isPending}>
            Save
          </Button>
        </Form>
      </Card>

      <Card title="Last send" loading={connection.isLoading}>
        {last ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {last.succeeded ? (
                <Tag color="green">Sent</Tag>
              ) : (
                <Tag color="red">Needs attention</Tag>
              )}
              <Text>
                Batch {last.batchCode} ·{" "}
                {dayjs(last.atUtc).format("MMM D, YYYY h:mm A")}
              </Text>
            </div>
            <Text type="secondary">
              {last.accepted} of {last.records} time records accepted
              {last.rejected > 0 ? `, ${last.rejected} refused` : ""}.
            </Text>
            {last.message && (
              <Alert type="warning" showIcon message={last.message} />
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
            approved.
          </Text>
        )}
      </Card>
    </div>
  );
}
