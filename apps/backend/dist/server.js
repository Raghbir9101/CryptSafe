"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const PORT = process.env.PORT;
const MONGO_URI = `${process.env.MONGO_URI}` || "";
app_1.default.listen(PORT, async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log("Connected to MongoDB");
        console.log(`Server running on port ${PORT}`);
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
    }
});
