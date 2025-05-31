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
