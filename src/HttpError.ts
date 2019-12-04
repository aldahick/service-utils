export class HttpError extends Error {
  constructor(
    public status: number,
    public error: string | Error
  ) { super(typeof(error) === "string" ? error : undefined); }
}

export const UnauthorizedError = (message = "Unauthorized") => new HttpError(403, message);
export const NotFoundError = (message = "Not found") => new HttpError(404, message);
export const InternalServerError = (message = "Internal server error") => new HttpError(500, message);
