import app from "./app";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import CryptoJS from "crypto-js";

dotenv.config();
const PORT = process.env.PORT;

// const key = CryptoJS.enc.Utf8.parse("1234567890123456"); // 16-byte key
// const iv = CryptoJS.enc.Utf8.parse("6543210987654321");  // 16-byte IV

// const encrypted1 = CryptoJS.AES.encrypt("ishan", key, { iv: iv }).toString();
// const encrypted2 = CryptoJS.AES.encrypt("ishan", key, { iv: iv }).toString();


app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
});
