import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.body.Authorization;

  if (!token) {
    return next(new ApiError(401, "Unauthorized: No token provided"));
  }

  try {
    // Verify token and decode it
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user based on decoded token
    const user = await User.findById(decoded._id);
    if (!user) {
      return next(new ApiError(401, "Unauthorized: User not found"));
    }

    // Attach the user object to the request
    req.user = user;

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return next(new ApiError(401, "Unauthorized: Token is invalid or expired"));
  }
});

export { verifyToken };
