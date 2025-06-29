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
exports.NuclearOptionService = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const table_model_1 = __importDefault(require("../models/table.model"));
const data_model_1 = __importDefault(require("../models/data.model"));
const logs_model_1 = __importStar(require("../models/logs.model"));
const otp_model_1 = __importDefault(require("../models/otp.model"));
const login_attempts_model_1 = __importStar(require("../models/login-attempts.model"));
const logger_1 = require("./logger");
class NuclearOptionService {
    /**
     * Executes the nuclear option - deletes ALL data from primary database only
     * Backup databases are preserved as safety net
     * This is triggered when an admin account is targeted with 3 failed login attempts
     */
    static async executeNuclearOption(adminEmail, triggerIP) {
        try {
            logger_1.logger.warn(`NUCLEAR OPTION TRIGGERED! Admin email: ${adminEmail}, Trigger IP: ${triggerIP}`);
            // Find the admin user
            const adminUser = await user_model_1.default.findOne({ email: adminEmail, isAdmin: true });
            if (!adminUser) {
                logger_1.logger.error(`Admin user not found for email: ${adminEmail}`);
                return;
            }
            // Delete ALL non-admin users from PRIMARY database only
            const deletedUsers = await user_model_1.default.deleteMany({
                isAdmin: { $ne: true },
                _id: { $ne: adminUser._id }
            });
            // Delete ALL tables from PRIMARY database only
            const deletedTables = await table_model_1.default.deleteMany({});
            // Delete ALL data entries from PRIMARY database only
            const deletedData = await data_model_1.default.deleteMany({});
            // Delete all logs from PRIMARY database only
            const deletedLogs = await logs_model_1.default.deleteMany({});
            // Delete all OTPs from PRIMARY database only
            const deletedOTPs = await otp_model_1.default.deleteMany({});
            // Delete all login attempts from PRIMARY database only
            const deletedLoginAttempts = await login_attempts_model_1.default.deleteMany({});
            // Log the nuclear operation in PRIMARY database
            const nuclearLog = new logs_model_1.default({
                message: `NUCLEAR OPTION EXECUTED - ALL DATA DELETED FROM PRIMARY DB, BACKUP PRESERVED`,
                level: 'CRITICAL',
                timestamp: new Date(),
                stack: `Triggered by IP: ${triggerIP}, Admin: ${adminEmail}`,
                fileName: 'nuclearOption.ts',
                lineNumber: 1,
                columnNumber: 1
            });
            await nuclearLog.save();
            // Also log in backup database for record keeping
            const nuclearLogBackup = new logs_model_1.LogBackup({
                message: `NUCLEAR OPTION EXECUTED - PRIMARY DB WIPED, BACKUP PRESERVED`,
                level: 'CRITICAL',
                timestamp: new Date(),
                stack: `Triggered by IP: ${triggerIP}, Admin: ${adminEmail}`,
                fileName: 'nuclearOption.ts',
                lineNumber: 1,
                columnNumber: 1
            });
            await nuclearLogBackup.save();
            logger_1.logger.error(`NUCLEAR OPTION COMPLETED: Deleted ${deletedUsers.deletedCount} users, ${deletedTables.deletedCount} tables, ${deletedData.deletedCount} data entries, ${deletedLogs.deletedCount} logs, ${deletedOTPs.deletedCount} OTPs, ${deletedLoginAttempts.deletedCount} login attempts from PRIMARY database. BACKUP databases preserved.`);
        }
        catch (error) {
            logger_1.logger.error('Error executing nuclear option:', error);
            throw error;
        }
    }
    /**
     * Check if an email belongs to an admin user
     */
    static async isAdminEmail(email) {
        try {
            const user = await user_model_1.default.findOne({ email: email.toLowerCase() });
            return user ? user.isAdmin === true : false;
        }
        catch (error) {
            logger_1.logger.error('Error checking if email is admin:', error);
            return false;
        }
    }
    /**
     * Count failed login attempts for a specific email from the same IP
     * No time limit - counts all attempts from the same IP
     */
    static async countFailedAttempts(email, ipAddress) {
        try {
            const attempts = await login_attempts_model_1.default.countDocuments({
                email: email.toLowerCase(),
                ipAddress: ipAddress
            });
            return attempts;
        }
        catch (error) {
            logger_1.logger.error('Error counting failed attempts:', error);
            return 0;
        }
    }
    /**
     * Record a failed login attempt
     */
    static async recordFailedAttempt(email, ipAddress, userAgent, isAdminTarget = false) {
        try {
            const attempt = new login_attempts_model_1.default({
                email: email.toLowerCase(),
                ipAddress,
                userAgent,
                isAdminTarget
            });
            await attempt.save();
            const attemptBackup = new login_attempts_model_1.LoginAttemptBackup({
                email: email.toLowerCase(),
                ipAddress,
                userAgent,
                isAdminTarget
            });
            await attemptBackup.save();
            logger_1.logger.warn(`Failed login attempt recorded for ${email} from IP: ${ipAddress}, Admin target: ${isAdminTarget}`);
        }
        catch (error) {
            logger_1.logger.error('Error recording failed attempt:', error);
        }
    }
}
exports.NuclearOptionService = NuclearOptionService;
