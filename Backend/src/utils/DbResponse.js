class DbResponse {
  constructor(success, data, errMsg) {
    this.success = success;
    this.data = data;
    this.errMsg = errMsg;
  }

  static dbSuccess(data) {
    return new DbResponse(true, data, null);
  }

  static dbError(errMsg) {
    if (!errMsg) throw new Error("errMsg is required");
    return new DbResponse(false, null, errMsg);
  }
}

export { DbResponse };
