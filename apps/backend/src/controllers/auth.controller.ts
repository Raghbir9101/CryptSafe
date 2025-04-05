import User, { UserInterface } from "../models/user.model";
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
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const client = new OAuth2Client(config.google.clientId);

export default class AuthController {

    // Method to register a new user
    static registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, userName, password } = req.body;

        if (!email || !userName || !password) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Username, email and password fields are required' });
            return;
        }

        const existingUser = await User.findOne({ email }).lean();

        if (existingUser) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
            return;
        }

        // Hash password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ email, name:userName, password });
        await newUser.save();

        res.status(HttpStatusCodes.CREATED).json({ message: 'User registered successfully' });
    });

    // Method to register a new user
    static loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Email and password fields are required' });
            return;
        }

        // Check if the user exists
        const user = await User.findOne({ email }).lean();
        if (!user) {
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '1h'
        } as jwt.SignOptions);

        const { password: _, ...userWithoutPassword } = user;
        res.cookie('authorization', token, { maxAge: 1000 * 60 * 60 * 24 * 7, secure: false });

        res.status(HttpStatusCodes.OK).json({ message: 'Login successful', token, user: userWithoutPassword });
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
                // Create new user if doesn't exist
                user = await User.create({
                    email: googleUser.email,
                    name: googleUser.name,
                    password: '',
                    isGoogleUser: true
                });
            }

            const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
                expiresIn: '1h'
            } as jwt.SignOptions);


            res.cookie('authorization', token, { maxAge: 1000 * 60 * 60 * 24 * 7, secure: false });
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

}