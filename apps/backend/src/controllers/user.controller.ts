import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import User, { UserBackup } from "../models/user.model";


export default class UserController {

  // Method to get user data with jwt token
  static getUserDataWithToken = asyncHandler(async (req, res): Promise<void> => {
    res.status(HttpStatusCodes.OK).send(req.user);
  })

  // Method to delete user
  static deleteUser = asyncHandler(async (req, res): Promise<void> => {
    try {
      // Delete from both primary and backup databases
      await Promise.all([
        User.findByIdAndDelete(req.params.id)
      ]);
      res.status(HttpStatusCodes.OK).send({ message: "User Deleted Successfully" });
    }
    catch (err) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err)
    }
  })

}
