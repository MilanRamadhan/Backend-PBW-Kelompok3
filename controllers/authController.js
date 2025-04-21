import Auth from "../models/Auth.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth.js";

export const register = async (req, res) => {
  try {
    const { fullName, userName, email, password, callNumber, address, role } = req.body;
    if (!fullName || !userName || !email || !password || !callNumber || !address || role === undefined) {
      return res.status(400).json({
        status: 400,
        message: "semua kolom harus di isi",
      });
    }
    const alreadyRegister = await Auth.findOne({ email: email });
    if (alreadyRegister) {
      return res.status(400).json({
        status: 400,
        message: "akun dengan email ini sudah terdaftar, silahkan gunakan email lain",
      });
    }
    const newUser = new Auth({
      fullName,
      userName,
      email,
      callNumber,
      address,
      role,
    });
    bcryptjs.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json(err);
      }

      newUser.set("password", hash);
      await newUser.save(); // Tunggu sampai user disimpan ke DB

      return res.status(200).json({ data: newUser, message: "Pengguna berhasil terdaftar." });
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res.status(400).json({
        status: 400,
        message: "Silakan isi semua kolom yang diperlukan.",
      });
    } else {
      const user = await Auth.findOne({ userName });
      if (!user) {
        return res.status(400).json({ status: 400, message: "Email atau kata sandi salah." });
      } else {
        const validateUser = await bcryptjs.compare(password, user.password);
        if (!validateUser) {
          res.status(400).json({ status: 400, message: "Email atau kata sandi salah." });
        } else {
          const payload = {
            userId: user._id,
            email: user.email,
          };
          const JWT_SECRET = process.env.JWT_SECRET;

          jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" }, async (err, token) => {
            if (err) {
              return res.status(500).json(err);
            }
            user.set("token", token);
            await user.save();

            return res.status(200).json({
              status: 200,
              data: user,
              token: user.token,
            });
          });
        }
      }
    }
  } catch (error) {
    console.log("Error during login:", error);
    res.status(500).json({
      status: 500,
      message: "Kesalahan server internal",
    });
  }
};

export const updateUser = [
  verifyToken,
  async (req, res) => {
    try {
      const { fullName, userName, email, callNumber, address, status, role } = req.body;

      const { userId } = req.params;

      if (!firstName || !email) {
        return res.status(400).json({
          status: 400,
          message: "kolom first name ataupun kolom email tidak boleh kosong",
        });
      }

      const editedUser = await Auth.findById(!userId ? req.user.userId : userId);

      if (!editedUser) {
        return res.status(404).json({
          status: 404,
          message: "user tidak ditemukan",
        });
      }

      editedUser.fullName = fullName;
      editedUser.userName = userName ?? editedUser.userName;
      editedUser.email = email;
      editedUser.callNumber = callNumber ?? editedUser.callNumber;
      editedUser.address = address ?? editedUser.address;

      if (status !== undefined) {
        editedUser.set("status", status);
      }

      if (role !== undefined) {
        editedUser.set("role", role);
      }

      await editedUser.save();

      return res.status(200).json({
        status: 200,
        data: editedUser,
        message: "profil berhasil diedit",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  },
];

export const updatePassword = [
  verifyToken,
  async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmNewPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        res.status(400).json({
          status: 400,
          message: "semua kolom harus diisi",
        });
      }

      const user = await Auth.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User tidak ditemukan",
        });
      }

      const validateUser = await bcryptjs.compare(currentPassword, user.password);
      if (!validateUser) {
        return res.status(400).json({
          status: 400,
          message: "password anda salah",
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          status: 400,
          message: "password baru anda tidak sama dengan kolom konfirmasi password",
        });
      }

      bcryptjs.hash(newPassword, 10, async (err, hash) => {
        if (err) {
          return res.status(500).json(err);
        }

        user.set("password", hash);
        await user.save(); // Tunggu sampai user disimpan ke DB

        return res.status(201).json({
          status: 201,
          data: user,
          message: "password berhasil diubah.",
        });
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  },
];

export const changeProfilePhoto = [
  verifyToken,
  async (req, res) => {
    try {
      const { profilePhoto } = req.body;
      if (!profilePhoto) {
        res.status(400).json({
          status: 400,
          message: "Foto gagal diganti atau format foto tidak didukung",
        });
      }

      const user = await Auth.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User tidak ditemukan",
        });
      }

      user.set("profilePhoto", profilePhoto);

      await user.save();

      return res.status(200).json({
        status: 200,
        data: user,
        message: "Foto profil berhasil di ubah",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        error,
      });
    }
  },
];

export const getAllUsers = [
  verifyToken,
  async (req, res) => {
    try {
      const users = await Auth.find();

      if (users.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Belum Ada data user",
        });
      }

      return res.status(200).json({
        status: 200,
        data: users,
        message: "Data user ditemukan",
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  },
];

export const deleteUserById = [
  verifyToken,
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          status: 400,
          message: "User ID diperlukan, tetapi tidak disediakan",
        });
      }

      const deletedUser = await Auth.findByIdAndDelete(userId);

      return res.status(200).json({
        status: 200,
        data: deletedUser,
        message: "User berhasil dihapus",
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  },
];

export const logout = [
  verifyToken,
  async (req, res) => {
    try {
      const { userId } = req.user; // Assuming userId is sent from the client during logout

      if (!userId) {
        return res.status(400).json({
          status: 400,
          message: "ID Pengguna diperlukan untuk keluar.",
        });
      }

      const user = await Auth.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 404, message: "Pengguna tidak ditemukan." });
      }

      // Remove or set token to null
      user.set("token", null);
      await user.save();

      return res.status(200).json({ status: 200, message: "Pengguna berhasil keluar." });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Terjadi kesalahan saat keluar." });
    }
  },
];

export const getProfile = [
  verifyToken,
  async (req, res) => {
    try {
      const user = await Auth.findById(req.user.userId);

      if (!user) {
        return res.status(400).json({
          status: 404,
          message: "User tidak ditemukan",
        });
      }

      return res.status(200).json({
        status: 200,
        data: user,
        message: "User ditemukan",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  },
];
