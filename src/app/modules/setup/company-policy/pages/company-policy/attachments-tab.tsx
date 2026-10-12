import { useState } from "react";
import { Alert, Button, Card, Space, Switch, notification } from "antd";
import { problemDetail } from "@/core/auth/guard-error";
import {
  useAttachmentSettings,
  useSaveAttachmentSettings,
} from "@/shared/hooks/use-attachment-queries";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { ATTACHMENT_FEATURE } from "@/shared/constants/attachment.const";
import type { AttachmentOwnerType } from "@/shared/types/attachment.model";

/**
 * Which features may carry attached files. Off by default: every file counts against the
 * company's storage, so an admin opts each feature in.
 */
export default function AttachmentsTab() {
  const canEdit = useHasPermission("Organization Setup:Edit");
  const { data: settings = [], isLoading } = useAttachmentSettings();
  const { mutateAsync: save, isPending } = useSaveAttachmentSettings();
  // Unsaved switch changes on top of what the server has.
  const [changes, setChanges] = useState<
    Partial<Record<AttachmentOwnerType, boolean>>
  >({});

  const isOn = (setting: {
    ownerType: AttachmentOwnerType;
    enabled: boolean;
  }) => changes[setting.ownerType] ?? setting.enabled;
  const dirty = settings.some((s) => isOn(s) !== s.enabled);

  async function onSave() {
    try {
      await save(settings.map((s) => ({ ...s, enabled: isOn(s) })));
      setChanges({});
      notification.success({
        message: "Attachment settings saved",
        placement: "topRight",
      });
    } catch (err) {
      notification.error({
        message: "Save failed",
        description: problemDetail(
          err,
          "Failed to save attachment settings. Please try again.",
        ),
        placement: "topRight",
      });
    }
  }

  return (
    <div className="form-page-body flex flex-col gap-4">
      <Alert
        type="info"
        showIcon
        message="Attached files use your company's storage"
        description="Turn on attachments only for the features that need them. Each file can be a PNG, JPG, WebP image or a PDF of up to 5 MB, with at most 5 files per record. Turning a feature off keeps the files it already has; it only stops new uploads."
      />
      <Card
        title="Features that accept attachments"
        size="small"
        loading={isLoading}
      >
        <ul className="m-0 flex list-none flex-col p-0">
          {settings.map((setting) => {
            const feature = ATTACHMENT_FEATURE[setting.ownerType];
            return (
              <li
                key={setting.ownerType}
                className="flex items-center justify-between gap-4 border-b border-(--ant-color-border-secondary) py-2 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="font-medium">{feature.label}</div>
                  <div className="text-xs text-(--ant-color-text-secondary)">
                    {feature.description}
                  </div>
                </div>
                <Switch
                  checked={isOn(setting)}
                  disabled={!canEdit}
                  onChange={(checked) =>
                    setChanges((prev) => ({
                      ...prev,
                      [setting.ownerType]: checked,
                    }))
                  }
                />
              </li>
            );
          })}
        </ul>
      </Card>
      {canEdit && (
        <div className="form-action-footer">
          <Space className="form-action-footer-row">
            <Button
              type="primary"
              onClick={onSave}
              loading={isPending}
              disabled={!dirty}
            >
              Save Settings
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
}
