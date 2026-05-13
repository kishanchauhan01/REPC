import { ApiResponse } from "../utils/ApiResponse.js";

export const errorHandler = (err, _, res, __) => {
  console.log("🔥 Error: ", err);

  // default values
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || "INTERNAL_SERVER_ERROR";

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, message, null, null, code));
};
