"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.conn2 = exports.conn1 = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = `${process.env.MONGO_URI}` || "";
const MONGO_URI_1 = `${process.env.MONGO_URI_1}` || "";
exports.conn1 = mongoose_1.default.createConnection(MONGO_URI);
exports.conn2 = mongoose_1.default.createConnection(MONGO_URI_1);
const connectDB = async () => {
    try {
        const connect = await mongoose_1.default.connect(MONGO_URI);
        // await Promise.all([conn1.asPromise(), conn2.asPromise()]);
        console.log("Connected to MongoDB" + connect.connection.host);
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
