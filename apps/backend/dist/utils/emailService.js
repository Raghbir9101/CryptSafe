"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (credentials, options) => {
    try {
        console.log(options);
        if (!options.to || !options.subject || !options.text)
            return;
        // Create transporter with dynamic credentials
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: credentials.userName,
                pass: credentials.userPass
            }
        });
        // Send mail
        const info = await transporter.sendMail({
            from: credentials.userName,
            ...options
        });
        return info;
    }
    catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
exports.sendEmail = sendEmail;
