import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import User from "../models/user.model";
import { UserInterface } from "@repo/types";
import crypto from "crypto";
import { sendEmail } from "../utils/nodemailer";

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user: UserInterface;
}

export default class AdminController {
  // Method to get all users created by this admin
  static getUsersByAdmin = asyncHandler(async (req: AuthRequest, res): Promise<void> => {
    // Check if the requesting user is an admin
    if (!req.user.isAdmin) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ message: "Access denied. Admin privileges required." });
      return;
    }

    try {
      // Find all users where admin field matches the requesting admin's ID
      const users = await User.find({ admin: req.user._id });
      res.status(HttpStatusCodes.OK).json(users);
    } catch (err) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  });

  // Method to create a new user with randomized password
  static createUser = asyncHandler(async (req: AuthRequest, res): Promise<void> => {
    // Check if the requesting user is an admin
    if (!req.user.isAdmin) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ message: "Access denied. Admin privileges required." });
      return;
    }

    try {
      const { email, name } = req.body;

      // Check if admin has email credentials
      if (!req.user.emailCreds?.userName || !req.user.emailCreds?.userPass) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ 
          message: "Admin email credentials not configured. Please set up email credentials first." 
        });
        return;
      }

      // Generate a random password
    //   const randomPassword = crypto.randomBytes(8).toString('hex');
      const randomPassword = "1234"

      // Create new user
      const newUser = await User.create({
        email,
        name,
        password: randomPassword,
        admin: req.user._id, // Set the admin reference
        passwordReset: true // Flag to indicate user needs to reset password
      });

      // Send email to the new user
      try {
        await sendEmail(
          {
            userName: req.user.emailCreds.userName,
            userPass: req.user.emailCreds.userPass
          },
          {
            to: email,
            subject: "Welcome - Your Account Details",
            text: `Hello ${name},\n\nYour account has been created by an administrator.\n\nYour temporary password is: ${randomPassword}\n\nPlease login and change your password immediately.`,
            html: `
              <h2>Welcome!</h2>
              <p>Hello ${name},</p>
              <p>Your account has been created by an administrator.</p>
              <p><strong>Your temporary password is:</strong> ${randomPassword}</p>
              <p>Please login and change your password immediately.</p>
              <br>
              <p>Best regards</p>
            `
          }
        );
      } catch (emailError) {
        // Log the email error but don't fail the user creation
        console.error("Failed to send welcome email:", emailError);
      }

      // Remove password from response
      const userResponse = newUser.toObject();
      delete userResponse.password;

      res.status(HttpStatusCodes.CREATED).json({
        user: userResponse,
        temporaryPassword: randomPassword // Send the temporary password in response
      });
    } catch (err) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  });
}
