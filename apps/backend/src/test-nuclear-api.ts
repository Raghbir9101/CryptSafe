import axios from 'axios';

// Test script for nuclear option feature using actual API calls
async function testNuclearOptionAPI() {
    const baseURL = 'http://localhost:3000'; // Adjust port if different
    const adminEmail = 'admin@example.com';
    const wrongPassword = 'wrongpassword123';
    
    try {
        console.log('🚀 Testing Nuclear Option Feature via API...\n');

        console.log('1. Attempting failed login attempts with admin email...\n');

        // First failed attempt
        console.log('   Attempt 1: Failed login...');
        try {
            await axios.post(`${baseURL}/auth/login`, {
                email: adminEmail,
                password: wrongPassword
            });
        } catch (error: any) {
            console.log(`   ✅ Failed as expected: ${error.response?.data?.message || 'Login failed'}`);
        }

        // Second failed attempt
        console.log('   Attempt 2: Failed login...');
        try {
            await axios.post(`${baseURL}/auth/login`, {
                email: adminEmail,
                password: wrongPassword
            });
        } catch (error: any) {
            console.log(`   ✅ Failed as expected: ${error.response?.data?.message || 'Login failed'}`);
        }

        // Third failed attempt - this should trigger nuclear option
        console.log('   Attempt 3: Failed login (should trigger nuclear option)...');
        try {
            await axios.post(`${baseURL}/auth/login`, {
                email: adminEmail,
                password: wrongPassword
            });
        } catch (error: any) {
            const response = error.response?.data;
            console.log(`   ✅ Response: ${JSON.stringify(response, null, 2)}`);
            
            if (response?.securityAlert) {
                console.log('   🚨 NUCLEAR OPTION TRIGGERED!');
                console.log('   ⚠️  All data should now be deleted from primary database');
                console.log('   🛡️  Backup databases should remain intact');
            }
        }

        console.log('\n2. Verifying data deletion...');
        console.log('   Check your database to see if:');
        console.log('   - All tables are deleted from primary database');
        console.log('   - All data entries are deleted from primary database');
        console.log('   - Only admin user records remain in primary database');
        console.log('   - Backup databases contain all original data');

        console.log('\n✅ API test completed!');
        console.log('\n📝 Next steps:');
        console.log('1. Check your database to verify data deletion');
        console.log('2. Try logging in with correct admin credentials');
        console.log('3. Verify backup databases are intact');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testNuclearOptionAPI();
}

export { testNuclearOptionAPI }; 