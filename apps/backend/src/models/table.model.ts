import mongoose, { Schema, Document, Types } from "mongoose";
import { TableInterface } from "@repo/types";
import { encrypt, decrypt } from "../utils/encryption";

const validTypes = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTISELECT"];

// Add this new schema before the tableSchema
const networkAccessSchema: Schema = new Schema({
  IP_ADDRESS: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  comment: { type: String },
  type: { type: String, enum: ['IPv4', 'IPv6'], required: true }
}, { timestamps: true });

const NetworkAccess = mongoose.model("networkAccess", networkAccessSchema);

const tableSchema: Schema = new Schema({
  name: { type: String, required: true, get: decrypt, set: encrypt },
  description: { type: String, required: true, get: decrypt, set: encrypt },
  fields: {
    type: [
      {
        name: { type: String, required: true, get: decrypt, set: encrypt },
        unique: { type: Boolean, required: true },
        type: {
          type: String,
          required: true,
          enum: validTypes,
        },
        required: { type: Boolean, required: true },
        hidden: { type: Boolean, required: true },
        options: { type: [String], required: false, get: decrypt, set: encrypt },
      }
    ], required: true
  },
  sharedWith: {
    type: [{
      email: { type: String, required: false, get: decrypt, set: encrypt },
      fieldPermission: {
        type: [{
          fieldName: { type: String, get: decrypt, set: encrypt },
          permission: { type: String, enum: ["READ", "WRITE", "NONE"] },
          filter: { type: Array, default: [], get: decrypt, set: encrypt }
        }],
      },
      tablePermissions: {
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      isBlocked: { type: Boolean, default: false },
      workingTimeAccess: {
        type: [{
          day: {
            type: String,
            enum: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
            required: true
          },
          accessTime: {
            type: [[String]],
            default: [],
            get: decrypt,
            set: encrypt
          },
          enabled: {
            type: Boolean,
            default: true
          }
        }],
        default: [
          {
            day: "SUN",
            accessTime: [],
            enabled: true
          },
          {
            day: "MON",
            accessTime: [["09:00", "18:00"]],
            enabled: true
          },
          {
            day: "TUE",
            accessTime: [["09:00", "18:00"]],
            enabled: true
          },
          {
            day: "WED",
            accessTime: [["09:00", "18:00"]],
            enabled: true
          },
          {
            day: "THU",
            accessTime: [["09:00", "18:00"]],
            enabled: true
          },
          {
            day: "FRI",
            accessTime: [["09:00", "18:00"]],
            enabled: true
          },
          {
            day: "SAT",
            accessTime: [["09:00", "18:00"]],
            enabled: true
          }
        ]
      },
      networkAccess: {
        type: [networkAccessSchema],
        default: []
      },
      restrictNetwork: { type: Boolean, default: false },
      restrictWorkingTime: { type: Boolean, default: false },
    }],
  },
  createdBy: {
    type: Types.ObjectId,
    ref: "user"
  },
  updatedBy: {
    type: Types.ObjectId,
    ref: "user"
  },
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

const Table = mongoose.model<TableInterface & Document>("table", tableSchema);

export default Table;

