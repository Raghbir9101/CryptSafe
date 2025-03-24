import User, { UserInterface } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export default class AuthController {

    // Method to register a new user
    static registerUser = asyncHandler(async (req, res): Promise<void> => {
        const { email, userName, password } = req.body;

        if (!email || !userName || !password) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Username, email and password fields are required' });
            return
        }

        const existingUser = await User.findOne({ email }).lean();

        if (existingUser) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
            return
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10,);

        // Create new user
        const newUser = new User({ email, userName, password: hashedPassword });
        await newUser.save();

        res.status(HttpStatusCodes.CREATED).json({ message: 'User registered successfully' });
    })

    // Method to register a new user
    static loginUser = asyncHandler(async (req, res): Promise<void> => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Email and password fields are required' });
            return
        }

        // Check if the user exists
        const user = await User.findOne({ email }).lean();
        if (!user) {
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid credentials' });
            return
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        const { password: _, ...userWithoutPassword } = user;

        res.status(HttpStatusCodes.OK).json({ message: 'Login successful', token, user: userWithoutPassword });
    })

}