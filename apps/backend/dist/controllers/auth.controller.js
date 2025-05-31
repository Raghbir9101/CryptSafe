"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importStar(require("../models/user.model"));
const asyncHandler_1 = require("../utils/asyncHandler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const querystring_1 = __importDefault(require("querystring"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorCodes_1 = require("../utils/errorCodes");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../config");
const axios_1 = __importDefault(require("axios"));
const otp_model_1 = __importDefault(require("../models/otp.model"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const client = new google_auth_library_1.OAuth2Client(config_1.config.google.clientId);
// Create a transporter for sending emails
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
class AuthController {
    // Method to register a new user
    static registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, userName, password } = req.body;
        console.log(req.body);
        if (!email || !userName || !password) {
            res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Username, email and password fields are required' });
            return;
        }
        const existingUser = await user_model_1.default.findOne({ email }).lean();
        if (existingUser) {
            res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
            return;
        }
        // Create new user in both primary and backup databases
        const newUser = new user_model_1.default({ email, name: userName, password });
        await newUser.save();
        const newUserBackup = new user_model_1.UserBackup({ email, name: userName, password, _id: newUser._id });
        await newUserBackup.save();
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
        res.cookie('authorization', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            secure: true,
            sameSite: "none",
            httpOnly: true
        });
        res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Login successful', token, user: userWithoutPassword });
    });
    static logoutUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        res.cookie('authorization', null, {
            secure: true,
            sameSite: "none",
            httpOnly: true
        });
        res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Logout successful' });
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
                // Create new user in both databases if doesn't exist
                const userData = {
                    email: googleUser.email,
                    name: googleUser.name,
                    password: '',
                    isGoogleUser: true
                };
                user = await user_model_1.default.create(userData);
                await user_model_1.UserBackup.create(userData).then(() => {
                    console.log("Row backup updated successfully");
                });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, {
                expiresIn: '1h'
            });
            res.cookie('authorization', token, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                secure: true,
                sameSite: "none",
                httpOnly: true
            });
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
    // Generate a random 6-digit OTP
    static generateOTP() {
        return crypto_1.default.randomInt(100000, 999999).toString();
    }
    // Send OTP via email
    static async sendOTPEmail(email, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <h1>Password Reset Request</h1>
                <p>Your OTP for password reset is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };
        await transporter.sendMail(mailOptions);
    }
    // Send OTP for password reset
    static sendResetOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email } = req.body;
        // Check if user exists
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            res.status(errorCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }
        // Generate OTP
        const otp = this.generateOTP();
        // Save OTP to database
        await otp_model_1.default.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });
        // Send OTP via email
        await this.sendOTPEmail(email, otp);
        res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'OTP sent successfully' });
    });
    // Verify OTP
    static verifyOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, otp } = req.body;
        // Find the OTP in database
        const otpRecord = await otp_model_1.default.findOne({
            email,
            otp,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });
        if (!otpRecord) {
            res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });
            return;
        }
        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();
        res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'OTP verified successfully' });
    });
    // Reset password
    static resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, otp, newPassword } = req.body;
        // Verify OTP again
        const otpRecord = await otp_model_1.default.findOne({
            email,
            otp,
            isUsed: true,
            expiresAt: { $gt: new Date() }
        });
        if (!otpRecord) {
            res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });
            return;
        }
        // Find user and update password
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            res.status(errorCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }
        // Update password
        user.password = newPassword;
        await user.save();
        // Delete all OTPs for this email
        await otp_model_1.default.deleteMany({ email });
        res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Password reset successful' });
    });
}
exports.default = AuthController;
