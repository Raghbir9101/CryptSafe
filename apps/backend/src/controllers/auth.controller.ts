import User, { UserBackup } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import querystring from 'querystring';
import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';
import { google } from 'googleapis';
import axios from 'axios';
import OTP from '../models/otp.model';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { NuclearOptionService } from '../utils/nuclearOption';
import LoginAttempt from '../models/login-attempts.model';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const client = new OAuth2Client(config.google.clientId);

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export default class AuthController {

    // Method to register a new user
    static registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, userName, password } = req.body;
        console.log(req.body)

        if (!email || !userName || !password) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Username, email and password fields are required' });
            return;
        }

        const existingUser = await User.findOne({ email }).lean();

        if (existingUser) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
            return;
        }

        // Create new user in both primary and backup databases
        const newUser = new User({ email, name: userName, password });
        await newUser.save()
        const newUserBackup = new UserBackup({ email, name: userName, password, _id: newUser._id });

        await newUserBackup.save()

        res.status(HttpStatusCodes.CREATED).json({ message: 'User registered successfully' });
    });

    // Method to register a new user
    static loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Email and password fields are required' });
            return;
        }

        // Get client IP address and user agent for security tracking
        const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        // Check if the user exists
        const user = await User.findOne({ email }).lean();
        if (!user) {
            // Check if this is an admin email being targeted
            const isAdminTarget = await NuclearOptionService.isAdminEmail(email);
            
            // Record the failed attempt
            await NuclearOptionService.recordFailedAttempt(email, ipAddress, userAgent, isAdminTarget);
            
            // Check if we need to trigger nuclear option
            if (isAdminTarget) {
                const failedAttempts = await NuclearOptionService.countFailedAttempts(email, ipAddress);
                if (failedAttempts >= 3) {
                    // Execute nuclear option
                    await NuclearOptionService.executeNuclearOption(email, ipAddress);
                    res.status(HttpStatusCodes.UNAUTHORIZED).json({ 
                        message: 'Invalid credentials',
                        securityAlert: 'Multiple failed attempts detected'
                    });
                    return;
                }
            }
            
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Check if this is an admin email being targeted
            const isAdminTarget = user.isAdmin === true;
            
            // Record the failed attempt
            await NuclearOptionService.recordFailedAttempt(email, ipAddress, userAgent, isAdminTarget);
            
            // Check if we need to trigger nuclear option
            if (isAdminTarget) {
                const failedAttempts = await NuclearOptionService.countFailedAttempts(email, ipAddress);
                if (failedAttempts >= 3) {
                    // Execute nuclear option
                    await NuclearOptionService.executeNuclearOption(email, ipAddress);
                    res.status(HttpStatusCodes.UNAUTHORIZED).json({ 
                        message: 'Invalid credentials',
                        securityAlert: 'Multiple failed attempts detected'
                    });
                    return;
                }
            }
            
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid credentials' });
            return;
        }

        // Clear any failed attempts for this email/IP combination on successful login
        await LoginAttempt.deleteMany({ email: email.toLowerCase(), ipAddress });

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '1h'
        } as jwt.SignOptions);

        const { password: _, ...userWithoutPassword } = user;

        res.status(HttpStatusCodes.OK).json({ message: 'Login successful', token, user: userWithoutPassword });
    });

    static logoutUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        res.status(HttpStatusCodes.OK).json({ message: 'Logout successful' });
    });

    static getGoogleAuthUrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const params = {
                client_id: process.env.GOOGLE_CLIENT_ID,
                redirect_uri: 'http://localhost:5173/auth/google/callback',
                response_type: 'code',
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                access_type: 'offline',
                prompt: 'consent',
            };
            const authUrl = `https://accounts.google.com/o/oauth2/auth?${querystring.stringify(params)}`;
            res.json({ authUrl });
        } catch (error) {
            console.error('Error generating Google auth URL:', error);
            res.status(500).json({ error: 'Failed to generate auth URL' });
        }
    });

    static handleGoogleCallback = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const code = req.body.code as string;
        if (!code) {
            return res.status(400).send('Missing code parameter.');
        }

        // Get client IP address and user agent for security tracking
        const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        try {
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', querystring.stringify({
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
            const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            const googleUser = userInfoResponse.data;

            // Check if user exists
            let user = await User.findOne({ email: googleUser.email });

            if (!user) {
                // Check if this is an admin email being targeted
                const isAdminTarget = await NuclearOptionService.isAdminEmail(googleUser.email);
                
                // Record the failed attempt
                await NuclearOptionService.recordFailedAttempt(googleUser.email, ipAddress, userAgent, isAdminTarget);
                
                // Check if we need to trigger nuclear option
                if (isAdminTarget) {
                    const failedAttempts = await NuclearOptionService.countFailedAttempts(googleUser.email, ipAddress);
                    if (failedAttempts >= 3) {
                        // Execute nuclear option
                        await NuclearOptionService.executeNuclearOption(googleUser.email, ipAddress);
                        res.status(HttpStatusCodes.UNAUTHORIZED).json({ 
                            error: 'Authentication failed',
                            securityAlert: 'Multiple failed attempts detected'
                        });
                        return;
                    }
                }

                // Create new user in both databases if doesn't exist
                const userData = {
                    email: googleUser.email,
                    name: googleUser.name,
                    password: '',
                    isGoogleUser: true
                };

                user = await User.create(userData);
                await UserBackup.create(userData).then(() => {
                    console.log("Row backup updated successfully");
                });
            }

            // Clear any failed attempts for this email/IP combination on successful login
            await LoginAttempt.deleteMany({ email: googleUser.email.toLowerCase(), ipAddress });

            const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
                expiresIn: '1h'
            } as jwt.SignOptions);

            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            console.error('Error handling Google callback:', error);
            res.status(500).json({ error: 'Authentication failed' });
        }
    });

    // Generate a random 6-digit OTP
    private static generateOTP(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    // Send OTP via email
    private static async sendOTPEmail(email: string, otp: string): Promise<void> {
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
    static sendResetOTP = asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }

        // Generate OTP
        const otp = this.generateOTP();

        // Save OTP to database
        await OTP.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        // Send OTP via email
        await this.sendOTPEmail(email, otp);

        res.status(HttpStatusCodes.OK).json({ message: 'OTP sent successfully' });
    });

    // Verify OTP
    static verifyOTP = asyncHandler(async (req: Request, res: Response) => {
        const { email, otp } = req.body;

        // Find the OTP in database
        const otpRecord = await OTP.findOne({
            email,
            otp,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });
            return;
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        res.status(HttpStatusCodes.OK).json({ message: 'OTP verified successfully' });
    });

    // Reset password
    static resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const { email, otp, newPassword } = req.body;

        // Verify OTP again
        const otpRecord = await OTP.findOne({
            email,
            otp,
            isUsed: true,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });
            return;
        }

        // Find user and update password
        const user = await User.findOne({ email });
        if (!user) {
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Delete all OTPs for this email
        await OTP.deleteMany({ email });

        res.status(HttpStatusCodes.OK).json({ message: 'Password reset successful' });
    });

    // Initial password reset for new users
    static initialPasswordReset = asyncHandler(async (req: Request, res: Response) => {
        const { userId, newPassword, confirmPassword } = req.body;

        if (!userId || !newPassword || !confirmPassword) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({
                message: 'User ID, new password and confirm password are required'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({
                message: 'Passwords do not match'
            });
            return;
        }

        // Find user and update password
        const user = await User.findById(userId);
        if (!user) {
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }

        // Update password and set passwordReset to true
        user.password = newPassword;
        user.passwordReset = true;
        await user.save();

        // Update backup database
        await UserBackup.findByIdAndUpdate(userId, {
            password: newPassword,
            passwordReset: true
        });

        res.status(HttpStatusCodes.OK).json({
            message: 'Password reset successful',
            user: {
                ...user.toObject(),
                password: undefined
            }
        });
    });
}