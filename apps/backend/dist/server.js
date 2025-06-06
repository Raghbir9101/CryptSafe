"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const PORT = process.env.PORT;
// const key = CryptoJS.enc.Utf8.parse("1234567890123456"); // 16-byte key
// const iv = CryptoJS.enc.Utf8.parse("6543210987654321");  // 16-byte IV
// const encrypted1 = CryptoJS.AES.encrypt("ishan", key, { iv: iv }).toString();
// const encrypted2 = CryptoJS.AES.encrypt("ishan", key, { iv: iv }).toString();
app_1.default.listen(PORT, async () => {
    try {
        await (0, database_1.connectDB)();
        console.log(`Server running on port ${PORT}`);
    }
    catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
});
