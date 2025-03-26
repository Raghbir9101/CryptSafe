import User, { UserInterface } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Table from "../models/table.model";
import Data from "../models/data.model";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export default class TableController {

    static getAllTableData = asyncHandler(async (req, res): Promise<void> => {
        const tables = await Table.find({ createdBy: req?.user?._id })
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

    static deleteTable = asyncHandler(async (req, res): Promise<any> => {
        const { name, fields, description } = req.body
        if (!name || !fields || !description) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const table = await Table.create(req.body)
        res.status(200).json(table)
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

        for (let field of table?.fields) {
            if (field.type == "TEXT" || field.type == "NUMBER" || field.type == "DATE" || field.type == "BOOLEAN") {
                if (data[field.name] == undefined) {
                    return res.status(400).json({ message: `${field.name} is required` })
                }
            }
            else if (field.type == "SELECT") {
                if (!field.options.includes(data[field.name])) {
                    return res.status(400).json({ message: `${field.name} is not a valid option` })
                }
            }

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
                    data[field.name] = data[field.name].toString()
                    break;
                case "MULTISELECT":
                    data[field.name] = data[field.name].split(",")
                    break;
            }
        }


        const row = await Data.create({ data, createdBy: req?.user?._id, tableID })
        res.status(200).json({ row, message: "Row inserted successfully" })
    })
    static updateRow = asyncHandler(async (req, res): Promise<any> => {
        const tableID = req.params.tableID;
        const rowID = req.params.rowID;
        let data = req.body;
        if (!tableID || !rowID) {
            return res.status(400).json({ message: "Table ID and Row ID are required" })
        }
        if (Object.keys(data).length == 0) {
            return res.status(400).json({ message: "Data is required" })
        }

        const table = await Table.findById(tableID);
        const row = await Data.findById(rowID);

        if (!row) {
            return res.status(400).json({ message: "Row not found" })
        }

        if (!table) {
            return res.status(400).json({ message: "Table not found" })
        }

        data = { ...row?.data, ...data }

        if (!table) {
            return res.status(400).json({ message: "Table not found" })
        }

        for (let field of table?.fields) {
            if (field.type == "TEXT" || field.type == "NUMBER" || field.type == "DATE" || field.type == "BOOLEAN") {
                if (data[field.name] == undefined) {
                    return res.status(400).json({ message: `${field.name} is required` })
                }
            }
            if (field.type == "SELECT") {
                if (!field.options.includes(data[field.name])) {
                    return res.status(400).json({ message: `${field.name} is not a valid option` })
                }
            }
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
                    data[field.name] = data[field.name].toString()
                    break;
                case "MULTISELECT":
                    data[field.name] = data[field.name].split(",")
                    break;
            }
        }

        row.data = data;
        await row.save();
        // const row = await Data.findOneAndUpdate({ tableID, createdBy: req?.user?._id, _id: rowID }, { data }, { new: true })
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