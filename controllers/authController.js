import Auth from "../models/Auth.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

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

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, userName, email, callNumber, address, role } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: "UserId diperlukan tetapi tidak disediakan",
      });
    }

    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User tidak ditemukan",
      });
    }

    const updatedFields = {};
    if (fullName) updatedFields.fullName = fullName;
    if (userName) updatedFields.userName = userName;
    if (email) {
      const emailExist = await Auth.findOne({ email, _id: { $ne: userId } });
      if (emailExist) {
        return res.status(400).json({
          status: 400,
          message: "Email sudah digunakan oleh user lain",
        });
      }
      updatedFields.email = email;
    }
    if (callNumber) updatedFields.callNumber = callNumber;
    if (address) updatedFields.address = address;
    if (role !== undefined) updatedFields.role = role;

    const updatedUser = await Auth.findByIdAndUpdate(userId, updatedFields, { new: true }).select("-password -token");

    return res.status(200).json({
      status: 200,
      data: updatedUser,
      message: "User berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Semua kolom password harus diisi",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Password baru dan konfirmasi password tidak cocok",
      });
    }

    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User tidak ditemukan",
      });
    }

    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 400,
        message: "Password lama salah",
      });
    }

    const isUsedBefore = await Promise.all(
      user.passwordHistory.map(async (oldPassword) => {
        return await bcryptjs.compare(newPassword, oldPassword.password);
      })
    );

    if (isUsedBefore.includes(true)) {
      return res.status(400).json({
        status: 400,
        message: `Password tidak boleh sama dengan ${user.passwordHistoryLimit} password sebelumnya`,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    const newPasswordHistory = [{ password: user.password }, ...user.passwordHistory.slice(0, user.passwordHistoryLimit - 1)];

    user.password = hashedPassword;
    user.passwordHistory = newPasswordHistory;
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Password berhasil diupdate",
    });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await Auth.find();
    if (user.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }
    return res.status(200).json({
      status: 200,
      data: user,
      message: "user ditemukan",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "internal server error",
    });
  }
};
