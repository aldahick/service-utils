export class HttpError extends Error {
  constructor(
    public status: number,
    public error: string | Error
  ) { super(typeof(error) === "string" ? error : undefined); }

  static badRequest = (message = "Bad request (are you providing the correct parameters?)") => new HttpError(400, message);
  static unauthorized = (message = "Unauthorized (are you providing credentials?)") => new HttpError(401, message);
  static forbidden = (message = "Forbidden (do you have the right permissions?)") => new HttpError(403, message);
  static notFound = (message = "Not found") => new HttpError(404, message);
  static internalError = (message = "Internal server error") => new HttpError(500, message);
}
