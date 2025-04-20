import mongoose from "mongoose";

const Auth = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    callNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: Boolean,
      required: true,
    },
    token: {
      type: String,
      default: null,
    },
    passwordHistory: [
      {
        password: String,
        changeAt: { type: Data, default: Date.now },
      },
    ],
    passwordHistoryLimit: { type: Number, default: 3 },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Auth", Auth);
