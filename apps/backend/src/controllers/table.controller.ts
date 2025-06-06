import { asyncHandler } from "../utils/asyncHandler";
import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Table from "../models/table.model";
import Data from "../models/data.model";
import { TableInterface } from "@repo/types";
import User from "../models/user.model";
import { decryptObjectValues } from "../utils/encryption";
import { sendEmail } from "../utils/emailService";
dotenv.config();

export default class TableController {

    static getAllTableData = asyncHandler(async (req, res): Promise<void> => {
        const tables = await Table.find({
            $or: [
                { createdBy: req?.user?._id },
                { "sharedWith.email": req?.user?.email }
            ]
        }).populate('updatedBy', 'name')
        res.status(200).json(tables)
    })

    static getTableDataWithID = asyncHandler(async (req, res): Promise<void> => {
        const tables = await Table.findOne({
            $or: [
                { createdBy: req?.user?._id, _id: req.params.id },
                { "sharedWith.email": req?.user?.email, _id: req.params.id }
            ]
        }).populate('updatedBy', 'name')
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

    // static shareTable = asyncHandler(async (req, res): Promise<any> => {
    //     const id = req.params.id;
    //     const { sharedWith }: { sharedWith: TableInterface["sharedWith"][0] } = req.body

    //     const table = await Table.findOne({ createdBy: req.user._id, _id: id });

    //     const isTableAleadyShared = table.sharedWith.findIndex(item => item.email == sharedWith.email);

    //     if (isTableAleadyShared == -1) {
    //         table.sharedWith.push(sharedWith)
    //     }
    //     else {
    //         console.log(sharedWith)
    //         table.sharedWith = table.sharedWith.map(item => {
    //             if (item.email === sharedWith.email) return sharedWith;
    //             return item;
    //         })
    //     }

    //     await table.save()

    //     res.status(HttpStatusCodes.OK).json({ table, message: "Table created updated !" })
    // })
    static shareTable = asyncHandler(async (req, res): Promise<any> => {
        const id = req.params.id;
        const { sharedWith }: { sharedWith: TableInterface["sharedWith"][0] } = req.body

        const table = await Table.findOne({ createdBy: req.user._id, _id: id });

        if (!table) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({ message: "Table not found" });
        }

        let decryptedEmail = decryptObjectValues(sharedWith.email,process.env.GOOGLE_API)
        console.log(decryptedEmail)
        // Check if user exists, if not create one
        let user = await User.findOne({ email: decryptedEmail });
        console.log(user)
        if (!user) {
            // Generate a random password
            const randomPassword = Math.random().toString(36).slice(-8);
            user = await User.create({
                email: decryptedEmail,
                password: randomPassword,
                isAdmin:false,
                name: decryptedEmail.split('@')[0], // Use email prefix as name
                passwordReset: false, // Flag to indicate password needs to be reset
                admin:req?.user?._id
            });
            sendEmail(req?.user?.emailCreds, {
                to: decryptedEmail,
                subject: 'Welcome - Your Account Details',
                text: `Welcome!\n\nYour account has been created with the following credentials:\nEmail: ${decryptedEmail}\nPassword: ${randomPassword}\n\nPlease login and change your password immediately for security reasons.\n\nBest regards!`,
                html: `
                    <h2>Welcome!</h2>
                    <p>Your account has been created with the following credentials:</p>
                    <p><strong>Email:</strong> ${decryptedEmail}</p>
                    <p><strong>Password:</strong> ${randomPassword}</p>
                    <p><strong>Important:</strong> Please login and change your password immediately for security reasons.</p>
                    <br>
                    <p>Best regards!</p>
                `
            });
        }


        // Find existing shared user by _id
        const existingIndex = table.sharedWith.findIndex(item => item._id?.toString() === sharedWith._id?.toString());

        if (existingIndex === -1) {
            // If not found, add new shared user
            table.sharedWith.push(sharedWith);
        } else {
            // If found, update existing shared user
            table.sharedWith[existingIndex] = sharedWith;
        }

        await table.save();

        res.status(HttpStatusCodes.OK).json({ table, message: "Table sharing updated!" });
        // res.status(HttpStatusCodes.OK).json({ 
        //     table, 
        //     message: "Table sharing updated!",
        //     newUserCreated: !user.passwordReset ? false : {
        //         email: user.email,
        //         password: user.password
        //     }
        // });
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
        const { isOwner, isShared, data, error, sharedUserSettings } = await this.checkIsTableSharedWithUserAndAllowed(req, res,tableID);

        if (error) {
            return res.status(400).json({ message: error })
        }

        if (isOwner) {
            const page = +req.query.page || 1;
            const skip = (page - 1) * (+req.query.limit || 10);
            const rows = await Data.find({ tableID }).skip(skip).limit(10)
            return res.status(200).json(rows)
        }


        if (isShared) {
            const shownFields = sharedUserSettings.fieldPermission.map(item => item.permission != "NONE").reduce((acc, item, index) => {
                if (item) acc[`data.${data.fields[index].name}`] = 1;
                return acc;
            }, {})

            const filterQuery = {};
            sharedUserSettings.fieldPermission.forEach((item, index) => {
                if (item.filter.length > 0) {
                    filterQuery[`data.${data.fields[index].name}`] = { $in: item.filter }
                }
            })

            const userPageLimit = sharedUserSettings?.rowsPerPageLimit || 10;
            const page = +req.query.page || 1;
            const skip = (page - 1) * userPageLimit;

            const rows = await Data.find({ tableID, ...filterQuery }, shownFields).skip(skip).limit(userPageLimit)
            res.status(200).json(rows)
        }

    })

    static insertRow = asyncHandler(async (req, res): Promise<any> => {
        const tableID = req.params.tableID || req.params.id;
        console.log(tableID,'tavle')
        const { error } = await this.checkIsTableSharedWithUserAndAllowed(req, res,tableID);
        if (error) {
            return res.status(400).json({ message: error })
        }
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
        const { error } = await this.checkIsTableSharedWithUserAndAllowed(req, res,req.params.id);
        if (error) {
            return res.status(400).json({ message: error })
        }
        const { id:tableID, rowID } = req.params;
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

        await Table.findByIdAndUpdate(tableID, { updatedBy: req?.user?._id }, { new: true })


        if (!row) {
            return res.status(404).json({ message: "Row not found" })
        }

        res.status(200).json({ row, message: "Row updated successfully" })
    })

    static deleteRow = asyncHandler(async (req, res): Promise<any> => {
        const { error } = await this.checkIsTableSharedWithUserAndAllowed(req, res,req.params.id);
        if (error) {
            return res.status(400).json({ message: error })
        }
        const rowID = req.params.rowID;
        if (!rowID) {
            return res.status(400).json({ message: "Row ID is required" })
        }
        await Data.findByIdAndDelete(rowID)
        res.status(200).json({ message: "Row deleted successfully" })
    })

    static checkIsTableSharedWithUserAndAllowed = async (req, res,tableID) => {
        // const tableID = req.params.id ;
        const userID = req.user._id;

        if (!tableID) {
            return {
                isOwner: false,
                isShared: false,
                data: null,
                error: "Table ID is required",
                sharedUserSettings: null
            }
        }

        const table = await Table.findOne({ _id: tableID });

        if (userID.toString() == table.createdBy.toString()) {
            return {
                isOwner: true,
                isShared: false,
                data: null,
                error: null,
                sharedUserSettings: null
            }
        }

        const isShared = table.sharedWith.findIndex(item => item.email == req.user.email);

        if (isShared == -1) {
            return {
                isOwner: false,
                isShared: false,
                data: null,
                error: "Table not shared with you",
                sharedUserSettings: null
            }
        }

        const userSettings = table.sharedWith[isShared];

        if (userSettings.isBlocked) {
            return {
                isOwner: false,
                isShared: true,
                sharedUserSettings: userSettings,
                error: "You are blocked by the admin. Please contact your admin.",
                data: table
            }
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
                }
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
                }
            }
        }

        return {
            isOwner: false,
            isShared: true,
            sharedUserSettings: userSettings,
            error: null,
            data: table
        }

    }

    static isUserIPAllowed(networkAccess, ip) {
        const networkAccessObj = networkAccess.find(item => ip == item.IP_ADDRESS);
        if (!networkAccessObj) return false;
        if (networkAccessObj.enabled) return true;
        return false
    }

    static getAbbreviatedDayName(date) {
        const options = { weekday: 'short' };
        return date.toLocaleString('en-US', options).toUpperCase();
    }

    static isWorkingTimeWithinAccessTime(workingTimeAccess) {
        const currentTime = new Date();

        const localeTime = currentTime.toLocaleTimeString("en-IN", { hour12: false, timeZone: 'Asia/Kolkata' }).split(":").map(Number);;
        const currentHour = localeTime[0]
        const currentMinute = localeTime[1]
        const currentDay = this.getAbbreviatedDayName(currentTime);

        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const currentDayAccess = workingTimeAccess.find(dayAccess => dayAccess.day === currentDay);
        if (!currentDayAccess) return false;
        if (!currentDayAccess.accessTime.length) return false;
        if (!currentDayAccess.enabled) return false;

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