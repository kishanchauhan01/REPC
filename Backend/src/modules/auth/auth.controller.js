import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import becrypt from "bcryptjs";
import * as authService from "./auth.service.js";

const login = asyncHandler(async (req, res) => {
  // get email Id and password
  // validate email and password
  // check password is correct or not
  // If everything good then generate JTI
  // Then generate access and refresh token
  // Provide same JTI to both the token
  // create new session in redis and set userId, hash refresh token, IP address of User, device of user, created_at
  // send both token to client but send refresh token in cookie as (httpOnly, secure, sameSite stirct)

  // Get credentials
  const { email, password } = req.body;

  // Validate credentials
  if (!email || !password) {
    throw new ApiError(400, "Email and password is required");
  }

  // Check if user exist or not
  const user = await authService.findUser(email);

  // If user not found
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // check for the password
  const isValidPassword = await becrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new ApiError(400, "Invalid credential");
  }
  
});
