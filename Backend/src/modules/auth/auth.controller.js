import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import bcrypt from "bcryptjs";
import * as authService from "./auth.service.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { redis } from "../../configs/redis.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/api/v1/auth/",
};

/**
 * Generates a unique JSON Web Token ID (JTI) using crypto's randomUUID.
 * This acts as a unique identifier for a refresh token session to prevent replay attacks.
 *
 * @returns {string} A randomly generated UUID string to be used as a JTI.
 */
function generateJTI() {
  const jti = crypto.randomUUID();

  return jti;
}

/**
 * Generates a short-lived JSON Web Token (JWT) access token for user authentication.
 *
 * @param {string} userId - The unique identifier of the user (UUID or DB ID).
 * @param {string} role - The role of the user (e.g., 'admin', 'user') for role-based access control.
 * @returns {string} The signed JWT access token.
 */
function generateAccessToken(userId, role) {
  const accessToken = jwt.sign(
    {
      sub: userId,
      role,
    },
    process.env.ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_EXPIRY,
    }
  );

  return accessToken;
}

/**
 * Generates a long-lived JSON Web Token (JWT) refresh token for session maintenance.
 *
 * @param {string} userId - The unique identifier of the user.
 * @param {string} jti - The JSON Web Token ID (JTI) for this specific token session.
 * @returns {string} The signed JWT refresh token.
 */
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

/**
 * Generate SHA256 hash for token storage.
 *
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Authenticates a user and establishes a new session.
 *
 * Flow:
 * 1. Validates incoming email and password from request body.
 * 2. Checks if the user exists in the database.
 * 3. Verifies the provided password against the hashed password.
 * 4. Generates a new JTI (JWT ID) for session tracking.
 * 5. Generates new access and refresh tokens.
 * 6. Creates a new session record in Redis with device and IP metadata.
 * 7. Sets the refresh token as an HTTP-only secure cookie and returns the access token.
 *
 * @route POST /api/v1/auth/login
 * @access Public
 * @param {import('express').Request} req - Express request object containing email and password in the body.
 * @param {import('express').Response} res - Express response object used to send the tokens and set cookies.
 * @returns {Promise<void>} Resolves when the response is sent.
 * @throws {ApiError} 400 - If credentials are missing, user not found, or password invalid.
 */
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
  const { data: user } = await authService.findUserByEmail(email);

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
  const accessToken = generateAccessToken(user.id, user.role);
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

/**
 * Refresh user authentication tokens.
 *
 * Flow:
 * 1. Extract refresh token from cookies
 * 2. Verify refresh token JWT
 * 3. Validate session from Redis using JTI
 * 4. Compare stored refresh token hash
 * 5. Rotate refresh token and session
 * 6. Return new access token and refresh cookie
 *
 * Security:
 * - Uses refresh token rotation
 * - Stores hashed refresh tokens in Redis
 * - Invalidates old sessions after refresh
 *
 * @route POST /api/auth/refresh
 * @access Public
 */
const refresh = asyncHandler(async (req, res) => {
  // Get refresh token from cookie
  const refreshToken = req.cookies?.refreshToken;
  console.log(refreshToken);

  // If it is not exist throw
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token missing", "TOKEN_MISSING");
  }

  // Decode the token
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

  const { sub: userId, jti: oldJti } = decoded;

  // Get redis session
  const session = await redis.get(`session:${oldJti}`);

  if (!session) {
    throw new ApiError(400, "Invalid session", "INVALID_SESSION");
  }

  // Parse the redis session to json
  const parsedSession = JSON.parse(session);

  const { refreshTokenHash, userId: storedUserId } = parsedSession;

  // Check refreshToken of client and redis session
  const incomingRefreshHash = hashToken(refreshToken);

  if (incomingRefreshHash !== refreshTokenHash) {
    throw new ApiError(400, "Invalid refresh token", "INVALID_TOKEN");
  }

  if (storedUserId !== userId) {
    throw new ApiError(400, "Token mismatch", "INVALID_TOKEN");
  }

  // Find the user in database
  const { data: user } = await authService.findUserById(storedUserId);

  if (!user) {
    throw new ApiError(400, "User not found", "USER_NOT_FOUND");
  }

  // New JTI
  const newJti = generateJTI();

  // New accessToken
  const newAccessToken = generateAccessToken(storedUserId, user.role);

  // New refershToken
  const newRefreshToken = generateRefreshToken(storedUserId, newJti);

  // Hash the refreshToken
  const newRefreshTokenHash = hashToken(newRefreshToken);

  // Delete the old one
  await redis.del(`session:${oldJti}`);

  // Set new session with new JTI
  await redis.set(
    `session:${newJti}`,
    JSON.stringify({
      userId: storedUserId,
      refreshTokenHash: newRefreshTokenHash,
      ip: req.ip,
      device: req.headers["user-agent"],
      createdAt: new Date().toISOString(),
    }),
    "EX",
    60 * 60 * 24 * 7
  );

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
    .json(
      new ApiResponse(200, "User login successfully", {
        userName: user.name,
        userRole: user.role,
        accessToken: newAccessToken,
      })
    );
});

const logout = asyncHandler(async (req, res) => {
  // Get the refresh token
  // if token is not there then it is ok
  // if token is there verify it and get jti
  // delete the session from the redis
  // clear refresh cookie
  // return success

  const refreshToken = req.cookies?.refreshToken;
  console.log(refreshToken);

  if (refreshToken) {
    try {
      // Verify token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

      await redis.del(`session:${decoded.jti}`);
    } catch (error) {
      console.error(error);
    }
  }

  res
    .status(200)
    .clearCookie("refreshToken", refreshCookieOptions)
    .json(new ApiResponse(200, "Logged out successfully"));
});

export { login, refresh, logout };
