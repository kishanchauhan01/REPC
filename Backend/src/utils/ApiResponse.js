export class ApiResponse {
  constructor(statusCode, message, data = null, success = true, code = null) {
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.success = statusCode < 400;
    this.code = code;
  }
}
