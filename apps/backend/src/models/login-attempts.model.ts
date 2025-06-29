import mongoose, { Schema, Document } from "mongoose";
import { conn1, conn2 } from "../config/database";

export interface ILoginAttempt extends Document {
    email: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    isAdminTarget: boolean;
}

const loginAttemptSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isAdminTarget: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for faster queries (no automatic cleanup - we want to count all attempts)
loginAttemptSchema.index({ email: 1, ipAddress: 1 });

const LoginAttempt = conn1.model<ILoginAttempt>("loginAttempt", loginAttemptSchema);
const LoginAttemptBackup = conn2.model<ILoginAttempt>("loginAttempt", loginAttemptSchema);

export default LoginAttempt;
export { LoginAttemptBackup }; 