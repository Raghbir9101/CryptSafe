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
const express_1 = require("express");
const table_controller_1 = __importStar(require("../controllers/table.controller"));
const tableRouter = (0, express_1.Router)();
tableRouter.get("/:id", table_controller_1.default.getTableDataWithID);
tableRouter.get("/rows/:id", table_controller_1.default.getRows);
tableRouter.post("/", table_controller_1.default.createTable);
tableRouter.patch("/:id", table_controller_1.default.updateTable);
tableRouter.patch("/share/:id", table_controller_1.default.shareTable);
tableRouter.route("/").get(table_controller_1.default.getAllTableData);
tableRouter.post("/insert/:id", table_controller_1.upload.any(), table_controller_1.default.insertRow);
tableRouter.patch("/update/:id/:rowID", table_controller_1.upload.any(), table_controller_1.default.updateRow);
tableRouter.delete("/delete/:id/:rowID", table_controller_1.default.deleteRow);
tableRouter.delete("/:id", table_controller_1.default.deleteTable);
exports.default = tableRouter;
