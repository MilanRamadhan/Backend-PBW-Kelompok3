import Pemesanan from "../models/Pemesanan.js";
import Hotel from "../models/Hotel.js";
import jwt from "jsonwebtoken";

export const buatPemesanan = async (req, res) => {
  try {
    const { namaPemesan, jumlahKamar, checkIn, checkOut, hotelId } = req.body;
    if (!namaPemesan || !jumlahKamar || !checkIn || !checkOut || !hotelId) {
      return res.status(400).json({
        status: 400,
        message: "Semua kolom wajib di isi",
      });
    }
    const hotels = await Hotel.find();
    if (hotels.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "data hotel tidak ditemukan atau belum ada",
      });
    }
    const pemesananBaru = new Pemesanan({
      namaPemesan,
      jumlahKamar,
      checkIn,
      checkOut,
      hotelId,
      userId,
    });
    await pemesananBaru.save();
    return res.status(201).json({
      status: 201,
      data: pemesananBaru,
      message: "Pemesanan berhasil",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan pada server",
    });
  }
};

export const getAllPemesanan = async (req, res) => {
  try {
    const pemesan = await Pemesanan.find();
    if (pemesan.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "data pemesan tidak di temukan atau belum ada",
      });
    }
    return res.status(200).json({
      status: 200,
      data: pemesan,
      message: "pemesan ditemukan",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "internal server error",
    });
  }
};

export const getRiwayatPemesananUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const riwayat = await Pemesanan.find({ userId }).populate("hotelId");

    res.status(200).json({
      status: 200,
      data: riwayat,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Gagal mengambil riwayat pemesanan",
    });
  }
};
