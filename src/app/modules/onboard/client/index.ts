export { default as ClientList } from "./pages/ClientList";
export { default as ClientDetail } from "./pages/ClientDetail";
export { default as ClientTable } from "./components/ClientTable";
export {
  useClient,
  useClients,
  useCreateClient,
  useDeactivateClient,
  useUpdateClient,
} from "./hooks/useClientQueries";
export type {
  ClientDeactivationReason,
  ClientResponse,
  ClientStatus,
} from "./models/api/response/client-response.model";
