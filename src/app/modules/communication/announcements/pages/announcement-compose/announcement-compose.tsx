import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Modal,
  Segmented,
  Skeleton,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  SaveOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs, { type Dayjs } from "dayjs";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { LinkifiedText } from "@/shared/components/linkified-text/linkified-text";
import { ANNOUNCEMENT_PRIORITY_COLOR } from "@/shared/types/announcement.model";
import {
  announcementFormSchema,
  BODY_MAX,
  EMPTY_ANNOUNCEMENT_FORM,
  TITLE_MAX,
  type AnnouncementFormValues,
} from "../../models/forms/announcement-form.schema";
import {
  toFormValues,
  toPreviewRequest,
  toUpsertRequest,
} from "../../services/announcement.mapper";
import {
  useAnnouncement,
  useAudiencePreview,
  useCreateAnnouncementDraft,
  usePublishAnnouncement,
  useScheduleAnnouncement,
  useUnscheduleAnnouncement,
  useUpdateAnnouncement,
} from "../../hooks/use-announcement-queries";
import { useAudienceTargetOptions } from "../../hooks/use-audience-target-options";
import { AudienceBuilder } from "../../components/audience-builder/audience-builder";
import { AudiencePreviewCard } from "../../components/audience-preview-card/audience-preview-card";
import {
  ANNOUNCEMENT_LABEL,
  ANNOUNCEMENT_PATH,
  ANNOUNCEMENT_PERMISSION,
  PRIORITY_OPTIONS,
  STATE_TAG,
} from "../../constants/label.const";

const { Title, Text } = Typography;

const DATE_TIME_FORMAT = "MMM D, YYYY h:mm A";
const toDayjs = (value: string | null) => (value ? dayjs(value) : null);
const toIso = (value: Dayjs | null) => (value ? value.toISOString() : null);
const beforeToday = (d: Dayjs) => d.isBefore(dayjs(), "day");

