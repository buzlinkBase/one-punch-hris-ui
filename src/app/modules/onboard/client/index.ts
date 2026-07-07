export { default as ClientList } from "./pages/client-list";
export { default as ClientDetail } from "./pages/client-detail";
export { default as ClientTable } from "./components/client-table";
export {
  useClient,
  useClients,
  useCreateClient,
  useDeactivateClient,
  useUpdateClient,
} from "./hooks/use-client-queries";
export type {
  ClientDeactivationReason,
  ClientResponse,
  ClientStatus,
} from "./models/api/response/client-response.model";
