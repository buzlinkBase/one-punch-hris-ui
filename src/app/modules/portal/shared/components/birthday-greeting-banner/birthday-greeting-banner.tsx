import { Alert } from "antd";
import { GiftOutlined } from "@ant-design/icons";
import { isBirthdayToday } from "../../utils/is-birthday-today";

interface BirthdayGreetingBannerProps {
  firstName?: string;
  dob?: string | null;
}

/** Shown to the employee on their own birthday, whether or not they opted in to share it. */
export default function BirthdayGreetingBanner({
  firstName,
  dob,
}: BirthdayGreetingBannerProps) {
  if (!isBirthdayToday(dob)) return null;
  return (
    <Alert
      type="success"
      showIcon
      icon={<GiftOutlined />}
      className="mb-3"
      message={`Happy Birthday${firstName ? `, ${firstName}` : ""}!`}
      description="Wishing you a wonderful day from all of us."
    />
  );
}
