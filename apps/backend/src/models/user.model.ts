import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';
import { UserInterface } from "@repo/types";
import { conn1, conn2 } from "../config/database";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  isGoogleUser: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAdmin:boolean;
  admin:string;
  passwordReset:boolean;
  emailCreds:{
    userName:string;
    userPass:string;
  };
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  passwordReset:{type:Boolean, default:false},
  isAdmin:{type:Boolean},
  admin:{type:Schema.Types.ObjectId, ref:"users", default: null},
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  emailCreds:{
    userName:{type:String},
    userPass:{type:String}
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isGoogleUser) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (this.isGoogleUser) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const User = conn1.model<IUser>("user", userSchema);
const UserBackup = conn2.model<IUser>("user", userSchema);

export default User;
export { UserBackup, UserInterface };
