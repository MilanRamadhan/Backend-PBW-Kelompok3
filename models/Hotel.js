import mongoose from "mongoose";

const Hotel = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalRoom: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Hotel", Hotel);
