export class ApiError extends Error {
  constructor(statusCode, message, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
