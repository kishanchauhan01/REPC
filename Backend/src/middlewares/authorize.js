import { ApiError } from "../utils/ApiError.js";

const authorize =
  (...role) =>
  (req, res, next) => {
    if (!role.includes(req.user.role)) {
      throw new ApiError(403, "User forbidden", "FORBIDDEN");
    }

    next();
  };

export { authorize };
