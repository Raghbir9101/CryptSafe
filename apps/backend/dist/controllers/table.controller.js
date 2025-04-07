"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("../utils/asyncHandler");
const dotenv_1 = __importDefault(require("dotenv"));
const errorCodes_1 = require("../utils/errorCodes");
const table_model_1 = __importDefault(require("../models/table.model"));
const data_model_1 = __importDefault(require("../models/data.model"));
dotenv_1.default.config();
class TableController {
    static getAllTableData = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const tables = await table_model_1.default.find({
            $or: [
                { createdBy: req?.user?._id },
                { "sharedWith.email": req?.user?.email }
            ]
        }).populate('updatedBy', 'name');
        res.status(200).json(tables);
    });
    static getTableDataWithID = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const tables = await table_model_1.default.findOne({
            $or: [
                { createdBy: req?.user?._id, _id: req.params.id },
                { "sharedWith.email": req?.user?.email, _id: req.params.id }
            ]
        }).populate('updatedBy', 'name');
        res.status(200).json(tables);
    });
    static createTable = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { name, fields, description } = req.body;
        console.log(req.body, 'req.body');
        if (!name || !fields || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const table = await table_model_1.default.create({ ...req.body, createdBy: req?.user?._id });
        res.status(errorCodes_1.HttpStatusCodes.CREATED).json({ table, message: "Table created successfully" });
    });
    static updateTable = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { name, fields, description } = req.body;
        if (!name || !fields || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const table = await table_model_1.default.findOneAndUpdate({ createdBy: req?.user?._id, _id: req.params.id }, { name, fields, description });
        res.status(errorCodes_1.HttpStatusCodes.OK).json({ table, message: "Table created updated !" });
    });
    static shareTable = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = req.params.id;
        const { sharedWith } = req.body;
        const table = await table_model_1.default.findOne({ createdBy: req.user._id, _id: id });
        const isTableAleadyShared = table.sharedWith.findIndex(item => item.email == sharedWith.email);
        if (isTableAleadyShared == -1) {
            table.sharedWith.push(sharedWith);
        }
        else {
            console.log(sharedWith);
            table.sharedWith = table.sharedWith.map(item => {
                if (item.email === sharedWith.email)
                    return sharedWith;
                return item;
            });
        }
        await table.save();
        res.status(errorCodes_1.HttpStatusCodes.OK).json({ table, message: "Table created updated !" });
    });
    static deleteTable = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({ message: "Table id is required" });
        }
        const result = await table_model_1.default.deleteOne({ _id: req.params.id });
        res.status(200).json(result);
    });
    static getRows = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const tableID = req.params.id;
        const { isOwner, isShared, data, error, sharedUserSettings } = await this.checkIsTableSharedWithUserAndAllowed(req, res);
        if (error) {
            return res.status(400).json({ message: error });
        }
        if (isOwner) {
            const page = +req.query.page || 1;
            const skip = (page - 1) * (+req.query.limit || 10);
            const rows = await data_model_1.default.find({ tableID }).skip(skip).limit(10);
            return res.status(200).json(rows);
        }
        if (isShared) {
            const shownFields = sharedUserSettings.fieldPermission.map(item => item.permission != "NONE").reduce((acc, item, index) => {
                if (item)
                    acc[`data.${data.fields[index].name}`] = 1;
                return acc;
            }, {});
            const filterQuery = {};
            sharedUserSettings.fieldPermission.forEach((item, index) => {
                if (item.filter.length > 0) {
                    filterQuery[`data.${data.fields[index].name}`] = { $in: item.filter };
                }
            });
            const userPageLimit = sharedUserSettings?.rowsPerPageLimit || 10;
            const page = +req.query.page || 1;
            const skip = (page - 1) * userPageLimit;
            const rows = await data_model_1.default.find({ tableID, ...filterQuery }, shownFields).skip(skip).limit(userPageLimit);
            res.status(200).json(rows);
        }
    });
    static insertRow = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const tableID = req.params.tableID;
        const { error } = await this.checkIsTableSharedWithUserAndAllowed(req, res);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const data = req.body;
        if (!tableID) {
            return res.status(400).json({ message: "Table ID is required" });
        }
        if (Object.keys(data).length == 0) {
            return res.status(400).json({ message: "Data is required" });
        }
        const table = await table_model_1.default.findById(tableID);
        if (!table) {
            return res.status(400).json({ message: "Table not found" });
        }
        // Check unique constraints
        for (let field of table?.fields) {
            if (field.unique && data[field.name]) {
                const existingRow = await data_model_1.default.findOne({
                    tableID,
                    [`data.${field.name}`]: data[field.name]
                });
                if (existingRow) {
                    return res.status(400).json({
                        message: `${field.name} must be unique. Value "${data[field.name]}" already exists.`
                    });
                }
            }
        }
        for (let field of table?.fields) {
            if (field.type == "TEXT" || field.type == "NUMBER" || field.type == "DATE" || field.type == "BOOLEAN") {
                if (field.required && data[field.name] == undefined) {
                    return res.status(400).json({ message: `${field.name} is required` });
                }
            }
            else if (field.type == "SELECT") {
                if (data[field.name] && !field.options.includes(data[field.name])) {
                    return res.status(400).json({ message: `${field.name} is not a valid option` });
                }
            }
            switch (field.type) {
                case "TEXT":
                    data[field.name] = data[field.name]?.toString();
                    break;
                case "NUMBER":
                    data[field.name] = Number(data[field.name]);
                    break;
                case "DATE":
                    data[field.name] = new Date(data[field.name]);
                    break;
                case "BOOLEAN":
                    data[field.name] = Boolean(data[field.name]);
                    break;
                case "SELECT":
                    data[field.name] = data[field.name]?.toString();
                    break;
                case "MULTISELECT":
                    data[field.name] = data[field.name]?.split(",");
                    break;
            }
        }
        const row = await data_model_1.default.create({ data, createdBy: req?.user?._id, tableID });
        res.status(200).json({ row, message: "Row inserted successfully" });
    });
    static updateRow = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { error } = await this.checkIsTableSharedWithUserAndAllowed(req, res);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const { tableID, rowID } = req.params;
        const data = req.body;
        if (!tableID || !rowID) {
            return res.status(400).json({ message: "Table ID and Row ID are required" });
        }
        const table = await table_model_1.default.findById(tableID);
        if (!table) {
            return res.status(400).json({ message: "Table not found" });
        }
        // Check unique constraints
        for (let field of table?.fields) {
            if (field.unique && data[field.name]) {
                const existingRow = await data_model_1.default.findOne({
                    tableID,
                    _id: { $ne: rowID },
                    [`data.${field.name}`]: data[field.name]
                });
                if (existingRow) {
                    return res.status(400).json({
                        message: `${field.name} must be unique. Value "${data[field.name]}" already exists.`
                    });
                }
            }
        }
        // Process field types
        for (let field of table?.fields) {
            if (data[field.name] !== undefined) {
                switch (field.type) {
                    case "TEXT":
                        data[field.name] = data[field.name].toString();
                        break;
                    case "NUMBER":
                        data[field.name] = Number(data[field.name]);
                        break;
                    case "DATE":
                        data[field.name] = new Date(data[field.name]);
                        break;
                    case "BOOLEAN":
                        data[field.name] = Boolean(data[field.name]);
                        break;
                    case "SELECT":
                        if (!field.options.includes(data[field.name])) {
                            return res.status(400).json({ message: `${field.name} is not a valid option` });
                        }
                        data[field.name] = data[field.name].toString();
                        break;
                    case "MULTISELECT":
                        data[field.name] = data[field.name].split(",");
                        break;
                }
            }
        }
        const row = await data_model_1.default.findByIdAndUpdate(rowID, {
            $set: {
                data,
                updatedBy: req?.user?._id,
                updatedAt: new Date()
            }
        }, { new: true });
        await table_model_1.default.findByIdAndUpdate(tableID, { updatedBy: req?.user?._id }, { new: true });
        if (!row) {
            return res.status(404).json({ message: "Row not found" });
        }
        res.status(200).json({ row, message: "Row updated successfully" });
    });
    static deleteRow = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { error } = await this.checkIsTableSharedWithUserAndAllowed(req, res);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const rowID = req.params.rowID;
        if (!rowID) {
            return res.status(400).json({ message: "Row ID is required" });
        }
        await data_model_1.default.findByIdAndDelete(rowID);
        res.status(200).json({ message: "Row deleted successfully" });
    });
    static checkIsTableSharedWithUserAndAllowed = async (req, res) => {
        const tableID = req.params.id;
        const userID = req.user._id;
        if (!tableID) {
            return {
                isOwner: false,
                isShared: false,
                data: null,
                error: "Table ID is required",
                sharedUserSettings: null
            };
        }
        const table = await table_model_1.default.findOne({ _id: tableID });
        if (userID.toString() == table.createdBy.toString()) {
            return {
                isOwner: true,
                isShared: false,
                data: null,
                error: null,
                sharedUserSettings: null
            };
        }
        const isShared = table.sharedWith.findIndex(item => item.email == req.user.email);
        if (isShared == -1) {
            return {
                isOwner: false,
                isShared: false,
                data: null,
                error: "Table not shared with you",
                sharedUserSettings: null
            };
        }
        const userSettings = table.sharedWith[isShared];
        if (userSettings.isBlocked) {
            return {
                isOwner: false,
                isShared: true,
                sharedUserSettings: userSettings,
                error: "You are blocked by the admin. Please contact your admin.",
                data: table
            };
        }
        if (userSettings.restrictNetwork) {
            const isIPAllowed = this.isUserIPAllowed(userSettings.networkAccess, req.userIP);
            if (!isIPAllowed) {
                return {
                    isOwner: false,
                    isShared: true,
                    sharedUserSettings: userSettings,
                    error: "Your IP Address is not authorized by the Admin. Please contact your admin.",
                    data: table
                };
            }
        }
        if (userSettings.restrictWorkingTime) {
            const isWorkingTimeAllowed = this.isWorkingTimeWithinAccessTime(userSettings.workingTimeAccess);
            if (!isWorkingTimeAllowed) {
                return {
                    isOwner: false,
                    isShared: true,
                    sharedUserSettings: userSettings,
                    error: "Your working time is not within the access time range. Please contact your admin.",
                    data: table
                };
            }
        }
        return {
            isOwner: false,
            isShared: true,
            sharedUserSettings: userSettings,
            error: null,
            data: table
        };
    };
    static isUserIPAllowed(networkAccess, ip) {
        const networkAccessObj = networkAccess.find(item => ip == item.IP_ADDRESS);
        if (!networkAccessObj)
            return false;
        if (networkAccessObj.enabled)
            return true;
        return false;
    }
    static getAbbreviatedDayName(date) {
        const options = { weekday: 'short' };
        return date.toLocaleString('en-US', options).toUpperCase();
    }
    static isWorkingTimeWithinAccessTime(workingTimeAccess) {
        const currentTime = new Date();
        const localeTime = currentTime.toLocaleTimeString("en-IN", { hour12: false, timeZone: 'Asia/Kolkata' }).split(":").map(Number);
        ;
        const currentHour = localeTime[0];
        const currentMinute = localeTime[1];
        const currentDay = this.getAbbreviatedDayName(currentTime);
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const currentDayAccess = workingTimeAccess.find(dayAccess => dayAccess.day === currentDay);
        if (!currentDayAccess)
            return false;
        if (!currentDayAccess.accessTime.length)
            return false;
        if (!currentDayAccess.enabled)
            return false;
        for (const [startTime, endTime] of currentDayAccess.accessTime) {
            const [startHour, startMinute] = startTime.split(":").map(Number);
            const [endHour, endMinute] = endTime.split(":").map(Number);
            const startTimeInMinutes = startHour * 60 + startMinute;
            const endTimeInMinutes = endHour * 60 + endMinute;
            if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
                return true;
            }
        }
        return false;
    }
}
exports.default = TableController;
