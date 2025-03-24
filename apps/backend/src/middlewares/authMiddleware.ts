import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const SECRET_KEY = process.env.JWT_SECRET || 'secret';

export interface AuthenticatedRequest extends Request {
  user?: any; // Extend the request to include the `user` property
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Access token is missing or invalid" });
    return; // Ensure no further code execution
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
    const user = await User.findById(decoded.userId, { password: 0, googleRefreshToken: 0, isApproved: 0 }).lean();
    if (!user) {
      res.status(403).json({ message: "User not found" });
      return
    }
    req.user = user; // Attach decoded token to request
    next(); // Proceed to the next middleware or route
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};