import { Schema, model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface IUser {
  username: string;
  password: string;
  role: "admin" | "user";
}

export interface IUserInstanceMethods {
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser,{}, IUserInstanceMethods>({
  username: String,
  password: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
}, { id: true });

userSchema.method("comparePassword", function (password) {
  return compare(password, this.password);
});

userSchema.pre("save", async function (done) {
  this.password = await hash(this.password, 10);
  done();
});



export const UserModel = model("user", userSchema, "users");
