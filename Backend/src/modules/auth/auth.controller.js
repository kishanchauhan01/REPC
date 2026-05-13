import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import bcrypt from "bcryptjs";
import * as authService from "./auth.service.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { redis } from "../../configs/redis.js";

function generateJTI() {
  const jti = crypto.randomUUID();

  return jti;
}

function generateAccessToken(userId, role, jti) {
  const accessToken = jwt.sign(
    {
      sub: userId,
      role,
      jti,
    },
    process.env.ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_EXPIRY,
    }
  );

  return accessToken;
}

function generateRefreshToken(userId, jti) {
  const refreshToken = jwt.sign(
    {
      sub: userId,
      jti,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_EXPIRY,
    }
  );

  return refreshToken;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

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
  const { data: user } = await authService.findUser(email);

  // If user not found
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // check for the password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new ApiError(400, "Invalid credential");
  }

  // Generate JTI
  const jti = generateJTI();

  // Generate access and refresh token
  const accessToken = generateAccessToken(user.id, user.role, jti);
  const refreshToken = generateRefreshToken(user.id, jti);

  const refreshTokenHash = hashToken(refreshToken);

  // Create a new session in redis
  await redis.set(
    `session:${jti}`,
    JSON.stringify({
      userId: user.id,
      refreshTokenHash,
      ip: req.ip,
      device: req.headers["user-agent"],
      createdAt: new Date().toISOString(),
    }),
    "EX",
    60 * 60 * 24 * 7
  );

  const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/api/v1/auth/refresh",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json(
      new ApiResponse(200, "User login successfully", {
        userName: user.name,
        userRole: user.role,
        accessToken,
      })
    );
});

// const refresh = asyncHandler(async (req, res) => {

// }) 

export { login };
