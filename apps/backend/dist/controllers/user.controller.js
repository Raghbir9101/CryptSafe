"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("../utils/asyncHandler");
const errorCodes_1 = require("../utils/errorCodes");
const user_model_1 = __importDefault(require("../models/user.model"));
class UserController {
    // Method to get user data with jwt token
    static getUserDataWithToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        res.status(errorCodes_1.HttpStatusCodes.OK).send(req.user);
    });
    // Method to delete user
    static deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            await user_model_1.default.findByIdAndDelete(req.params.id);
            res.status(errorCodes_1.HttpStatusCodes.OK).send({ message: "User Deleted Successfully" });
        }
        catch (err) {
            res.status(errorCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
        }
    });
}
exports.default = UserController;
