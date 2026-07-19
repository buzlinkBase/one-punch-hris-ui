import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { commandsApi } from "../services/commands.api";
import type { EnrollFPPayload } from "../models/api/request/enroll-fp.model";
import type { EnrollFacePayload } from "../models/api/request/enroll-face.model";
import type { SetEmployeeCommandPayload } from "../models/api/request/set-employee-command.model";
import type { SyncBioPayload } from "../models/api/request/sync-bio.model";
import type { PullAttPayload } from "../models/api/request/pull-att.model";

const COMMANDS_KEY = ["biometric-commands"] as const;
const commandsKey = (sn: string) => [...COMMANDS_KEY, sn] as const;

export function usePendingCommands(sn?: string) {
  return useQuery({
    queryKey: commandsKey(sn ?? ""),
    queryFn: () => commandsApi.getPending(sn!),
    enabled: Boolean(sn),
  });
}

function useCommandMutation<TVar>(
  mutationFn: (vars: TVar) => Promise<void>,
  successMsg: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      message.success(successMsg);
      queryClient.invalidateQueries({ queryKey: COMMANDS_KEY });
    },
    onError: () => {
      message.error("Command failed. Please try again.");
    },
  });
}

export function useDeleteCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commandsApi.deleteCommand(id),
    onSuccess: () => {
      message.success("Command removed from queue");
      queryClient.invalidateQueries({ queryKey: COMMANDS_KEY });
    },
    onError: () => {
      message.error("Failed to delete command");
    },
  });
}

export function useEnrollFingerprint() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: EnrollFPPayload }) =>
      commandsApi.enrollFingerprint(sn, payload),
    "Fingerprint enrollment command queued",
  );
}

export function useEnrollFace() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: EnrollFacePayload }) =>
      commandsApi.enrollFace(sn, payload),
    "Face enrollment command queued",
  );
}

export function useSyncEmployees() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: SetEmployeeCommandPayload[] }) =>
      commandsApi.syncEmployees(sn, payload),
    "Sync employees command queued",
  );
}

export function useSyncBiometric() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: SyncBioPayload[] }) =>
      commandsApi.syncBiometric(sn, payload),
    "Sync biometrics command queued",
  );
}

export function useSyncFace() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: SyncBioPayload[] }) =>
      commandsApi.syncFace(sn, payload),
    "Sync face templates command queued",
  );
}

export function useReboot() {
  return useCommandMutation(
    (sn: string) => commandsApi.reboot(sn),
    "Reboot command queued",
  );
}

export function useClearLogs() {
  return useCommandMutation(
    (sn: string) => commandsApi.clearLogs(sn),
    "Clear logs command queued",
  );
}

export function useSetTime() {
  return useCommandMutation(
    ({ sn, autoServerTime }: { sn: string; autoServerTime: boolean }) =>
      commandsApi.setTime(sn, autoServerTime),
    "Set time command queued",
  );
}

export function useEnableAttendance() {
  return useCommandMutation(
    ({ sn, enable }: { sn: string; enable: number }) =>
      commandsApi.enableAttendance(sn, enable),
    "Attendance command queued",
  );
}

export function useClearAdmin() {
  return useCommandMutation(
    (sn: string) => commandsApi.clearAdmin(sn),
    "Clear admin command queued",
  );
}

export function usePullAttendance() {
  return useCommandMutation(
    (payload: PullAttPayload) => commandsApi.pullAttendance(payload),
    "Pull attendance command queued",
  );
}

export function useQueryTemplates() {
  return useCommandMutation(
    ({ sn, pin, fid }: { sn: string; pin?: string; fid?: number }) =>
      commandsApi.queryTemplates(sn, pin, fid),
    "Query templates command queued",
  );
}

export function useQueryTemplatesBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sn,
      pins,
      fid,
    }: {
      sn: string;
      pins: string[];
      fid?: number;
    }) =>
      Promise.all(
        pins.map((pin) => commandsApi.queryTemplates(sn, pin, fid)),
      ).then(() => undefined),
    onSuccess: () => {
      message.success("Query templates commands queued");
      queryClient.invalidateQueries({ queryKey: COMMANDS_KEY });
    },
    onError: () => {
      message.error("Some query commands failed. Please try again.");
    },
  });
}

export function useRegistryReset() {
  return useCommandMutation(
    (sn: string) => commandsApi.registryReset(sn),
    "Registry reset command queued",
  );
}

export function useDeleteEmployee() {
  return useCommandMutation(
    ({ sn, pin }: { sn: string; pin: string }) =>
      commandsApi.deleteEmployee(sn, pin),
    "Delete employee command queued",
  );
}

export function useDeleteFingerprint() {
  return useCommandMutation(
    ({
      sn,
      pin,
      fingerIndex,
    }: {
      sn: string;
      pin: string;
      fingerIndex?: number;
    }) => commandsApi.deleteFingerprint(sn, pin, fingerIndex),
    "Delete fingerprint command queued",
  );
}

export function useDeleteEmployeesBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sn, pins }: { sn: string; pins: string[] }) =>
      Promise.all(pins.map((pin) => commandsApi.deleteEmployee(sn, pin))).then(
        () => undefined,
      ),
    onSuccess: () => {
      message.success("Delete employee commands queued");
      queryClient.invalidateQueries({ queryKey: COMMANDS_KEY });
    },
    onError: () => {
      message.error("Some delete commands failed. Please try again.");
    },
  });
}

export function useDeleteFingerprintsBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sn,
      pins,
      fingerIndex,
    }: {
      sn: string;
      pins: string[];
      fingerIndex?: number;
    }) =>
      Promise.all(
        pins.map((pin) => commandsApi.deleteFingerprint(sn, pin, fingerIndex)),
      ).then(() => undefined),
    onSuccess: () => {
      message.success("Delete fingerprint commands queued");
      queryClient.invalidateQueries({ queryKey: COMMANDS_KEY });
    },
    onError: () => {
      message.error("Some delete commands failed. Please try again.");
    },
  });
}
