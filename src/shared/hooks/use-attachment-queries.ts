import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attachmentApi } from "../services/attachment.api";
import type {
  AttachmentOwnerType,
  AttachmentSettingResponse,
} from "../types/attachment.model";

const SETTINGS_KEY = ["attachments", "settings"];
const FILES_KEY = (ownerType: AttachmentOwnerType, ownerId?: string) => [
  "attachments",
  ownerType,
  ownerId ?? "staged",
];

export function useAttachmentSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => attachmentApi.getSettings(),
  });
}

/** Whether the company lets this feature carry attachments (false until the settings load). */
export function useAttachmentsEnabled(ownerType: AttachmentOwnerType): boolean {
  const { data } = useAttachmentSettings();
  return data?.find((s) => s.ownerType === ownerType)?.enabled ?? false;
}

export function useSaveAttachmentSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: AttachmentSettingResponse[]) =>
      attachmentApi.saveSettings(settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });
}

/**
 * A record's files. With `ownerId` they are attached to that record straight away; without, they
 * are staged (kept for the caller) until the record is saved and `useLinkAttachments` claims them.
 */
export function useAttachments(
  ownerType: AttachmentOwnerType,
  ownerId?: string,
  enabled = true,
) {
  const qc = useQueryClient();
  const key = FILES_KEY(ownerType, ownerId);
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const files = useQuery({
    queryKey: key,
    queryFn: () =>
      ownerId
        ? attachmentApi.list(ownerType, ownerId)
        : attachmentApi.listStaged(ownerType),
    enabled,
  });
  const upload = useMutation({
    mutationFn: (file: File) => attachmentApi.upload(ownerType, file, ownerId),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => attachmentApi.remove(id),
    onSuccess: invalidate,
  });

  return { files, upload, remove };
}

/**
 * For a create form: the caller's staged files, `linkTo` to claim them for the record once it is
 * saved, and `discard` to delete them when the form is cancelled.
 */
export function useStagedAttachments(ownerType: AttachmentOwnerType) {
  const { files, remove } = useAttachments(ownerType);
  const link = useLinkAttachments(ownerType);
  const qc = useQueryClient();
  const stagedIds = (files.data ?? []).map((f) => f.id);

  return {
    stagedIds,
    /** After a save that claimed the staged files itself (`attachmentIds` in the payload). */
    refresh: () =>
      qc.invalidateQueries({ queryKey: ["attachments", ownerType] }),
    linkTo: async (ownerId: string) => {
      if (stagedIds.length > 0)
        await link.mutateAsync({ ownerId, attachmentIds: stagedIds });
    },
    discard: async () => {
      await Promise.allSettled(stagedIds.map((id) => remove.mutateAsync(id)));
    },
  };
}

/** Claims the caller's staged files for a record that was just created. */
export function useLinkAttachments(ownerType: AttachmentOwnerType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { ownerId: string; attachmentIds: string[] }) =>
      attachmentApi.link(ownerType, args.ownerId, args.attachmentIds),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["attachments", ownerType] }),
  });
}
