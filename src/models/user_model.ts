import mongoose from "mongoose";


export interface IUser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
}

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  });
  
  const userModel = mongoose.model("Users", userSchema);
  
  export default userModel;
 