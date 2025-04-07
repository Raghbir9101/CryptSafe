"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const validTypes = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTISELECT"];
// Add this new schema before the tableSchema
const networkAccessSchema = new mongoose_1.Schema({
    IP_ADDRESS: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    comment: { type: String },
    type: { type: String, enum: ['IPv4', 'IPv6'], required: true }
}, { timestamps: true });
const NetworkAccess = mongoose_1.default.model("networkAccess", networkAccessSchema);
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
const Table = mongoose_1.default.model("table", tableSchema);
exports.default = Table;
