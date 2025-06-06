"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptObjectValues = encryptObjectValues;
exports.decryptObjectValues = decryptObjectValues;
const crypto_js_1 = __importDefault(require("crypto-js"));
// Encrypts a JS object using AES and a secret key
// export function encryptData(data: any, secretKey: string): string {
//   const json = JSON.stringify(data);
//   return CryptoJS.AES.encrypt(json, secretKey).toString();
// }
const skipKeys = ["unique", "required", "hidden", "options", "tablePermissions", "enabled", "fieldPermission", "isBlocked", "workingTimeAccess", "restrictNetwork", "restrictWorkingTime", "_id", "createdAt", "updatedAt"];
function encryptObjectValues(obj, secretKey) {
    if (Array.isArray(obj)) {
        return obj.map(item => encryptObjectValues(item, secretKey));
    }
    else if (obj !== null && typeof obj === "object") {
        const encryptedObj = {};
        for (const key in obj) {
            if (skipKeys.includes(key)) {
                encryptedObj[key] = obj[key];
            }
            else {
                encryptedObj[key] = encryptObjectValues(obj[key], secretKey);
            }
        }
        return encryptedObj;
    }
    else {
        // Encrypt only primitive values (string, number, boolean)
        const key = crypto_js_1.default.enc.Utf8.parse(process.env.GOOGLE_API);
        let iv = crypto_js_1.default.enc.Utf8.parse(process.env.GOOGLE_API);
        return crypto_js_1.default.AES.encrypt(String(obj), key, { iv: iv }).toString();
    }
}
function decryptObjectValues(obj, secretKey) {
    if (Array.isArray(obj)) {
        return obj.map(item => decryptObjectValues(item, secretKey));
    }
    else if (obj !== null && typeof obj === "object") {
        const decryptedObj = {};
        for (const key in obj) {
            if (skipKeys.includes(key)) {
                decryptedObj[key] = obj[key];
            }
            else {
                decryptedObj[key] = decryptObjectValues(obj[key], secretKey);
            }
        }
        return decryptedObj;
    }
    else if (typeof obj === "string") {
        try {
            const key = crypto_js_1.default.enc.Utf8.parse(process.env.GOOGLE_API);
            let iv = crypto_js_1.default.enc.Utf8.parse(process.env.GOOGLE_API);
            const bytes = crypto_js_1.default.AES.decrypt(obj, key, {
                iv: iv,
                mode: crypto_js_1.default.mode.CBC,
                padding: crypto_js_1.default.pad.Pkcs7
            });
            // const bytes = CryptoJS.AES.decrypt(obj, secretKey);
            const decrypted = bytes.toString(crypto_js_1.default.enc.Utf8);
            // If decryption fails, decrypted will be empty string
            return decrypted ? decrypted : obj;
        }
        catch {
            return obj;
        }
    }
    else {
        return obj;
    }
}
