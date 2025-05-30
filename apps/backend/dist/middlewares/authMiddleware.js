"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const request_ip_1 = __importDefault(require("request-ip"));
const SECRET_KEY = process.env.JWT_SECRET || 'secret';
const authenticateToken = async (req, res, next) => {
    const token = req.cookies['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        req.user = await user_model_1.default.findById(decoded.userId);
        const ipAddress = request_ip_1.default.getClientIp(req);
        req.userIP = ipAddress;
        next();
    }
    catch (ex) {
        return res.status(401).json({ message: 'Access denied. Invalid token.' });
    }
};
exports.authenticateToken = authenticateToken;
