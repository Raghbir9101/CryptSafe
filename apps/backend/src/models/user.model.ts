import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';
import { UserInterface } from "@repo/types";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  isGoogleUser: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
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
  isGoogleUser: {
    type: Boolean,
    default: false
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

const User = mongoose.model<IUser>("user", userSchema);

export default User;
export type { UserInterface };
