import { useState } from "react";
import {
  Form,
  Typography,
  Space,
  Tag,
  Button,
  Select,
  message,
  Popconfirm,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import {
  useUser,
  useReplaceRoles,
  useUpdateMemberStatus,
} from "../../hooks/use-user-queries";
import { USER_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

const AVAILABLE_ROLES = ["Owner", "Admin", "Member"];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Revoked", label: "Revoked" },
  { value: "Inactive", label: "Inactive" },
];

export default function UserDetail() {
  const { id } = useRouteParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: selected } = useUser(id);
  const { mutateAsync: replaceRoles, isPending: isReplacingRoles } =
    useReplaceRoles();
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } =
    useUpdateMemberStatus();

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  if (selected && !initialized) {
    setSelectedRoles(selected.roles ?? []);
    setSelectedStatus(selected.status ?? "Active");
    setInitialized(true);
  }

  const hasChanges =
    selected &&
    initialized &&
    (JSON.stringify(selectedRoles) !== JSON.stringify(selected.roles) ||
      selectedStatus !== selected.status);

  const isOwner = selected?.roles?.includes("Owner");
  const isSaving = isReplacingRoles || isUpdatingStatus;

  const handleSave = async () => {
    if (!id || !hasChanges) return;
    try {
      const promises: Promise<unknown>[] = [];

      if (JSON.stringify(selectedRoles) !== JSON.stringify(selected?.roles)) {
        promises.push(replaceRoles({ userId: id, roles: selectedRoles }));
      }

      if (selectedStatus !== selected?.status) {
        promises.push(updateStatus({ userId: id, status: selectedStatus }));
      }

      await Promise.all(promises);
      message.success("Member updated successfully");
    } catch {
      message.error("Failed to update member");
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {USER_LABEL.EDIT_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage membership roles and status.
            </p>
          </div>
          <Space>
            <Button onClick={() => navigate({ to: "/security/users" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical">
          <div className="form-grid-2">
            <Form.Item label={USER_LABEL.EMAIL}>
              <Typography.Text>{selected?.email ?? ""}</Typography.Text>
            </Form.Item>

            <Form.Item label={USER_LABEL.FULL_NAME}>
              <Typography.Text>{selected?.fullName ?? ""}</Typography.Text>
            </Form.Item>

            <Form.Item label={USER_LABEL.STATUS}>
              {isOwner ? (
                <Space>
                  <Tag color="red">Owner</Tag>
                  <Typography.Text type="secondary">
                    Owner status cannot be changed
                  </Typography.Text>
                </Space>
              ) : (
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={STATUS_OPTIONS}
                  style={{ width: 200 }}
                />
              )}
            </Form.Item>

            <Form.Item label={USER_LABEL.ROLES}>
              {isOwner ? (
                <Space>
                  <Tag color="red">Owner</Tag>
                  <Typography.Text type="secondary">
                    Owner roles cannot be changed
                  </Typography.Text>
                </Space>
              ) : (
                <Select
                  mode="multiple"
                  value={selectedRoles}
                  onChange={setSelectedRoles}
                  options={AVAILABLE_ROLES.map((r) => ({
                    value: r,
                    label: r,
                    disabled: r === "Owner",
                  }))}
                  style={{ width: "100%" }}
                  placeholder="Select roles"
                />
              )}
            </Form.Item>
          </div>

          {!isOwner && (
            <div className="form-action-footer">
              <Space className="form-action-footer-row">
                <Button
                  onClick={() => {
                    setSelectedRoles(selected?.roles ?? []);
                    setSelectedStatus(selected?.status ?? "Active");
                  }}
                >
                  Reset
                </Button>
                <Popconfirm
                  title="Update member?"
                  description="This will save the new role and status settings."
                  onConfirm={handleSave}
                  okText="Yes"
                  cancelText="No"
                  disabled={!hasChanges}
                >
                  <Button
                    type="primary"
                    loading={isSaving}
                    disabled={!hasChanges}
                  >
                    {NAVIGATION_BUTTON_LABEL.SAVE}
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
