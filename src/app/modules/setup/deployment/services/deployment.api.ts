import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  ClientPostResponse,
  ClientSiteResponse,
  CoverageReport,
  DeploymentResponse,
  PostRequirementResponse,
} from "../models/api/response/deployment-response.model";
import type {
  AssignDeploymentRequest,
  ClientPostRequest,
  ClientSiteRequest,
  DeploymentListQuery,
  EndDeploymentRequest,
  PostRequirementRequest,
} from "../models/api/request/deployment-request.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "deployments");

/** Client sites, posts, contracted manning and who is deployed where. */
export const deploymentApi = {
  listSites(clientId: string): Promise<ClientSiteResponse[]> {
    return httpClient.getUnwrapped(`${ENDPOINT}/clients/${clientId}/sites`);
  },

  saveSite(
    clientId: string,
    id: string | null,
    request: ClientSiteRequest,
  ): Promise<string> {
    return id
      ? httpClient.putUnwrapped(
          `${ENDPOINT}/clients/${clientId}/sites/${id}`,
          request,
        )
      : httpClient.postUnwrapped(
          `${ENDPOINT}/clients/${clientId}/sites`,
          request,
        );
  },

  removeSite(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/sites/${id}`);
  },

  listPosts(siteId: string): Promise<ClientPostResponse[]> {
    return httpClient.getUnwrapped(`${ENDPOINT}/sites/${siteId}/posts`);
  },

  savePost(
    siteId: string,
    id: string | null,
    request: ClientPostRequest,
  ): Promise<string> {
    return id
      ? httpClient.putUnwrapped(
          `${ENDPOINT}/sites/${siteId}/posts/${id}`,
          request,
        )
      : httpClient.postUnwrapped(`${ENDPOINT}/sites/${siteId}/posts`, request);
  },

  removePost(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/posts/${id}`);
  },

  addRequirement(
    postId: string,
    request: PostRequirementRequest,
  ): Promise<PostRequirementResponse> {
    return httpClient.postUnwrapped(
      `${ENDPOINT}/posts/${postId}/requirements`,
      request,
    );
  },

  endRequirement(id: string, request: EndDeploymentRequest): Promise<void> {
    return httpClient.postUnwrapped(
      `${ENDPOINT}/requirements/${id}/end`,
      request,
    );
  },

  listDeployments(query: DeploymentListQuery): Promise<DeploymentResponse[]> {
    return httpClient.getUnwrapped(ENDPOINT, { params: query });
  },

  assign(request: AssignDeploymentRequest): Promise<DeploymentResponse> {
    return httpClient.postUnwrapped(ENDPOINT, request);
  },

  end(id: string, request: EndDeploymentRequest): Promise<DeploymentResponse> {
    return httpClient.postUnwrapped(`${ENDPOINT}/${id}/end`, request);
  },

  /** Sends the coming week's manning to the Client Portal now; returns how many clients were sent. */
  sendManningToPortal(clientId: string): Promise<number> {
    return httpClient.postUnwrapped(`${ENDPOINT}/portal-manning`, undefined, {
      params: { clientId },
    });
  },

  coverage(clientId: string, date: string): Promise<CoverageReport> {
    return httpClient.getUnwrapped(`${ENDPOINT}/clients/${clientId}/coverage`, {
      params: { date },
    });
  },
};
