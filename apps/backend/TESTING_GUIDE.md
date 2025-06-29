# Nuclear Option Testing Guide

## 🧪 How to Test the Nuclear Option Feature

### Prerequisites
1. Make sure your backend server is running (`npm run dev`)
2. Ensure you have an admin user created
3. Have some test data (tables, data entries) in your database

### Method 1: Manual Testing via Frontend (Recommended)

1. **Start your backend server:**
   ```bash
   cd apps/backend
   npm run dev
   ```

2. **Start your frontend server:**
   ```bash
   cd apps/frontend
   npm run dev
   ```

3. **Create an admin user** (if not already created):
   - Use the registration page or create via database
   - Ensure the user has `isAdmin: true`

4. **Create some test data:**
   - Log in with the admin account
   - Create a few tables and add some data
   - Log out

5. **Test the nuclear option:**
   - Go to the login page
   - Enter the admin email but with a wrong password
   - Click "Sign In" - this is attempt 1
   - Try again with wrong password - this is attempt 2
   - Try one more time with wrong password - this is attempt 3
   - **The nuclear option should trigger immediately after the 3rd attempt**

6. **Verify the results:**
   - Check your database - all data should be deleted from primary database
   - Only admin user records should remain
   - Backup databases should be intact

### Method 2: API Testing

1. **Start your backend server:**
   ```bash
   cd apps/backend
   npm run dev
   ```

2. **Run the API test script:**
   ```bash
   npm run test:nuclear:api
   ```

3. **Check the output** for nuclear option trigger confirmation

### Method 3: Database Verification

1. **Check primary database:**
   ```javascript
   // Connect to your primary database
   // Check these collections:
   db.users.find() // Should only show admin users
   db.tables.find() // Should be empty
   db.data.find() // Should be empty
   db.logs.find() // Should only show nuclear operation log
   db.otps.find() // Should be empty
   db.loginAttempts.find() // Should be empty
   ```

2. **Check backup database:**
   ```javascript
   // Connect to your backup database
   // All collections should contain original data
   db.users.find() // Should show all users
   db.tables.find() // Should show all tables
   db.data.find() // Should show all data
   ```

### Method 4: Using Postman or cURL

1. **Make 3 failed login attempts:**
   ```bash
   # Attempt 1
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"wrongpassword"}'

   # Attempt 2
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"wrongpassword"}'

   # Attempt 3 (should trigger nuclear option)
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"wrongpassword"}'
   ```

2. **Check the response** - the 3rd attempt should return:
   ```json
   {
     "message": "Invalid credentials",
     "securityAlert": "Multiple failed attempts detected"
   }
   ```

## 🔍 What to Look For

### Successful Nuclear Option Trigger:
- ✅ 3rd failed attempt returns `securityAlert` message
- ✅ All tables deleted from primary database
- ✅ All data entries deleted from primary database
- ✅ All non-admin users deleted from primary database
- ✅ Only admin user records remain in primary database
- ✅ Backup databases remain completely intact
- ✅ Nuclear operation logged in both databases

### If It's Not Working:
- ❌ Check if admin user has `isAdmin: true` in database
- ❌ Verify the login attempts are from the same IP address
- ❌ Check server logs for any errors
- ❌ Ensure the backend server is running
- ❌ Verify the API endpoint is correct

## 🛠️ Troubleshooting

### Common Issues:

1. **Nuclear option not triggering:**
   - Check if user is actually an admin (`isAdmin: true`)
   - Verify IP address tracking is working
   - Check server logs for errors

2. **Data not being deleted:**
   - Check database connection
   - Verify the nuclear option function is being called
   - Check for any database transaction issues

3. **Backup databases being affected:**
   - This should NOT happen - backup databases should always be preserved
   - Check the nuclear option implementation

### Debug Steps:

1. **Add console logs** to the nuclear option function:
   ```typescript
   console.log('Nuclear option triggered for:', adminEmail);
   console.log('Deleting users...');
   // Add more logs
   ```

2. **Check database directly:**
   ```javascript
   // Check login attempts
   db.loginAttempts.find({email: "admin@example.com"})
   
   // Check if user is admin
   db.users.findOne({email: "admin@example.com"})
   ```

3. **Monitor server logs** for any error messages

## ⚠️ Important Notes

- **Always test in a development environment first**
- **Make sure you have backups before testing**
- **The nuclear option is irreversible** - data deletion is permanent
- **Backup databases should always remain intact**
- **Only admin user records should survive in primary database**

## 🚀 Recovery After Testing

If you need to restore data after testing:

1. **From backup databases:**
   ```javascript
   // Copy data from backup to primary
   db.users.insertMany(backupDb.users.find().toArray())
   db.tables.insertMany(backupDb.tables.find().toArray())
   db.data.insertMany(backupDb.data.find().toArray())
   ```

2. **Or restart with fresh data** if this is just testing 