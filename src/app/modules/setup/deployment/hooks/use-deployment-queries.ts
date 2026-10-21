import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deploymentApi } from "../services/deployment.api";
import type {
  AssignDeploymentRequest,
  ClientPostRequest,
  ClientSiteRequest,
  DeploymentListQuery,
  EndDeploymentRequest,
  PostRequirementRequest,
} from "../models/api/request/deployment-request.model";

const QUERY_KEY = ["deployments"] as const;

/** Every deployment change can move headcounts on sites, posts, the deployment list and coverage, so all of them refresh. */
function useDeploymentMutation<TArgs, TResult>(
  run: (args: TArgs) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useClientSites(clientId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "sites", clientId],
    queryFn: () => deploymentApi.listSites(clientId!),
    enabled: !!clientId,
  });
}

export function useClientPosts(siteId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "posts", siteId],
    queryFn: () => deploymentApi.listPosts(siteId!),
    enabled: !!siteId,
  });
}

export function useDeploymentList(query: DeploymentListQuery, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEY, "list", query],
    queryFn: () => deploymentApi.listDeployments(query),
    enabled,
  });
}

export function useCoverage(clientId: string | undefined, date: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, "coverage", clientId, date],
    queryFn: () => deploymentApi.coverage(clientId!, date),
    enabled: !!clientId,
  });
}

export const useSaveClientSite = () =>
  useDeploymentMutation(
    (v: { clientId: string; id: string | null; request: ClientSiteRequest }) =>
      deploymentApi.saveSite(v.clientId, v.id, v.request),
  );

export const useRemoveClientSite = () =>
  useDeploymentMutation((id: string) => deploymentApi.removeSite(id));

export const useSaveClientPost = () =>
  useDeploymentMutation(
    (v: { siteId: string; id: string | null; request: ClientPostRequest }) =>
      deploymentApi.savePost(v.siteId, v.id, v.request),
  );

export const useRemoveClientPost = () =>
  useDeploymentMutation((id: string) => deploymentApi.removePost(id));

export const useAddPostRequirement = () =>
  useDeploymentMutation(
    (v: { postId: string; request: PostRequirementRequest }) =>
      deploymentApi.addRequirement(v.postId, v.request),
  );

export const useEndPostRequirement = () =>
  useDeploymentMutation((v: { id: string; request: EndDeploymentRequest }) =>
    deploymentApi.endRequirement(v.id, v.request),
  );

export const useAssignDeployment = () =>
  useDeploymentMutation((request: AssignDeploymentRequest) =>
    deploymentApi.assign(request),
  );

/** Sends the coming week's manning to the Client Portal for live monitoring (changes nothing here, so nothing refreshes). */
export const useSendManningToPortal = () =>
  useMutation({
    mutationFn: (clientId: string) =>
      deploymentApi.sendManningToPortal(clientId),
  });

export const useEndDeployment = () =>
  useDeploymentMutation((v: { id: string; request: EndDeploymentRequest }) =>
    deploymentApi.end(v.id, v.request),
  );
