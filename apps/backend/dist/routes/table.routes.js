"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const table_controller_1 = __importDefault(require("../controllers/table.controller"));
const tableRouter = (0, express_1.Router)();
tableRouter.get("/:id", table_controller_1.default.getTableDataWithID);
tableRouter.get("/rows/:id", table_controller_1.default.getRows);
tableRouter.post("/", table_controller_1.default.createTable);
tableRouter.patch("/:id", table_controller_1.default.updateTable);
tableRouter.patch("/share/:id", table_controller_1.default.shareTable);
tableRouter.route("/").get(table_controller_1.default.getAllTableData);
tableRouter.post("/insert/:tableID", table_controller_1.default.insertRow);
tableRouter.patch("/update/:tableID/:rowID", table_controller_1.default.updateRow);
tableRouter.delete("/delete/:tableID/:rowID", table_controller_1.default.deleteRow);
tableRouter.delete("/:id", table_controller_1.default.deleteTable);
exports.default = tableRouter;
