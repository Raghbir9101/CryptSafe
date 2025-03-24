
import mongoose, { Schema, Document } from "mongoose";
import { DataInterface } from "@repo/types";

const dataSchema: Schema = new Schema({
    createdBy: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    tableID: { type: mongoose.Types.ObjectId, ref: "table", required: true },
    data: { type: Object, required: true },
}, { timestamps: true });

const Data = mongoose.model<DataInterface & Document>("data", dataSchema);

export default Data;
