import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import requestIp from 'request-ip';

const SECRET_KEY = process.env.JWT_SECRET || 'secret';

export interface AuthenticatedRequest extends Request {
  user?: any; // Extend the request to include the `user` property
  userIP?: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY!) as any
    req.user = await User.findById(decoded.userId);
    const ipAddress = requestIp.getClientIp(req);
    req.userIP = ipAddress;
    next();
  } catch (ex) {
    return res.status(401).json({ message: 'Access denied. Invalid token.' })
  }
};


