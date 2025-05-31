"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-minimum-32-characters';
const encrypt = (data) => {
    if (data === null || data === undefined) {
        return '';
    }
    if (Array.isArray(data)) {
        return crypto_js_1.default.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    }
    if (typeof data === 'object') {
        return crypto_js_1.default.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    }
    return crypto_js_1.default.AES.encrypt(String(data), ENCRYPTION_KEY).toString();
};
exports.encrypt = encrypt;
const decrypt = (encryptedData) => {
    if (!encryptedData) {
        return null;
    }
    try {
        const bytes = crypto_js_1.default.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decryptedString = bytes.toString(crypto_js_1.default.enc.Utf8);
        if (!decryptedString) {
            return null;
        }
        try {
            const parsed = JSON.parse(decryptedString);
            return parsed;
        }
        catch {
            return decryptedString;
        }
    }
    catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};
exports.decrypt = decrypt;
