import { verifyToken } from "../middleware/auth.js";
import Hotel from "../models/Hotel.js";

export const createHotel = async (req, res) => {
  try {
    const { hotelName, address, rating, totalRoom, price } = req.body;
    if (!hotelName || !address || !totalRoom || !price) {
      return res.status(400).json({
        status: 400,
        message: "semua kolom harus di isi",
      });
    }
    const existingHotel = await Hotel.findOne({ hotelName: hotelName });
    if (existingHotel) {
      return res.status(409).json({
        status: 409,
        message: "Hotel dengan nama ini sudah terdaftar",
      });
    }
    const newHotel = new Hotel({
      hotelName,
      address,
      rating: rating ?? 0,
      totalRoom,
      price,
    });
    await newHotel.save();
    return res.status(201).json({
      status: 201,
      data: newHotel,
      message: "hotel berhasil di buat",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "internal server error",
    });
  }
};

export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    if (hotels.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "data hotel tidak ditemukan atau belum ada",
      });
    }
    return res.status(200).json({
      status: 200,
      data: hotels,
      message: "hotel ditemukan",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "internal server error",
    });
  }
};

export const updateHotelById = [
  verifyToken,
  async (req, res) => {
    try {
      const { hotelId } = req.params;
      const { hotelName, address, rating, totalRoom, price } = req.body;

      if (!hotelId) {
        return res.status(400).json({
          status: 400,
          message: "HotelId diperlukan tetapi tidak disediakan",
        });
      }

      const existingHotel = await Hotel.findById(hotelId);
      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Hotel tidak ditemukan",
        });
      }

      const updatedHotel = await Hotel.findByIdAndUpdate(
        hotelId,
        {
          hotelName: hotelName ?? existingHotel.hotelName,
          address: address ?? existingHotel.address,
          rating: rating ?? existingHotel.rating,
          totalRoom: totalRoom ?? existingHotel.totalRoom,
          price: price ?? existingHotel.price,
        },
        { new: true }
      );
      await updatedHotel.save();
      return res.status(201).json({
        status: 201,
        data: updatedHotel,
        message: "Hotel berhasil diperbarui",
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  },
];

export const deleteHotelById = async (req, res) => {
  try {
    const { hotelId } = req.params;
    if (!hotelId) {
      return res.status(400).json({
        status: 400,
        message: "hotelid diperlukan tetapi tidak di sediakan",
      });
    }
    const deletedHotel = await Hotel.findByIdAndDelete(hotelId);
    if (!deletedHotel) {
      return res.status(404).json({
        status: 404,
        message: "hotel tidak ditemukan",
      });
    }
    return res.status(200).json({
      status: 200,
      data: deletedHotel,
      message: "hotel berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "internal server error",
    });
  }
};
