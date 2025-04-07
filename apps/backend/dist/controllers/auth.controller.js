"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const asyncHandler_1 = require("../utils/asyncHandler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const querystring_1 = __importDefault(require("querystring"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorCodes_1 = require("../utils/errorCodes");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../config");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const client = new google_auth_library_1.OAuth2Client(config_1.config.google.clientId);
class AuthController {
    // Method to register a new user
    static registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, userName, password } = req.body;
        if (!email || !userName || !password) {
            res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Username, email and password fields are required' });
            return;
        }
        const existingUser = await user_model_1.default.findOne({ email }).lean();
        if (existingUser) {
            res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        // const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = new user_model_1.default({ email, name: userName, password });
        await newUser.save();
        res.status(errorCodes_1.HttpStatusCodes.CREATED).json({ message: 'User registered successfully' });
    });
    // Method to register a new user
    static loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Email and password fields are required' });
            return;
        }
        // Check if the user exists
        const user = await user_model_1.default.findOne({ email }).lean();
        if (!user) {
            res.status(errorCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }
        // Compare the password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '1h'
        });
        const { password: _, ...userWithoutPassword } = user;
        res.cookie('authorization', token, { maxAge: 1000 * 60 * 60 * 24 * 7, secure: true, sameSite: "none" });
        res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Login successful', token, user: userWithoutPassword });
    });
    static getGoogleAuthUrl = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const params = {
                client_id: process.env.GOOGLE_CLIENT_ID,
                redirect_uri: 'http://localhost:5173/auth/google/callback',
                response_type: 'code',
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                access_type: 'offline',
                prompt: 'consent',
            };
            const authUrl = `https://accounts.google.com/o/oauth2/auth?${querystring_1.default.stringify(params)}`;
            res.json({ authUrl });
        }
        catch (error) {
            console.error('Error generating Google auth URL:', error);
            res.status(500).json({ error: 'Failed to generate auth URL' });
        }
    });
    static handleGoogleCallback = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const code = req.body.code;
        if (!code) {
            return res.status(400).send('Missing code parameter.');
        }
        try {
            const tokenResponse = await axios_1.default.post('https://oauth2.googleapis.com/token', querystring_1.default.stringify({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: 'http://localhost:5173/auth/google/callback',
                grant_type: 'authorization_code',
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const { access_token } = tokenResponse.data;
            const userInfoResponse = await axios_1.default.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const googleUser = userInfoResponse.data;
            // Check if user exists
            let user = await user_model_1.default.findOne({ email: googleUser.email });
            if (!user) {
                // Create new user if doesn't exist
                user = await user_model_1.default.create({
                    email: googleUser.email,
                    name: googleUser.name,
                    password: '',
                    isGoogleUser: true
                });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, {
                expiresIn: '1h'
            });
            res.cookie('authorization', token, { maxAge: 1000 * 60 * 60 * 24 * 7, secure: true, sameSite: "none" });
            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        }
        catch (error) {
            console.error('Error handling Google callback:', error);
            res.status(500).json({ error: 'Authentication failed' });
        }
    });
}
exports.default = AuthController;
