"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBackup = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isGoogleUser) {
        return next();
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (this.isGoogleUser) {
        return false;
    }
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
const User = database_1.conn1.model("user", userSchema);
const UserBackup = database_1.conn2.model("user", userSchema);
exports.UserBackup = UserBackup;
exports.default = User;
