import { createAdminUser } from './utils/createAdmin';
import { NuclearOptionService } from './utils/nuclearOption';
import { config } from './config';

// Test script for nuclear option feature
async function testNuclearOption() {
    try {
        console.log('🚀 Testing Nuclear Option Feature...\n');

        // Step 1: Create an admin user
        console.log('1. Creating admin user...');
        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpassword123';
        
        await createAdminUser(adminEmail, 'Admin User', adminPassword);
        console.log('✅ Admin user created successfully\n');

        // Step 2: Simulate failed login attempts
        console.log('2. Simulating failed login attempts...');
        const testIP = '192.168.1.100';
        const testUserAgent = 'Test Browser/1.0';

        // First failed attempt
        console.log('   Attempt 1: Failed login...');
        await NuclearOptionService.recordFailedAttempt(adminEmail, testIP, testUserAgent, true);
        
        // Second failed attempt
        console.log('   Attempt 2: Failed login...');
        await NuclearOptionService.recordFailedAttempt(adminEmail, testIP, testUserAgent, true);
        
        // Third failed attempt
        console.log('   Attempt 3: Failed login...');
        await NuclearOptionService.recordFailedAttempt(adminEmail, testIP, testUserAgent, true);

        console.log('✅ 3 failed attempts recorded\n');

        // Step 3: Check failed attempts count
        console.log('3. Checking failed attempts count...');
        const attemptCount = await NuclearOptionService.countFailedAttempts(adminEmail, testIP);
        console.log(`   Failed attempts: ${attemptCount}\n`);

        // Step 4: Check if nuclear option should trigger
        console.log('4. Checking if nuclear option should trigger...');
        const isAdmin = await NuclearOptionService.isAdminEmail(adminEmail);
        console.log(`   Is admin email: ${isAdmin}`);
        console.log(`   Should trigger nuclear option: ${attemptCount >= 3 && isAdmin}\n`);

        // Step 5: Execute nuclear option (commented out for safety)
        console.log('5. Nuclear option execution (commented out for safety)...');
        console.log('   ⚠️  Nuclear option execution is commented out to prevent data loss');
        console.log('   Uncomment the following line to test the actual deletion:');
        console.log('   await NuclearOptionService.executeNuclearOption(adminEmail, testIP);\n');

        console.log('✅ Test completed successfully!');
        console.log('\n📝 Key Features:');
        console.log('• IMMEDIATE deletion after 3 failed attempts (no time limit)');
        console.log('• Deletes ALL data and tables from PRIMARY database only');
        console.log('• Preserves ONLY admin user records in primary database');
        console.log('• 🛡️  BACKUP DATABASES ARE PRESERVED as safety net');
        console.log('• All data remains safe in backup databases for recovery');
        console.log('\n📝 To actually test the nuclear option:');
        console.log('1. Uncomment the executeNuclearOption line');
        console.log('2. Ensure you have backup data');
        console.log('3. Run this script in a test environment');
        console.log('4. Be aware that ALL data will be deleted from primary database');
        console.log('5. Backup databases will remain intact for recovery');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testNuclearOption();
}

export { testNuclearOption }; 