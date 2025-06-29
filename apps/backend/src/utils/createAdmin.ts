import User, { UserBackup } from '../models/user.model';
import bcrypt from 'bcryptjs';

export async function createAdminUser(email: string, name: string, password: string) {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return existingAdmin;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user data
        const adminData = {
            email: email.toLowerCase(),
            name,
            password: hashedPassword,
            isAdmin: true,
            passwordReset: true
        };

        // Create in primary database
        const adminUser = new User(adminData);
        await adminUser.save();

        // Create in backup database
        const adminBackup = new UserBackup(adminData);
        await adminBackup.save();

        console.log('Admin user created successfully:', {
            email: adminUser.email,
            name: adminUser.name,
            isAdmin: adminUser.isAdmin
        });

        return adminUser;
    } catch (error) {
        console.error('Error creating admin user:', error);
        throw error;
    }
}

// Example usage:
// createAdminUser('admin@example.com', 'Admin User', 'adminpassword123'); 