import mongoose, { Schema, Document, Types } from "mongoose";
import { TableInterface } from "@repo/types";
const validTypes = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTISELECT"];
const tableSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  fields: {
    type: [
      {
        name: { type: String, required: true },
        unique: { type: Boolean, required: true },
        type: {
          type: String,
          required: true,
          enum: validTypes,
        },
        required: { type: Boolean, required: true },
        hidden: { type: Boolean, required: true },
        options: { type: [String], required: false },
      }
    ], required: true
  },
  sharedWith: {
    type: [{
      email: { type: String, required: false },
      fieldPermission: {
        type: [{
          fieldName: { type: String, },
          permission: { type: String, enum: ["READ", "WRITE"] },
          filter: { type: Array, default: [] }
        }],
      },
      isBlocked: { type: Boolean, default: false },
    }],
  },
  createdBy: {
    type: Types.ObjectId,
    ref: "user"
  },
  editedBy: {
    type: Types.ObjectId,
    ref: "user"
  }
}, { timestamps: true });

const Table = mongoose.model<TableInterface & Document>("table", tableSchema);

export default Table;

