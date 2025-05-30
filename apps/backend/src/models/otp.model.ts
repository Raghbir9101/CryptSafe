import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
    isUsed: boolean;
}

const otpSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    },
    isUsed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for faster queries and automatic cleanup
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model<IOTP>("otp", otpSchema);

export default OTP; 