"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogBackup = void 0;
const mongoose_1 = require("mongoose");
const database_1 = require("../config/database");
const logSchema = new mongoose_1.Schema({
    message: { type: String, required: true },
    level: { type: String, required: true },
    timestamp: { type: Date, required: true },
    stack: { type: String },
    fileName: { type: String },
    lineNumber: { type: Number },
    columnNumber: { type: Number }
}, { timestamps: true });
const Log = database_1.conn1.model("log", logSchema);
const LogBackup = database_1.conn2.model("log", logSchema);
exports.LogBackup = LogBackup;
exports.default = Log;
