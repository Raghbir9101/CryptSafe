"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginAttemptBackup = void 0;
const mongoose_1 = require("mongoose");
const database_1 = require("../config/database");
const loginAttemptSchema = new mongoose_1.Schema({
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
const LoginAttempt = database_1.conn1.model("loginAttempt", loginAttemptSchema);
const LoginAttemptBackup = database_1.conn2.model("loginAttempt", loginAttemptSchema);
exports.LoginAttemptBackup = LoginAttemptBackup;
exports.default = LoginAttempt;
