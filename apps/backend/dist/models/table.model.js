"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const database_1 = require("../config/database");
const validTypes = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTISELECT"];
// Add this new schema before the tableSchema
const networkAccessSchema = new mongoose_1.Schema({
    IP_ADDRESS: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    comment: { type: String },
    type: { type: String, enum: ['IPv4', 'IPv6'], required: true }
}, { timestamps: true });
const NetworkAccess = database_1.conn1.model("networkAccess", networkAccessSchema);
const tableSchema = new mongoose_1.Schema({
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
                            permission: { type: String, enum: ["READ", "WRITE", "NONE"] },
                            filter: { type: Array, default: [] }
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
                                default: []
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
        type: mongoose_1.Types.ObjectId,
        ref: "user"
    },
    updatedBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "user"
    },
}, { timestamps: true });
const Table = database_1.conn1.model("table", tableSchema);
exports.default = Table;
