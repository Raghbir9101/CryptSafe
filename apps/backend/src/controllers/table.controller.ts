import User, { UserInterface } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Table from "../models/table.model";
import Data from "../models/data.model";
import { TableInterface } from "@repo/types";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export default class TableController {

    static getAllTableData = asyncHandler(async (req, res): Promise<void> => {
        const tables = await Table.find({ createdBy: req?.user?._id })
        res.status(200).json(tables)
    })

    static getTableDataWithID = asyncHandler(async (req, res): Promise<void> => {
        const tables = await Table.findOne({ createdBy: req?.user?._id, _id: req.params.id })
        res.status(200).json(tables)
    })

    static createTable = asyncHandler(async (req, res): Promise<any> => {
        const { name, fields, description } = req.body
        console.log(req.body, 'req.body');
        if (!name || !fields || !description) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const table = await Table.create({ ...req.body, createdBy: req?.user?._id })
        res.status(HttpStatusCodes.CREATED).json({ table, message: "Table created successfully" })
    })

    static updateTable = asyncHandler(async (req, res): Promise<any> => {
        const { name, fields, description } = req.body

        if (!name || !fields || !description) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const table = await Table.findOneAndUpdate({ createdBy: req?.user?._id, _id: req.params.id }, { name, fields, description })
        res.status(HttpStatusCodes.OK).json({ table, message: "Table created updated !" })
    })

    static shareTable = asyncHandler(async (req, res): Promise<any> => {
        const id = req.params.id;
        const { sharedWith }: { sharedWith: TableInterface["sharedWith"][0] } = req.body

        const table = await Table.findOne({ createdBy: req.user._id, _id: id });

        const isTableAleadyShared = table.sharedWith.findIndex(item => item.email == sharedWith.email);

        if (isTableAleadyShared == -1) {
            table.sharedWith.push(sharedWith)
        }
        else {
            console.log(sharedWith)
            table.sharedWith = table.sharedWith.map(item => {
                if (item.email === sharedWith.email) return sharedWith;
                return item;
            })
        }

        await table.save()
        
        res.status(HttpStatusCodes.OK).json({ table, message: "Table created updated !" })
    })

    static deleteTable = asyncHandler(async (req, res): Promise<any> => {
        if (!req.params.id) {
            return res.status(400).json({ message: "Table id is required" })
        }
        const result = await Table.deleteOne({ _id: req.params.id })
        res.status(200).json(result)
    })

    static getRows = asyncHandler(async (req, res): Promise<any> => {
        const tableID = req.params.id;
        if (!tableID) {
            return res.status(400).json({ message: "Table ID is required" })
        }
        const rows = await Data.find({ tableID })
        res.status(200).json(rows)
    })

    static insertRow = asyncHandler(async (req, res): Promise<any> => {
        const tableID = req.params.tableID;
        const data = req.body;
        if (!tableID) {
            return res.status(400).json({ message: "Table ID is required" })
        }
        if (Object.keys(data).length == 0) {
            return res.status(400).json({ message: "Data is required" })
        }

        const table = await Table.findById(tableID);
        if (!table) {
            return res.status(400).json({ message: "Table not found" })
        }

        // Check unique constraints
        for (let field of table?.fields) {
            if (field.unique && data[field.name]) {
                const existingRow = await Data.findOne({
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
                    return res.status(400).json({ message: `${field.name} is required` })
                }
            }
            else if (field.type == "SELECT") {
                if (data[field.name] && !field.options.includes(data[field.name])) {
                    return res.status(400).json({ message: `${field.name} is not a valid option` })
                }
            }

            switch (field.type) {
                case "TEXT":
                    data[field.name] = data[field.name]?.toString()
                    break;
                case "NUMBER":
                    data[field.name] = Number(data[field.name])
                    break;
                case "DATE":
                    data[field.name] = new Date(data[field.name])
                    break;
                case "BOOLEAN":
                    data[field.name] = Boolean(data[field.name])
                    break;
                case "SELECT":
                    data[field.name] = data[field.name]?.toString()
                    break;
                case "MULTISELECT":
                    data[field.name] = data[field.name]?.split(",")
                    break;
            }
        }

        const row = await Data.create({ data, createdBy: req?.user?._id, tableID })
        res.status(200).json({ row, message: "Row inserted successfully" })
    })

    static updateRow = asyncHandler(async (req, res): Promise<any> => {
        const { tableID, rowID } = req.params;
        const data = req.body;

        if (!tableID || !rowID) {
            return res.status(400).json({ message: "Table ID and Row ID are required" })
        }

        const table = await Table.findById(tableID);
        if (!table) {
            return res.status(400).json({ message: "Table not found" })
        }

        // Check unique constraints
        for (let field of table?.fields) {
            if (field.unique && data[field.name]) {
                const existingRow = await Data.findOne({
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
                        data[field.name] = data[field.name].toString()
                        break;
                    case "NUMBER":
                        data[field.name] = Number(data[field.name])
                        break;
                    case "DATE":
                        data[field.name] = new Date(data[field.name])
                        break;
                    case "BOOLEAN":
                        data[field.name] = Boolean(data[field.name])
                        break;
                    case "SELECT":
                        if (!field.options.includes(data[field.name])) {
                            return res.status(400).json({ message: `${field.name} is not a valid option` })
                        }
                        data[field.name] = data[field.name].toString()
                        break;
                    case "MULTISELECT":
                        data[field.name] = data[field.name].split(",")
                        break;
                }
            }
        }

        const row = await Data.findByIdAndUpdate(
            rowID,
            {
                $set: {
                    data,
                    updatedBy: req?.user?._id,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!row) {
            return res.status(404).json({ message: "Row not found" })
        }

        res.status(200).json({ row, message: "Row updated successfully" })
    })

    static deleteRow = asyncHandler(async (req, res): Promise<any> => {
        const rowID = req.params.rowID;
        if (!rowID) {
            return res.status(400).json({ message: "Row ID is required" })
        }
        await Data.findByIdAndDelete(rowID)
        res.status(200).json({ message: "Row deleted successfully" })
    })
}