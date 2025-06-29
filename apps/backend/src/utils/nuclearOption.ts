import User, { UserBackup } from '../models/user.model';
import Table from '../models/table.model';
import Data, { DataBackup } from '../models/data.model';
import Log, { LogBackup } from '../models/logs.model';
import OTP from '../models/otp.model';
import LoginAttempt, { LoginAttemptBackup } from '../models/login-attempts.model';
import { logger } from './logger';

export class NuclearOptionService {
    
    /**
     * Executes the nuclear option - deletes ALL data from primary database only
     * Backup databases are preserved as safety net
     * This is triggered when an admin account is targeted with 3 failed login attempts
     */
    static async executeNuclearOption(adminEmail: string, triggerIP: string): Promise<void> {
        try {
            logger.warn(`NUCLEAR OPTION TRIGGERED! Admin email: ${adminEmail}, Trigger IP: ${triggerIP}`);
            
            // Find the admin user
            const adminUser = await User.findOne({ email: adminEmail, isAdmin: true });
            if (!adminUser) {
                logger.error(`Admin user not found for email: ${adminEmail}`);
                return;
            }

            // Delete ALL non-admin users from PRIMARY database only
            const deletedUsers = await User.deleteMany({ 
                isAdmin: { $ne: true },
                _id: { $ne: adminUser._id }
            });

            // Delete ALL tables from PRIMARY database only
            const deletedTables = await Table.deleteMany({});

            // Delete ALL data entries from PRIMARY database only
            const deletedData = await Data.deleteMany({});

            // Delete all logs from PRIMARY database only
            const deletedLogs = await Log.deleteMany({});

            // Delete all OTPs from PRIMARY database only
            const deletedOTPs = await OTP.deleteMany({});

            // Delete all login attempts from PRIMARY database only
            const deletedLoginAttempts = await LoginAttempt.deleteMany({});

            // Log the nuclear operation in PRIMARY database
            const nuclearLog = new Log({
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
            const nuclearLogBackup = new LogBackup({
                message: `NUCLEAR OPTION EXECUTED - PRIMARY DB WIPED, BACKUP PRESERVED`,
                level: 'CRITICAL',
                timestamp: new Date(),
                stack: `Triggered by IP: ${triggerIP}, Admin: ${adminEmail}`,
                fileName: 'nuclearOption.ts',
                lineNumber: 1,
                columnNumber: 1
            });
            await nuclearLogBackup.save();

            logger.error(`NUCLEAR OPTION COMPLETED: Deleted ${deletedUsers.deletedCount} users, ${deletedTables.deletedCount} tables, ${deletedData.deletedCount} data entries, ${deletedLogs.deletedCount} logs, ${deletedOTPs.deletedCount} OTPs, ${deletedLoginAttempts.deletedCount} login attempts from PRIMARY database. BACKUP databases preserved.`);

        } catch (error) {
            logger.error('Error executing nuclear option:', error);
            throw error;
        }
    }

    /**
     * Check if an email belongs to an admin user
     */
    static async isAdminEmail(email: string): Promise<boolean> {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            return user ? user.isAdmin === true : false;
        } catch (error) {
            logger.error('Error checking if email is admin:', error);
            return false;
        }
    }

    /**
     * Count failed login attempts for a specific email from the same IP
     * No time limit - counts all attempts from the same IP
     */
    static async countFailedAttempts(email: string, ipAddress: string): Promise<number> {
        try {
            const attempts = await LoginAttempt.countDocuments({
                email: email.toLowerCase(),
                ipAddress: ipAddress
            });
            return attempts;
        } catch (error) {
            logger.error('Error counting failed attempts:', error);
            return 0;
        }
    }

    /**
     * Record a failed login attempt
     */
    static async recordFailedAttempt(email: string, ipAddress: string, userAgent: string, isAdminTarget: boolean = false): Promise<void> {
        try {
            const attempt = new LoginAttempt({
                email: email.toLowerCase(),
                ipAddress,
                userAgent,
                isAdminTarget
            });
            await attempt.save();

            const attemptBackup = new LoginAttemptBackup({
                email: email.toLowerCase(),
                ipAddress,
                userAgent,
                isAdminTarget
            });
            await attemptBackup.save();

            logger.warn(`Failed login attempt recorded for ${email} from IP: ${ipAddress}, Admin target: ${isAdminTarget}`);
        } catch (error) {
            logger.error('Error recording failed attempt:', error);
        }
    }
} 