import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import {
  useAddPostRequirement,
  useClientPosts,
  useClientSites,
  useRemoveClientPost,
  useRemoveClientSite,
  useSaveClientPost,
  useSaveClientSite,
} from "../../hooks/use-deployment-queries";
import {
  DATE_FORMAT,
  DEPLOYMENT_PERMISSION,
  WEEKDAY_OPTIONS,
} from "../../constants/label.const";
import {
  clientPostFormSchema,
  clientSiteFormSchema,
  postRequirementFormSchema,
  type ClientPostFormValues,
  type ClientSiteFormValues,
  type PostRequirementFormValues,
} from "../../models/forms/deployment-form.schema";
import type {
  ClientPostResponse,
  ClientSiteResponse,
  PostRequirementResponse,
} from "../../models/api/response/deployment-response.model";
import { FormField } from "../form-field";
import { requirementLabel } from "../../utils/requirement-label";

const { Text } = Typography;

const dateValue = (value: string) => (value ? dayjs(value) : null);
const toDate = (d: dayjs.Dayjs | null) => (d ? d.format(DATE_FORMAT) : "");

interface SitesPanelProps {
  clientId: string;
}

/** A client's sites; each one expands to its posts, their manning and who is deployed to them. */
export function SitesPanel({ clientId }: SitesPanelProps) {
  const sites = useClientSites(clientId);
  const remove = useRemoveClientSite();
  const [editing, setEditing] = useState<{ site: ClientSiteResponse | null }>();

  const columns: ColumnsType<ClientSiteResponse> = [
    { title: "Code", dataIndex: "code", width: 100 },
    {
      title: "Site",
      key: "name",
      render: (_, s) => (
        <div>
          <div className="font-medium">{s.name}</div>
          <Text type="secondary" className="text-xs">
            {s.areaName}
            {s.subAreaLabel && ` · ${s.subAreaLabel}`}
          </Text>
        </div>
      ),
    },
    { title: "Posts", dataIndex: "postCount", align: "right", width: 80 },
    {
      title: "Needed today",
      dataIndex: "requiredHeadcount",
      align: "right",
      width: 120,
    },
    {
      title: "Deployed",
      key: "deployed",
      align: "right",
      width: 110,
      render: (_, s) => (
        <Text
          type={
            s.deployedHeadcount < s.requiredHeadcount ? "danger" : undefined
          }
        >
          {s.deployedHeadcount}
        </Text>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, s) => (
        <PermissionGate permission={DEPLOYMENT_PERMISSION.EDIT}>
          <Space>
            <Button size="small" onClick={() => setEditing({ site: s })}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this site and its posts?"
              onConfirm={async () => {
                await remove.mutateAsync(s.id);
                getNotify().success({ message: "Site deleted." });
              }}
            >
              <Button size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <PermissionGate permission={DEPLOYMENT_PERMISSION.EDIT}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEditing({ site: null })}
          >
            Add site
          </Button>
        </PermissionGate>
      </div>
      <Table<ClientSiteResponse>
        rowKey="id"
        size="small"
        loading={sites.isLoading}
        dataSource={sites.data ?? []}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No sites yet." }}
        expandable={{
          expandedRowRender: (s) => <PostsTable siteId={s.id} />,
        }}
      />
      {editing && (
        <SiteModal
          clientId={clientId}
          site={editing.site}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}

function SiteModal({
  clientId,
  site,
  onClose,
}: {
  clientId: string;
  site: ClientSiteResponse | null;
  onClose: () => void;
}) {
  const save = useSaveClientSite();
  const areas = useOperationAreas();
  const { control, handleSubmit } = useForm<ClientSiteFormValues>({
    resolver: zodResolver(clientSiteFormSchema),
    defaultValues: {
      code: site?.code ?? "",
      name: site?.name ?? "",
      areaId: site?.areaId ?? "",
      subAreaLabel: site?.subAreaLabel ?? "",
      startDate: site?.startDate ?? "",
      endDate: site?.endDate ?? "",
    },
  });

  const submit = handleSubmit(async (v) => {
    await save.mutateAsync({
      clientId,
      id: site?.id ?? null,
      request: {
        code: v.code,
        name: v.name,
        areaId: v.areaId,
        subAreaLabel: v.subAreaLabel || null,
        startDate: v.startDate || null,
        endDate: v.endDate || null,
      },
    });
    getNotify().success({ message: "Site saved." });
    onClose();
  });

  return (
    <Modal
      open
      title={site ? `Edit ${site.name}` : "Add site"}
      okText="Save"
      confirmLoading={save.isPending}
      onCancel={onClose}
      onOk={submit}
    >
      <Form layout="vertical" component="div">
        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <FormField
            control={control}
            name="code"
            label="Code"
            render={(f) => <Input {...f} maxLength={40} />}
          />
          <FormField
            control={control}
            name="name"
            label="Name"
            render={(f) => <Input {...f} maxLength={200} />}
          />
          <FormField
            control={control}
            name="areaId"
            label="Project site"
            extra="Where the site's attendance and payroll belong."
            className="sm:col-span-2"
            render={(f) => (
              <Select
                {...f}
                showSearch
                optionFilterProp="label"
                loading={areas.isLoading}
                options={(areas.data ?? []).map((a) => ({
                  value: a.id,
                  label: `${a.code} - ${a.name}`,
                }))}
              />
            )}
          />
          <FormField
            control={control}
            name="subAreaLabel"
            label="Area label"
            extra="Part of the site billed on its own, for example AGWA."
            className="sm:col-span-2"
            render={(f) => <Input {...f} maxLength={100} />}
          />
          <FormField
            control={control}
            name="startDate"
            label="Served from"
            render={(f) => (
              <DatePicker
                className="w-full"
                value={dateValue(f.value)}
                onChange={(d) => f.onChange(toDate(d))}
              />
            )}
          />
          <FormField
            control={control}
            name="endDate"
            label="Served until"
            render={(f) => (
              <DatePicker
                className="w-full"
                value={dateValue(f.value)}
                onChange={(d) => f.onChange(toDate(d))}
              />
            )}
          />
        </div>
      </Form>
    </Modal>
  );
}

function PostsTable({ siteId }: { siteId: string }) {
  const posts = useClientPosts(siteId);
  const remove = useRemoveClientPost();
  const [editing, setEditing] = useState<{ post: ClientPostResponse | null }>();
  const [manningFor, setManningFor] = useState<ClientPostResponse>();

  const columns: ColumnsType<ClientPostResponse> = [
    { title: "Code", dataIndex: "code", width: 90 },
    {
      title: "Post",
      key: "name",
      render: (_, p) => (
        <div>
          <div>{p.name}</div>
          <Text type="secondary" className="text-xs">
            {p.position}
            {p.armed && " · armed"}
          </Text>
        </div>
      ),
    },
    {
      title: "Manning now",
      key: "manning",
      render: (_, p) =>
        p.currentRequirements.length === 0 ? (
          <Tag>None set</Tag>
        ) : (
          <div className="flex flex-wrap gap-1">
            {p.currentRequirements.map((r) => (
              <Tag key={r.id}>{requirementLabel(r)}</Tag>
            ))}
          </div>
        ),
    },
    {
      title: "Regulars",
      dataIndex: "deployedRegulars",
      align: "right",
      width: 90,
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, p) => (
        <PermissionGate permission={DEPLOYMENT_PERMISSION.EDIT}>
          <Space>
            <Button size="small" onClick={() => setManningFor(p)}>
              Set manning
            </Button>
            <Button size="small" onClick={() => setEditing({ post: p })}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this post?"
              onConfirm={async () => {
                await remove.mutateAsync(p.id);
                getNotify().success({ message: "Post deleted." });
              }}
            >
              <Button size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </PermissionGate>
      ),
    },
  ];

  const historyColumns: ColumnsType<PostRequirementResponse> = [
    { title: "From", dataIndex: "effectiveFrom", width: 110 },
    {
      title: "Until",
      key: "to",
      width: 110,
      render: (_, r) => r.effectiveTo ?? "—",
    },
    { title: "Manning", key: "label", render: (_, r) => requirementLabel(r) },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Table<ClientPostResponse>
        rowKey="id"
        size="small"
        loading={posts.isLoading}
        dataSource={posts.data ?? []}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No posts yet." }}
        expandable={{
          rowExpandable: (p) => p.requirements.length > 0,
          expandedRowRender: (p) => (
            <Table<PostRequirementResponse>
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={p.requirements}
              columns={historyColumns}
            />
          ),
        }}
      />
      <PermissionGate permission={DEPLOYMENT_PERMISSION.EDIT}>
        <Button
          size="small"
          icon={<PlusOutlined />}
          className="self-start"
          onClick={() => setEditing({ post: null })}
        >
          Add post
        </Button>
      </PermissionGate>
      {editing && (
        <PostModal
          siteId={siteId}
          post={editing.post}
          onClose={() => setEditing(undefined)}
        />
      )}
      {manningFor && (
        <RequirementModal
          post={manningFor}
          onClose={() => setManningFor(undefined)}
        />
      )}
    </div>
  );
}

function PostModal({
  siteId,
  post,
  onClose,
}: {
  siteId: string;
  post: ClientPostResponse | null;
  onClose: () => void;
}) {
  const save = useSaveClientPost();
  const { control, handleSubmit } = useForm<ClientPostFormValues>({
    resolver: zodResolver(clientPostFormSchema),
    defaultValues: {
      code: post?.code ?? "",
      name: post?.name ?? "",
      position: post?.position ?? "Regular guard",
      armed: post?.armed ?? false,
      notes: post?.notes ?? "",
    },
  });

  const submit = handleSubmit(async (v) => {
    await save.mutateAsync({
      siteId,
      id: post?.id ?? null,
      request: { ...v, notes: v.notes || null },
    });
    getNotify().success({ message: "Post saved." });
    onClose();
  });

  return (
    <Modal
      open
      title={post ? `Edit ${post.name}` : "Add post"}
      okText="Save"
      confirmLoading={save.isPending}
      onCancel={onClose}
      onOk={submit}
    >
      <Form layout="vertical" component="div">
        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <FormField
            control={control}
            name="code"
            label="Code"
            render={(f) => <Input {...f} maxLength={40} />}
          />
          <FormField
            control={control}
            name="name"
            label="Name"
            render={(f) => (
              <Input {...f} maxLength={200} placeholder="Gate 1" />
            )}
          />
          <FormField
            control={control}
            name="position"
            label="Position the post needs"
            render={(f) => (
              <Input
                {...f}
                maxLength={100}
                placeholder="Regular guard, Detachment commander, K9"
              />
            )}
          />
          <FormField
            control={control}
            name="armed"
            label="Armed post"
            render={(f) => (
              <Switch checked={f.value} onChange={(v) => f.onChange(v)} />
            )}
          />
          <FormField
            control={control}
            name="notes"
            label="Notes"
            className="sm:col-span-2"
            render={(f) => <Input.TextArea {...f} rows={2} maxLength={500} />}
          />
        </div>
      </Form>
    </Modal>
  );
}

function RequirementModal({
  post,
  onClose,
}: {
  post: ClientPostResponse;
  onClose: () => void;
}) {
  const add = useAddPostRequirement();
  const shifts = useFixedTimeShifts();
  const { control, handleSubmit } = useForm<PostRequirementFormValues>({
    resolver: zodResolver(postRequirementFormSchema),
    defaultValues: {
      shiftLabel: "DS",
      timeShiftId: "",
      requiredHeadcount: 1,
      daysOfWeek: [],
      effectiveFrom: dayjs().format(DATE_FORMAT),
      effectiveTo: "",
    },
  });

  const submit = handleSubmit(async (v) => {
    const shift = (shifts.data ?? []).find((s) => s.id === v.timeShiftId);
    await add.mutateAsync({
      postId: post.id,
      request: {
        shiftLabel: v.shiftLabel,
        timeShiftId: v.timeShiftId || null,
        startTime: shift?.startTime ?? null,
        endTime: shift?.endTime ?? null,
        requiredHeadcount: v.requiredHeadcount,
        daysOfWeek: v.daysOfWeek,
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo || null,
      },
    });
    getNotify().success({ message: "Manning saved." });
    onClose();
  });

  return (
    <Modal
      open
      title={`Manning: ${post.name}`}
      okText="Save"
      confirmLoading={add.isPending}
      onCancel={onClose}
      onOk={submit}
    >
      <Text type="secondary" className="mb-3 block">
        How many people the post needs on a shift, from a date. It replaces the
        shift&apos;s current manning from that date; earlier periods keep
        theirs.
      </Text>
      <Form layout="vertical" component="div">
        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <FormField
            control={control}
            name="shiftLabel"
            label="Shift"
            extra="As it appears on time logs: DS, NS, Day, Night."
            render={(f) => <Input {...f} maxLength={60} />}
          />
          <FormField
            control={control}
            name="requiredHeadcount"
            label="People needed"
            render={(f) => (
              <InputNumber
                className="w-full"
                min={1}
                max={500}
                value={f.value}
                onChange={(v) => f.onChange(v ?? 0)}
              />
            )}
          />
          <FormField
            control={control}
            name="timeShiftId"
            label="Time shift"
            className="sm:col-span-2"
            render={(f) => (
              <Select
                {...f}
                allowClear
                placeholder="Hours vary"
                loading={shifts.isLoading}
                options={(shifts.data ?? []).map((s) => ({
                  value: s.id,
                  label: `${s.shiftName} (${s.startTime}–${s.endTime})`,
                }))}
                onChange={(v) => f.onChange(v ?? "")}
              />
            )}
          />
          <FormField
            control={control}
            name="daysOfWeek"
            label="Days"
            extra="Leave empty for every day."
            className="sm:col-span-2"
            render={(f) => (
              <Select {...f} mode="multiple" options={WEEKDAY_OPTIONS} />
            )}
          />
          <FormField
            control={control}
            name="effectiveFrom"
            label="From"
            render={(f) => (
              <DatePicker
                className="w-full"
                value={dateValue(f.value)}
                onChange={(d) => f.onChange(toDate(d))}
              />
            )}
          />
          <FormField
            control={control}
            name="effectiveTo"
            label="Until"
            extra="Leave empty for open-ended."
            render={(f) => (
              <DatePicker
                className="w-full"
                value={dateValue(f.value)}
                onChange={(d) => f.onChange(toDate(d))}
              />
            )}
          />
        </div>
      </Form>
    </Modal>
  );
}
