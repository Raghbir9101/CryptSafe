"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const dotenv_1 = __importDefault(require("dotenv"));
const errorCodes_1 = require("../utils/errorCodes");
const table_model_1 = __importDefault(require("../models/table.model"));
const data_model_1 = __importDefault(require("../models/data.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const encryption_1 = require("../utils/encryption");
const emailService_1 = require("../utils/emailService");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
// Set up multer storage for file uploads
const uploadDir = path_1.default.join(__dirname, "../../../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique UUID for the file
        const uniqueUUID = (0, uuid_1.v4)();
        // Get file extension from original filename
        const fileExtension = path_1.default.extname(file.originalname);
        // Create new filename with UUID
        const newFilename = `${uniqueUUID}${fileExtension}`;
        cb(null, newFilename);
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 50, // 50MB file size limit
        fieldSize: 1024 * 1024 * 10, // 10MB field size limit
        fieldNameSize: 100, // 100 bytes for field name
        fields: 100 // Maximum number of fields
    }
});
// Helper to get the base URL for file links
function getBaseUrl(req) {
    console.log(process.env.BACKEND_HOST || (req.protocol + '://' + req.get('host')), 'kaddu');
    return process.env.BACKEND_HOST || (req.protocol + '://' + req.get('host'));
}
class TableController {
    static getAllTableData = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        // console.log(encryptObjectValues(req?.user?.email, process.env.GOOGLE_API),'kaddu')
        const tables = await table_model_1.default.find({
            $or: [
                { createdBy: req?.user?._id },
                { "sharedWith.email": (0, encryption_1.encryptObjectValues)(req?.user?.email, process.env.GOOGLE_API) }
            ]
        }).populate('updatedBy', 'name');
        // console.log(tables,'tables')
        res.status(200).json(tables);
    });
    static getTableDataWithID = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const tables = await table_model_1.default.findOne({
            $or: [
                { createdBy: req?.user?._id, _id: req.params.id },
                { "sharedWith.email": (0, encryption_1.encryptObjectValues)(req?.user?.email, "dsfdadsf"), _id: req.params.id }
            ]
        }).populate('updatedBy', 'name');
        res.status(200).json(tables);
    });
    static createTable = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { name, fields, description } = req.body;
        // console.log(req.body, 'req.body');
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
    static shareTable = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = req.params.id;
        const { sharedWith } = req.body;
        const table = await table_model_1.default.findOne({ createdBy: req.user._id, _id: id });
        if (!table) {
            return res.status(errorCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: "Table not found" });
        }
        let decryptedEmail = (0, encryption_1.decryptObjectValues)(sharedWith.email, process.env.GOOGLE_API);
        // console.log(decryptedEmail)
        // Check if user exists, if not create one
        let user = await user_model_1.default.findOne({ email: decryptedEmail });
        // console.log(user)
        if (!user) {
            // Generate a random password
            const randomPassword = Math.random().toString(36).slice(-8);
            user = await user_model_1.default.create({
                email: decryptedEmail,
                password: randomPassword,
                isAdmin: false,
                name: decryptedEmail.split('@')[0], // Use email prefix as name
                passwordReset: false, // Flag to indicate password needs to be reset
                admin: req?.user?._id
            });
            (0, emailService_1.sendEmail)(req?.user?.emailCreds, {
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
        }
        else {
            // If found, update existing shared user
            table.sharedWith[existingIndex] = sharedWith;
        }
        await table.save();
        res.status(errorCodes_1.HttpStatusCodes.OK).json({ table, message: "Table sharing updated!" });
        // res.status(HttpStatusCodes.OK).json({ 
        //     table, 
        //     message: "Table sharing updated!",
        //     newUserCreated: !user.passwordReset ? false : {
        //         email: user.email,
        //         password: user.password
        //     }
        // });
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
        const { isOwner, isShared, data, error, sharedUserSettings } = await this.checkIsTableSharedWithUserAndAllowed(req, res, tableID);
        if (error) {
            return res.status(400).json({ message: error });
        }
        if (isOwner) {
            const page = +req.query.page || 1;
            const limit = +req.query.limit || 10;
            const skip = (page - 1) * limit;
            const [rows, total] = await Promise.all([
                data_model_1.default.find({ tableID }).skip(skip).limit(limit),
                data_model_1.default.countDocuments({ tableID })
            ]);
            return res.status(200).json({
                rows,
                total,
                page,
                limit
            });
        }
        if (isShared) {
            const shownFields = sharedUserSettings.fieldPermission.map(item => item.permission != "NONE").reduce((acc, item, index) => {
                if (item)
                    acc[`data.${(0, encryption_1.decryptObjectValues)(data.fields[index].name, process.env.GOOGLE_API)}`] = 1;
                return acc;
            }, {});
            const filterQuery = {};
            sharedUserSettings.fieldPermission.forEach((item, index) => {
                if (item.filter.length > 0) {
                    filterQuery[`data.${(0, encryption_1.decryptObjectValues)(data.fields[index].name, process.env.GOOGLE_API)}`] = { $in: item.filter };
                }
            });
            const userPageLimit = sharedUserSettings?.rowsPerPageLimit || 10;
            const page = +req.query.page || 1;
            const skip = (page - 1) * userPageLimit;
            const [rows, total] = await Promise.all([
                data_model_1.default.find({ tableID, ...filterQuery }, { ...shownFields, 'createdAt': 1 }).skip(skip).limit(userPageLimit),
                data_model_1.default.countDocuments({ tableID, ...filterQuery })
            ]);
            return res.status(200).json({
                rows,
                total,
                page,
                limit: userPageLimit
            });
        }
    });
    static insertRow = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const tableID = req.params.tableID || req.params.id;
        const { error } = await this.checkIsTableSharedWithUserAndAllowed(req, res, tableID);
        if (error) {
            return res.status(400).json({ message: error });
        }
        let data = req.body;
        // If data is sent as a string (from multipart/form-data), parse it
        if (typeof req.body.data === 'string') {
            try {
                data = JSON.parse(req.body.data);
            }
            catch (e) {
                return res.status(400).json({ message: "Invalid data format" });
            }
        }
        console.log(req.body, 'this is the body');
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
        console.log('Table fields:', table.fields);
        console.log('Request files:', req.files);
        console.log('Request body data:', data);
        // Decrypt field names and types for processing
        const decryptedFields = table.fields.map(field => ({
            ...field,
            name: (0, encryption_1.decryptObjectValues)(field.name, process.env.GOOGLE_API),
            type: (0, encryption_1.decryptObjectValues)(field.type, process.env.GOOGLE_API)
        }));
        console.log('Decrypted fields:', decryptedFields);
        // Handle file uploads for ATTACHMENT fields
        for (let field of decryptedFields) {
            console.log('Processing field:', field.name, 'Type:', field.type);
            if (field.type === "ATTACHMENT") {
                console.log('Found ATTACHMENT field:', field.name);
                const filesForField = req.files?.filter(f => f.fieldname === field.name);
                if (filesForField && filesForField.length > 0) {
                    console.log('Processing uploaded files for field:', field.name);
                    data[field.name] = filesForField.map((file) => {
                        // Extract UUID from filename (multer now generates UUID filenames)
                        const fileExtension = path_1.default.extname(file.filename);
                        const uuid = file.filename.replace(fileExtension, '');
                        const fileData = {
                            url: `${getBaseUrl(req)}/uploads/${file.filename}`,
                            uuid: uuid,
                            originalName: file.originalname,
                            filePath: file.path // Use file.path from multer for reliability
                        };
                        console.log('Created file data:', fileData);
                        return fileData;
                    });
                }
                else if (data[field.name]) {
                    console.log('Processing existing data for field:', field.name, 'Data:', data[field.name]);
                    // No new file, but value exists (string, array, or object)
                    if (Array.isArray(data[field.name])) {
                        data[field.name] = data[field.name].map((val) => {
                            if (typeof val === 'string' && val.startsWith('http')) {
                                return {
                                    url: val,
                                    uuid: path_1.default.basename(val),
                                    originalName: path_1.default.basename(val),
                                    filePath: path_1.default.join(uploadDir, path_1.default.basename(val))
                                };
                            }
                            if (typeof val === 'string') {
                                return {
                                    url: `${getBaseUrl(req)}/uploads/${val}`,
                                    uuid: val,
                                    originalName: val,
                                    filePath: path_1.default.join(uploadDir, val)
                                };
                            }
                            if (val && typeof val === 'object' && val.name) {
                                return {
                                    url: `${getBaseUrl(req)}/uploads/${val.name}`,
                                    uuid: val.name,
                                    originalName: val.name,
                                    filePath: path_1.default.join(uploadDir, val.name)
                                };
                            }
                            if (val && val.url) {
                                return {
                                    url: val.url,
                                    uuid: val.uuid || path_1.default.basename(val.url),
                                    originalName: val.originalName || path_1.default.basename(val.url),
                                    filePath: val.filePath || path_1.default.join(uploadDir, path_1.default.basename(val.url))
                                };
                            }
                            return null;
                        }).filter(item => item !== null);
                    }
                    else if (typeof data[field.name] === 'string') {
                        if (!data[field.name].startsWith('http')) {
                            data[field.name] = [{
                                    url: `${getBaseUrl(req)}/uploads/${data[field.name]}`,
                                    uuid: data[field.name],
                                    originalName: data[field.name],
                                    filePath: path_1.default.join(uploadDir, data[field.name])
                                }];
                        }
                        else {
                            data[field.name] = [{
                                    url: data[field.name],
                                    uuid: path_1.default.basename(data[field.name]),
                                    originalName: path_1.default.basename(data[field.name]),
                                    filePath: path_1.default.join(uploadDir, path_1.default.basename(data[field.name]))
                                }];
                        }
                    }
                    else if (data[field.name] && typeof data[field.name] === 'object' && data[field.name].name) {
                        data[field.name] = [{
                                url: `${getBaseUrl(req)}/uploads/${data[field.name].name}`,
                                uuid: data[field.name].name,
                                originalName: data[field.name].name,
                                filePath: path_1.default.join(uploadDir, data[field.name].name)
                            }];
                    }
                    else if (data[field.name] && data[field.name].url) {
                        data[field.name] = [{
                                url: data[field.name].url,
                                uuid: data[field.name].uuid || path_1.default.basename(data[field.name].url),
                                originalName: data[field.name].originalName || path_1.default.basename(data[field.name].url),
                                filePath: data[field.name].filePath || path_1.default.join(uploadDir, path_1.default.basename(data[field.name].url))
                            }];
                    }
                }
                else {
                    console.log('No files or data found for field:', field.name);
                }
            }
        }
        // Check unique constraints
        for (let field of decryptedFields) {
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
        for (let field of decryptedFields) {
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
                case "DATE-TIME":
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
                case "ATTACHMENT":
                    // Keep attachment data as is - don't process it
                    console.log('Keeping attachment data for field:', field.name, 'Data:', data[field.name]);
                    break;
            }
        }
        // Before saving, log the final data object
        console.log('Final data to save:', JSON.stringify(data, null, 2));
        console.log('Data keys:', Object.keys(data));
        for (let key in data) {
            console.log(`Field ${key}:`, typeof data[key], data[key]);
        }
        const row = await data_model_1.default.create({ data, createdBy: req?.user?._id, tableID });
        res.status(200).json({ row, message: "Row inserted successfully" });
    });
    static updateRow = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { error } = await this.checkIsTableSharedWithUserAndAllowed(req, res, req.params.id);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const { id: tableID, rowID } = req.params;
        console.log(req.body, 'this is data');
        const data = req.body;
        if (!tableID || !rowID) {
            return res.status(400).json({ message: "Table ID and Row ID are required" });
        }
        const table = await table_model_1.default.findById(tableID);
        if (!table) {
            return res.status(400).json({ message: "Table not found" });
        }
        console.log('UpdateRow - Table fields:', table.fields);
        console.log('UpdateRow - Request files:', req.files);
        console.log('UpdateRow - Request body data:', data);
        // Decrypt field names and types for processing
        const decryptedFields = table.fields.map(field => ({
            ...field,
            name: (0, encryption_1.decryptObjectValues)(field.name, process.env.GOOGLE_API),
            type: (0, encryption_1.decryptObjectValues)(field.type, process.env.GOOGLE_API)
        }));
        console.log('UpdateRow - Decrypted fields:', decryptedFields);
        // Handle file uploads for ATTACHMENT fields
        for (let field of decryptedFields) {
            console.log('UpdateRow - Processing field:', field.name, 'Type:', field.type);
            if (field.type === "ATTACHMENT") {
                console.log('UpdateRow - Found ATTACHMENT field:', field.name);
                const filesForField = req.files?.filter(f => f.fieldname === field.name);
                if (filesForField && filesForField.length > 0) {
                    console.log('UpdateRow - Processing uploaded files for field:', field.name);
                    data[field.name] = filesForField.map((file) => {
                        // Extract UUID from filename (multer now generates UUID filenames)
                        const fileExtension = path_1.default.extname(file.filename);
                        const uuid = file.filename.replace(fileExtension, '');
                        const fileData = {
                            url: `${getBaseUrl(req)}/uploads/${file.filename}`,
                            uuid: uuid,
                            originalName: file.originalname,
                            filePath: file.path // Use file.path from multer for reliability
                        };
                        console.log('UpdateRow - Created file data:', fileData);
                        return fileData;
                    });
                }
                else if (data[field.name]) {
                    console.log('UpdateRow - Processing existing data for field:', field.name, 'Data:', data[field.name]);
                    // No new file, but value exists (string, array, or object)
                    if (Array.isArray(data[field.name])) {
                        data[field.name] = data[field.name].map((val) => {
                            if (typeof val === 'string' && val.startsWith('http')) {
                                return {
                                    url: val,
                                    uuid: path_1.default.basename(val),
                                    originalName: path_1.default.basename(val),
                                    filePath: path_1.default.join(uploadDir, path_1.default.basename(val))
                                };
                            }
                            if (typeof val === 'string') {
                                return {
                                    url: `${getBaseUrl(req)}/uploads/${val}`,
                                    uuid: val,
                                    originalName: val,
                                    filePath: path_1.default.join(uploadDir, val)
                                };
                            }
                            if (val && typeof val === 'object' && val.name) {
                                return {
                                    url: `${getBaseUrl(req)}/uploads/${val.name}`,
                                    uuid: val.name,
                                    originalName: val.name,
                                    filePath: path_1.default.join(uploadDir, val.name)
                                };
                            }
                            if (val && val.url) {
                                return {
                                    url: val.url,
                                    uuid: val.uuid || path_1.default.basename(val.url),
                                    originalName: val.originalName || path_1.default.basename(val.url),
                                    filePath: val.filePath || path_1.default.join(uploadDir, path_1.default.basename(val.url))
                                };
                            }
                            return null;
                        }).filter(item => item !== null);
                    }
                    else if (typeof data[field.name] === 'string') {
                        if (!data[field.name].startsWith('http')) {
                            data[field.name] = [{
                                    url: `${getBaseUrl(req)}/uploads/${data[field.name]}`,
                                    uuid: data[field.name],
                                    originalName: data[field.name],
                                    filePath: path_1.default.join(uploadDir, data[field.name])
                                }];
                        }
                        else {
                            data[field.name] = [{
                                    url: data[field.name],
                                    uuid: path_1.default.basename(data[field.name]),
                                    originalName: path_1.default.basename(data[field.name]),
                                    filePath: path_1.default.join(uploadDir, path_1.default.basename(data[field.name]))
                                }];
                        }
                    }
                    else if (data[field.name] && typeof data[field.name] === 'object' && data[field.name].name) {
                        data[field.name] = [{
                                url: `${getBaseUrl(req)}/uploads/${data[field.name].name}`,
                                uuid: data[field.name].name,
                                originalName: data[field.name].name,
                                filePath: path_1.default.join(uploadDir, data[field.name].name)
                            }];
                    }
                    else if (data[field.name] && data[field.name].url) {
                        data[field.name] = [{
                                url: data[field.name].url,
                                uuid: data[field.name].uuid || path_1.default.basename(data[field.name].url),
                                originalName: data[field.name].originalName || path_1.default.basename(data[field.name].url),
                                filePath: data[field.name].filePath || path_1.default.join(uploadDir, path_1.default.basename(data[field.name].url))
                            }];
                    }
                }
                else {
                    console.log('UpdateRow - No files or data found for field:', field.name);
                }
            }
        }
        // Check unique constraints
        for (let field of decryptedFields) {
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
        for (let field of decryptedFields) {
            if (data[field.name] !== undefined) {
                switch (field.type) {
                    case "TEXT":
                        data[field.name] = data[field.name].toString();
                        break;
                    case "NUMBER":
                        data[field.name] = Number(data[field.name]);
                        break;
                    case "DATE":
                    case "DATE-TIME":
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
                    case "ATTACHMENT":
                        // Keep attachment data as is - don't process it
                        console.log('Keeping attachment data for field:', field.name, 'Data:', data[field.name]);
                        break;
                }
            }
        }
        // Before saving, log the final data object
        console.log('UpdateRow - Final data to save:', JSON.stringify(data, null, 2));
        console.log('UpdateRow - Data keys:', Object.keys(data));
        for (let key in data) {
            console.log(`UpdateRow - Field ${key}:`, typeof data[key], data[key]);
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
        const { error } = await this.checkIsTableSharedWithUserAndAllowed(req, res, req.params.id);
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
    static checkIsTableSharedWithUserAndAllowed = async (req, res, tableID) => {
        // const tableID = req.params.id ;
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
        const isShared = table.sharedWith.findIndex(item => {
            // console.log(item?.email, req.user.email)
            return item.email === (0, encryption_1.encryptObjectValues)(req.user.email, "sfadsf");
        });
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
