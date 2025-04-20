import mongoose from "mongoose";

const Pemesanan = new mongoose.Schema(
  {
    namaPemesan: {
      type: String,
      reqired: true,
      unique: true,
    },
    jumlahKamar: {
      type: Number,
      required: true,
    },
    checkIn: {
      type: Number,
      required: true,
    },
    checkOut: {
      type: Number,
      required: true,
    },
    hotelId: {
      type: String,
      ref: "Hotel",
      required: true,
    },
    userId: {
      type: String,
      ref: "Auth",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Pemesanan", Pemesanan);
