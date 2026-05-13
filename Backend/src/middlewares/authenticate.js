import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const authenticate = asyncHandler(async (req, res, next) => {
  // Get access token from header
  // validate it
  // If all the things are good then add req.user
  // If token is expired then res back with expiry so frontend make /refresh req. to the backend

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Access token missing", "TOKEN_MISSING");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired", "TOKEN_EXPIRED");
    }

    throw new ApiError(401, "Invalid access token", "TOKEN_INVALID");
  }
});

export { authenticate };
