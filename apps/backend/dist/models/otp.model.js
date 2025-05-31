"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const database_1 = require("../config/database");
const otpSchema = new mongoose_1.Schema({
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
const OTP = database_1.conn1.model("otp", otpSchema);
exports.default = OTP;
