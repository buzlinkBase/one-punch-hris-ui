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
  /** Machine-readable discriminator for GuardException failures (e.g. "INVITATION_EMAIL_MISMATCH"). */
  code?: string;
}

/** ResponseModel<ProblemDetails> — the envelope returned by the global exception handler */
export interface ErrorResponse {
  status: number;
  message: string;
  data: ProblemDetails;
}
