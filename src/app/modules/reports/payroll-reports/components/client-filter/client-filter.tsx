import { Form, Select } from "antd";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";

interface Props {
  value?: string;
  onChange: (value?: string) => void;
}

// The optional "only this client's employees" filter shared by the reports. Clearing it (undefined)
// means everyone, and an unset clientId simply isn't sent to the API.
export function ClientFilter({ value, onChange }: Props) {
  const { data: clients = [] } = useClients();

  const options = clients
    .filter((c) => !c.status || c.status.toUpperCase() === "ACTIVE")
    .map((c) => ({ value: c.id, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Form.Item label="Client" className="mb-0 min-w-52">
      <Select
        allowClear
        showSearch={{ optionFilterProp: "label" }}
        placeholder="All Clients"
        options={options}
        value={value}
        onChange={onChange}
        className="w-full"
      />
    </Form.Item>
  );
}
