/* eslint-disable max-classes-per-file */

export class HttpError extends Error {
  constructor(
    public status: number,
    public error: string | Error
  ) { super(typeof(error) === "string" ? error : undefined); }
}

export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(403, message || "Unauthorized");
  }
}
