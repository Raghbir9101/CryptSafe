import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-minimum-32-characters';

export const encrypt = (data: any): string => {
    if (data === null || data === undefined) {
        return '';
    }
    if (Array.isArray(data)) {
        return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    }
    if (typeof data === 'object') {
        return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    }
    return CryptoJS.AES.encrypt(String(data), ENCRYPTION_KEY).toString();
};

export const decrypt = (encryptedData: string): any => {
    if (!encryptedData) {
        return null;
    }
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) {
            return null;
        }
        try {
            const parsed = JSON.parse(decryptedString);
            return parsed;
        } catch {
            return decryptedString;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}; 