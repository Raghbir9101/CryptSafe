import mongoose, { Schema, Document } from "mongoose";
import { TableInterface } from "@repo/types";
const tableSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  fields: {
    type: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true, enum: ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTISELECT"] },
        required: { type: Boolean, required: true },
        hidden: { type: Boolean, required: true },
        options: { type: [String], required: false },
      }
    ], required: true
  },
  sharedWith: {
    type: [{
      email: { type: String, required: true },
      fieldPermission: {
        type: [{
          fieldName: { type: String, required: true },
          permission: { type: String, required: true, enum: ["READ", "WRITE"] },
        }], required: true
      },
      isBlocked: { type: Boolean, required: true, default: false },
    }], required: true
  },
}, { timestamps: true });

const Table = mongoose.model<TableInterface & Document>("table", tableSchema);

export default Table;

