
import mongoose, { Schema, Document } from "mongoose";
import { DataInterface } from "@repo/types";
import { conn1, conn2 } from "../config/database";

const dataSchema: Schema = new Schema({
    createdBy: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    tableID: { type: mongoose.Types.ObjectId, ref: "table", required: true },
    data: { type: Object, required: true },
}, { timestamps: true });


const Data = conn1.model<DataInterface & Document>("data", dataSchema);
const DataBackup = conn2.model<DataInterface & Document>("data", dataSchema);

export default Data;
export { DataBackup };