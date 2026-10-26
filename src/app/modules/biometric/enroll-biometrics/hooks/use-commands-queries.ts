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
      message.error("Request failed. Please try again.");
    },
  });
}

export function useDeleteCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commandsApi.deleteCommand(id),
    onSuccess: () => {
      message.success("Request removed from queue");
      queryClient.invalidateQueries({ queryKey: COMMANDS_KEY });
    },
    onError: () => {
      message.error("Failed to remove request");
    },
  });
}

export function useEnrollFingerprint() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: EnrollFPPayload }) =>
      commandsApi.enrollFingerprint(sn, payload),
    "Fingerprint enrollment request sent",
  );
}

export function useEnrollFace() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: EnrollFacePayload }) =>
      commandsApi.enrollFace(sn, payload),
    "Face enrollment request sent",
  );
}

export function useSyncEmployees() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: SetEmployeeCommandPayload[] }) =>
      commandsApi.syncEmployees(sn, payload),
    "Sync employees request sent",
  );
}

export function useSyncBiometric() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: SyncBioPayload[] }) =>
      commandsApi.syncBiometric(sn, payload),
    "Sync biometrics request sent",
  );
}

export function useSyncFace() {
  return useCommandMutation(
    ({ sn, payload }: { sn: string; payload: SyncBioPayload[] }) =>
      commandsApi.syncFace(sn, payload),
    "Sync face templates request sent",
  );
}

export function useReboot() {
  return useCommandMutation(
    (sn: string) => commandsApi.reboot(sn),
    "Reboot request sent",
  );
}

export function useClearLogs() {
  return useCommandMutation(
    (sn: string) => commandsApi.clearLogs(sn),
    "Clear logs request sent",
  );
}

export function useSetTime() {
  return useCommandMutation(
    ({ sn, autoServerTime }: { sn: string; autoServerTime: boolean }) =>
      commandsApi.setTime(sn, autoServerTime),
    "Set time request sent",
  );
}

export function useEnableAttendance() {
  return useCommandMutation(
    ({ sn, enable }: { sn: string; enable: number }) =>
      commandsApi.enableAttendance(sn, enable),
    "Attendance request sent",
  );
}

export function useClearAdmin() {
  return useCommandMutation(
    (sn: string) => commandsApi.clearAdmin(sn),
    "Clear admin request sent",
  );
}

export function usePullAttendance() {
  return useCommandMutation(
    (payload: PullAttPayload) => commandsApi.pullAttendance(payload),
    "Pull attendance request sent",
  );
}

export function useQueryTemplates() {
  return useCommandMutation(
    ({ sn, pin, fid }: { sn: string; pin?: string; fid?: number }) =>
      commandsApi.queryTemplates(sn, pin, fid),
    "Query templates request sent",
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
      message.success("Query templates requests sent");
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
    "Registry reset request sent",
  );
}

export function useDeleteEmployeesBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sn, bioIds }: { sn: string; bioIds: number[] }) =>
      commandsApi.deleteEmployee(sn, bioIds),
    onSuccess: () => {
      message.success("Delete employee requests sent");
      queryClient.invalidateQueries({ queryKey: COMMANDS_KEY });
    },
    onError: () => {
      message.error("Delete employee command failed. Please try again.");
    },
  });
}
