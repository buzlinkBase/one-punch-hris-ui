export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  statusCode?: number;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  stackTrace?: string;
  traceId?: string;
  innerException?: string;
}

/** ResponseModel<ProblemDetails> — the envelope returned by the global exception handler */
export interface ErrorResponse {
  status: number;
  message: string;
  data: ProblemDetails;
}
