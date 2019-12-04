export class HttpError extends Error {
  constructor(
    public status: number,
    public error: string | Error
  ) { super(typeof(error) === "string" ? error : undefined); }

  static unauthorized = (message = "Unauthorized") => new HttpError(403, message);
  static notFound = (message = "Not found") => new HttpError(404, message);
  static internalError = (message = "Internal server error") => new HttpError(500, message);
}
