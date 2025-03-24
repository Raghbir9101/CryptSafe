import mongoose, { Schema, Document } from "mongoose";
import { UserInterface } from "@repo/types";


const userSchema: Schema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model<UserInterface & Document>("user", userSchema);

export default User;
export type { UserInterface };
