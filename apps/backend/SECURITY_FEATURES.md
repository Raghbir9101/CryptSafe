# Security Features - Nuclear Option

## Overview

This application implements a "Nuclear Option" security feature that protects admin accounts from brute force attacks by permanently deleting ALL data from the primary database when an admin account is targeted with multiple failed login attempts. **Backup databases are preserved as a safety net.**

## How It Works

### Trigger Conditions
- An attacker attempts to log in with an email that belongs to an admin user
- The login attempt fails (wrong password or user doesn't exist)
- This happens 3 times from the same IP address (no time limit)

### Nuclear Option Execution
When triggered, the system will **immediately**:

1. **Delete all non-admin users** from PRIMARY database only
2. **Delete ALL tables** from PRIMARY database only
3. **Delete ALL data entries** from PRIMARY database only
4. **Delete all logs** from PRIMARY database only (except the nuclear operation log)
5. **Delete all OTPs** from PRIMARY database only
6. **Delete all login attempt records** from PRIMARY database only

### What Gets Preserved
- **ONLY** admin user accounts in PRIMARY database (for future login)
- **ALL backup databases** remain completely intact
- The nuclear operation log entry in both primary and backup databases

### What Gets Deleted
- **ALL** non-admin users from PRIMARY database
- **ALL** tables from PRIMARY database (regardless of creator)
- **ALL** data entries from PRIMARY database (regardless of creator)
- **ALL** logs, OTPs, and login attempts from PRIMARY database

### Safety Net
- **Backup databases are NEVER touched** during nuclear option execution
- All data remains safe in backup databases for potential recovery
- Nuclear operation is logged in both primary and backup databases

## Implementation Details

### Models
- `LoginAttempt`: Tracks failed login attempts with IP address, user agent, and timestamp
- **No automatic cleanup** - counts all attempts from the same IP

### Services
- `NuclearOptionService`: Handles all nuclear option logic
  - `executeNuclearOption()`: Performs the complete data deletion from PRIMARY database only
  - `isAdminEmail()`: Checks if an email belongs to an admin
  - `countFailedAttempts()`: Counts all failed attempts from same IP
  - `recordFailedAttempt()`: Records a failed login attempt

### Integration
- Integrated into both regular login (`/auth/login`) and Google OAuth login
- Tracks IP address and user agent for security monitoring
- **Immediate execution** after 3 failed attempts
- Clears failed attempts on successful login

## Security Considerations

### Pros
- **Immediate Response**: No waiting period - triggers instantly after 3 attempts
- **Complete Data Protection**: Ensures ALL sensitive data is destroyed from primary database
- **Strong Deterrent**: Makes admin account attacks extremely risky
- **Audit Trail**: Logs all nuclear operations for investigation
- **Safety Net**: Backup databases remain intact for potential recovery

### Cons
- **Complete Data Loss**: Permanently deletes ALL data from primary database except admin users
- **False Positives**: Could trigger if admin forgets password multiple times
- **No Automatic Recovery**: No automatic recovery mechanism
- **Admin Data Loss**: Even admin-created tables and data are deleted from primary database

## Recovery Options

### From Backup Databases
Since backup databases are preserved, you can:
1. **Restore from backup**: Copy data from backup databases back to primary
2. **Switch to backup**: Temporarily use backup databases as primary
3. **Selective recovery**: Restore only specific data from backups

### Manual Recovery Process
1. Stop the application
2. Restore data from backup databases to primary database
3. Restart the application
4. Verify data integrity

## Configuration

### Creating Admin Users
Use the utility function to create admin users:

```typescript
import { createAdminUser } from './utils/createAdmin';

await createAdminUser('admin@example.com', 'Admin User', 'securepassword123');
```

### Environment Variables
Ensure these are set in your `.env` file:
- `JWT_SECRET`: For JWT token generation
- `EMAIL_USER` & `EMAIL_PASSWORD`: For email notifications (if implemented)

## Monitoring

### Logs
The system logs all nuclear operations with:
- CRITICAL level log entries in both primary and backup databases
- IP address of the attacker
- Admin email being targeted
- Timestamp of the operation
- Clear indication that backup databases were preserved

### Database Monitoring
Monitor the `loginAttempts` collection for:
- High frequency of failed attempts
- Multiple IPs targeting the same admin email
- Geographic patterns in attack attempts

## Testing

### Safe Testing
1. Create a test admin user
2. Attempt 3 failed logins from the same IP
3. Verify **immediate** data deletion from primary database
4. Verify backup databases remain intact
5. Check logs for nuclear operation entry

### Recovery Testing
1. Test backup restoration procedures
2. Verify only admin user records remain in primary database
3. Confirm ALL other data is properly deleted from primary database
4. Verify backup databases contain all original data

## Best Practices

1. **Regular Backups**: Maintain regular backups before nuclear option execution
2. **Admin Training**: Ensure admins understand the consequences
3. **Monitoring**: Set up alerts for failed login attempts
4. **Documentation**: Keep detailed records of all nuclear operations
5. **Recovery Plan**: Have a plan for data recovery from backup databases
6. **Admin Password Management**: Use strong, memorable passwords for admin accounts
7. **Backup Verification**: Regularly verify backup database integrity

## Warning

⚠️ **This feature permanently deletes ALL data from the primary database except admin user records. Use with extreme caution in production environments.**

⚠️ **The nuclear option triggers IMMEDIATELY after 3 failed attempts - no waiting period.**

⚠️ **Backup databases are preserved as a safety net, but manual recovery will be required.** 