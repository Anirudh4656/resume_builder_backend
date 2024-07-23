import mongoose, { Types, Schema } from "mongoose";
import { type BaseSchema } from "./index";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface IUser extends BaseSchema {
  user: string;
  id: string;
  username: string;
  email: string;
  password: string;
}
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
} 
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

UserSchema.pre("save", async function (next) {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
export const User = mongoose.model("User", UserSchema);
