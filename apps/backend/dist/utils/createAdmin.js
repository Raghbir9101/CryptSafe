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
exports.createAdminUser = createAdminUser;
const user_model_1 = __importStar(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function createAdminUser(email, name, password) {
    try {
        // Check if admin already exists
        const existingAdmin = await user_model_1.default.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return existingAdmin;
        }
        // Hash the password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create admin user data
        const adminData = {
            email: email.toLowerCase(),
            name,
            password: hashedPassword,
            isAdmin: true,
            passwordReset: true
        };
        // Create in primary database
        const adminUser = new user_model_1.default(adminData);
        await adminUser.save();
        // Create in backup database
        const adminBackup = new user_model_1.UserBackup(adminData);
        await adminBackup.save();
        console.log('Admin user created successfully:', {
            email: adminUser.email,
            name: adminUser.name,
            isAdmin: adminUser.isAdmin
        });
        return adminUser;
    }
    catch (error) {
        console.error('Error creating admin user:', error);
        throw error;
    }
}
// Example usage:
// createAdminUser('admin@example.com', 'Admin User', 'adminpassword123'); 
