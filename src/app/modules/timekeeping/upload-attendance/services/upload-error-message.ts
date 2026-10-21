import { isAxiosError } from "axios";

// What the Upload Attendance page tells the user when an upload fails. A server answer
// (4xx/5xx) already gets its detail toast from the error interceptor, so that case stays short.
export function uploadErrorMessage(error: unknown): string {
  if (isAxiosError(error) && !error.response) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "The upload is taking longer than expected. The server may still be processing it — check Raw Logs before uploading again.";
    }
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return "Upload failed. See the error details shown.";
}