export default function AnnouncementCompose() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: existing, isLoading } = useAnnouncement(id);
  const { mutateAsync: createDraft, isPending: isCreating } =
    useCreateAnnouncementDraft();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateAnnouncement();
  const { mutateAsync: publish, isPending: isPublishing } =
    usePublishAnnouncement();
  const { mutateAsync: schedule, isPending: isScheduling } =
    useScheduleAnnouncement();
  const { mutateAsync: unschedule } = useUnscheduleAnnouncement();

  const canPublish = useHasPermission(ANNOUNCEMENT_PERMISSION.PUBLISH);
  const canWrite = useHasPermission(
    isEdit ? ANNOUNCEMENT_PERMISSION.EDIT : ANNOUNCEMENT_PERMISSION.CREATE,
  );

  const state = existing?.state ?? "Draft";
  const isPublished = state === "Published";
  const isScheduled = state === "Scheduled";
  const editable =
    canWrite && (!isEdit || !!existing?.allowedActions.includes("Edit"));

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [publishAt, setPublishAt] = useState<Dayjs | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: EMPTY_ANNOUNCEMENT_FORM,
  });

  useEffect(() => {
    if (existing) reset(toFormValues(existing));
  }, [existing, reset]);

  const values = useWatch({ control });
  const rules = (values.audienceRules ??
    []) as AnnouncementFormValues["audienceRules"];
  // Debounce a stable string, not the request object -- a fresh object every render would
  // keep resetting the debounce and re-rendering forever.
  const previewKey = useDebouncedValue(
    JSON.stringify(toPreviewRequest(rules, values.excludeInactive ?? true)),
  );
  const previewRequest = useMemo(
    () => JSON.parse(previewKey) as ReturnType<typeof toPreviewRequest>,
    [previewKey],
  );
  const { data: preview, isFetching: previewLoading } =
    useAudiencePreview(previewRequest);
  const hasInclusion = rules.some((r) => r && !r.isExclusion);

  const { options, isLoading: optionsLoading } = useAudienceTargetOptions();

  const saving = isCreating || isUpdating || isPublishing || isScheduling;

  const save = async (form: AnnouncementFormValues): Promise<string> => {
    const request = toUpsertRequest(form);
    if (id) {
      await update({ id, request });
      return id;
    }
    return createDraft(request);
  };

  const onSaveDraft = handleSubmit(async (form) => {
    const savedId = await save(form);
    message.success(isPublished ? "Changes saved." : "Draft saved.");
    if (!id) navigate({ to: ANNOUNCEMENT_PATH.edit(savedId), replace: true });
  });

  const onPublishNow = handleSubmit((form) => {
    const count = preview?.total ?? 0;
    Modal.confirm({
      title: `Publish to ${count} ${count === 1 ? "person" : "people"} now?`,
      content:
        "They get it right away, with a live notification. You can still edit, remind or unpublish it afterwards.",
      okText: "Publish",
      onOk: async () => {
        const savedId = await save(form);
        await publish(savedId);
        message.success("Published.");
        navigate({ to: ANNOUNCEMENT_PATH.report(savedId) });
      },
    });
  });

  const onOpenSchedule = handleSubmit(() => {
    setPublishAt(
      toDayjs(existing?.publishAtUtc ?? null) ??
        dayjs().add(1, "hour").startOf("hour"),
    );
    setScheduleOpen(true);
  });

  const onConfirmSchedule = handleSubmit(async (form) => {
    if (!publishAt) return;
    const savedId = await save(form);
    // A scheduled one is rescheduled by cancelling, then scheduling again.
    if (isScheduled) await unschedule(savedId);
    await schedule({ id: savedId, publishAtUtc: publishAt.toISOString() });
    message.success(`Scheduled for ${publishAt.format(DATE_TIME_FORMAT)}.`);
    setScheduleOpen(false);
    navigate({ to: ANNOUNCEMENT_PATH.LIST });
  });

  if (isEdit && isLoading) {
    return (
      <div className="content-page">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  const priority = values.priority ?? "Normal";

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate({ to: ANNOUNCEMENT_PATH.LIST })}
              aria-label="Back"
            />
            <Title level={4} className="mb-0!">
              {isEdit
                ? ANNOUNCEMENT_LABEL.EDIT_TITLE
                : ANNOUNCEMENT_LABEL.CREATE_TITLE}
            </Title>
            {isEdit && (
              <Tag color={STATE_TAG[state].color}>{STATE_TAG[state].label}</Tag>
            )}
          </div>
        </div>
      </div>

      {isPublished && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message="This announcement is already published"
          description="Saving changes updates it for everyone and marks it as Edited. Who it went to can't change — duplicate it to send to another group."
        />
      )}
      {isScheduled && existing?.publishAtUtc && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message={`Scheduled to publish automatically on ${dayjs(existing.publishAtUtc).format(DATE_TIME_FORMAT)}.`}
        />
      )}
      {isEdit && !editable && (
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message="This announcement can't be edited in its current state."
        />
      )}

      <Form layout="vertical" disabled={!editable || saving}>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-4">
            <Card size="small" title="Message">
              <Form.Item
                label="Title"
                required
                validateStatus={errors.title ? "error" : ""}
                help={errors.title?.message}
              >
                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <Input
                      {...field}
                      maxLength={TITLE_MAX}
                      showCount
                      placeholder="e.g. Office closed this Friday"
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label="Message"
                required
                validateStatus={errors.body ? "error" : ""}
                help={
                  errors.body?.message ??
                  "Plain text. Line breaks are kept and links become clickable."
                }
              >
                <Controller
                  control={control}
                  name="body"
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      autoSize={{ minRows: 8, maxRows: 20 }}
                      maxLength={BODY_MAX}
                      showCount
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label="Priority"
                extra={
                  priority === "Urgent"
                    ? "Urgent announcements that ask for acknowledgement block employees until they acknowledge."
                    : undefined
                }
              >
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Segmented
                      options={PRIORITY_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Form.Item>
            </Card>

            <Card size="small" title="Audience">
              <AudienceBuilder
                control={control}
                errors={errors.audienceRules}
                options={options}
                loading={optionsLoading}
                disabled={!editable || isPublished}
              />
              <Controller
                control={control}
                name="excludeInactive"
                render={({ field }) => (
                  <Checkbox
                    className="mt-3"
                    disabled={!editable || isPublished}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Leave out employees who have left (resigned, terminated,
                    retired)
                  </Checkbox>
                )}
              />
            </Card>

            <Card size="small" title="Delivery">
              <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                <Form.Item label="Require acknowledgement">
                  <Controller
                    control={control}
                    name="requiresAcknowledgement"
                    render={({ field }) => (
                      <Switch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </Form.Item>
                {values.requiresAcknowledgement && (
                  <Form.Item label="Acknowledge by (optional)">
                    <Controller
                      control={control}
                      name="acknowledgeByUtc"
                      render={({ field }) => (
                        <DatePicker
                          showTime={{ format: "h:mm A", minuteStep: 5 }}
                          format={DATE_TIME_FORMAT}
                          className="w-full"
                          value={toDayjs(field.value)}
                          onChange={(d) => field.onChange(toIso(d))}
                          disabledDate={beforeToday}
                        />
                      )}
                    />
                  </Form.Item>
                )}
                {isPublished && values.requiresAcknowledgement && (
                  <Form.Item className="md:col-span-2">
                    <Controller
                      control={control}
                      name="requireReacknowledgement"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        >
                          Ask everyone to acknowledge this update again
                        </Checkbox>
                      )}
                    />
                  </Form.Item>
                )}
                <Form.Item label="Pin to top">
                  <Controller
                    control={control}
                    name="isPinned"
                    render={({ field }) => (
                      <Switch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </Form.Item>
                {values.isPinned && (
                  <Form.Item
                    label="Pinned until (optional)"
                    validateStatus={errors.pinnedUntilUtc ? "error" : ""}
                    help={errors.pinnedUntilUtc?.message}
                  >
                    <Controller
                      control={control}
                      name="pinnedUntilUtc"
                      render={({ field }) => (
                        <DatePicker
                          showTime={{ format: "h:mm A", minuteStep: 5 }}
                          format={DATE_TIME_FORMAT}
                          className="w-full"
                          value={toDayjs(field.value)}
                          onChange={(d) => field.onChange(toIso(d))}
                          disabledDate={beforeToday}
                        />
                      )}
                    />
                  </Form.Item>
                )}
                <Form.Item
                  label="Expires (optional)"
                  validateStatus={errors.expiresAtUtc ? "error" : ""}
                  help={
                    errors.expiresAtUtc?.message ??
                    "Archived automatically at this time."
                  }
                >
                  <Controller
                    control={control}
                    name="expiresAtUtc"
                    render={({ field }) => (
                      <DatePicker
                        showTime={{ format: "h:mm A", minuteStep: 5 }}
                        format={DATE_TIME_FORMAT}
                        className="w-full"
                        value={toDayjs(field.value)}
                        onChange={(d) => field.onChange(toIso(d))}
                        disabledDate={beforeToday}
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <AudiencePreviewCard
              preview={preview}
              loading={previewLoading}
              hasInclusion={hasInclusion}
              sentTo={isPublished ? existing?.recipientCount : undefined}
            />
            <Card size="small" title="How employees will see it">
              <div className="mb-2 flex flex-wrap gap-1">
                {values.isPinned && <Tag color="blue">Pinned</Tag>}
                {priority !== "Normal" && (
                  <Tag color={ANNOUNCEMENT_PRIORITY_COLOR[priority]}>
                    {priority}
                  </Tag>
                )}
                {values.requiresAcknowledgement && (
                  <Tag color="gold">Needs acknowledgement</Tag>
                )}
              </div>
              <Text strong className="block text-base">
                {values.title?.trim() || "Your title"}
              </Text>
              <LinkifiedText
                text={values.body?.trim() || "Your message appears here."}
                className="mt-2 max-h-80 overflow-y-auto text-sm text-(--ant-color-text-secondary)"
              />
            </Card>
          </div>
        </div>
      </Form>

      {editable && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button onClick={() => navigate({ to: ANNOUNCEMENT_PATH.LIST })}>
            Cancel
          </Button>
          <Button
            icon={<SaveOutlined />}
            loading={saving}
            onClick={onSaveDraft}
          >
            {isPublished || isScheduled ? "Save changes" : "Save draft"}
          </Button>
          {canPublish && !isPublished && (
            <Space.Compact>
              <Button
                icon={<CalendarOutlined />}
                disabled={saving || !hasInclusion}
                onClick={onOpenSchedule}
              >
                {isScheduled ? "Reschedule" : "Schedule"}
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                disabled={
                  saving || !hasInclusion || (preview?.total ?? 0) === 0
                }
                onClick={onPublishNow}
              >
                Publish now
              </Button>
            </Space.Compact>
          )}
        </div>
      )}

      <Modal
        open={scheduleOpen}
        title={
          isScheduled ? "Reschedule announcement" : "Schedule announcement"
        }
        okText="Schedule"
        okButtonProps={{ disabled: !publishAt || publishAt.isBefore(dayjs()) }}
        confirmLoading={saving}
        onCancel={() => setScheduleOpen(false)}
        onOk={onConfirmSchedule}
      >
        <Text type="secondary" className="mb-3 block">
          It publishes automatically at this time, to everyone who matches its
          audience then.
        </Text>
        <DatePicker
          showTime={{ format: "h:mm A", minuteStep: 5 }}
          format={DATE_TIME_FORMAT}
          className="w-full"
          value={publishAt}
          onChange={setPublishAt}
          disabledDate={beforeToday}
        />
      </Modal>
    </div>
  );
}
