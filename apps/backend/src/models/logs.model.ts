import mongoose, { Schema, Document } from "mongoose";
import { LogInterface } from "@repo/types";
import { conn1, conn2 } from "../config/database";

const logSchema: Schema = new Schema({
  message: { type: String, required: true },
  level: { type: String, required: true },
  timestamp: { type: Date, required: true },
  stack: { type: String },
  fileName: { type: String },
  lineNumber: { type: Number },
  columnNumber: { type: Number }
}, { timestamps: true });

const Log = conn1.model<LogInterface & Document>("log", logSchema);
const LogBackup = conn2.model<LogInterface & Document>("log", logSchema);

export default Log;
export { LogBackup };
