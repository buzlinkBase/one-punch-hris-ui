import { Button, Tooltip } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";

interface ContactActionsProps {
  email?: string | null;
  contact?: string | null;
}

/** One-click email / call buttons; only what the coworker chose to share is rendered. */
export default function ContactActions({
  email,
  contact,
}: ContactActionsProps) {
  if (!email && !contact) return null;

  return (
    <div className="mt-1 flex items-center gap-1">
      {email && (
        <Tooltip title={email}>
          <Button
            size="small"
            type="text"
            icon={<MailOutlined />}
            href={`mailto:${email}`}
            aria-label={`Email ${email}`}
          />
        </Tooltip>
      )}
      {contact && (
        <Tooltip title={contact}>
          <Button
            size="small"
            type="text"
            icon={<PhoneOutlined />}
            href={`tel:${contact}`}
            aria-label={`Call ${contact}`}
          />
        </Tooltip>
      )}
    </div>
  );
}
