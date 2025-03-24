import User, { UserInterface } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Table from "../models/table.model";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export default class TableController {
    static getAllTableData = asyncHandler(async (req, res): Promise<void> => {
        const tables = await Table.find({ createdBy: req?.user?._id })
        res.status(200).json(tables)
    })
    static createTable = asyncHandler(async (req, res): Promise<any> => {
        const { name, fields, description } = req.body
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

}