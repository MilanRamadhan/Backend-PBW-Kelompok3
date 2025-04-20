import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Akses ditolak, Token tidak tersedia",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user yang terverifikasi
    next();
  } catch (error) {
    res.status(403).json({
      status: 403,
      message: "token tidak valid",
    });
  }
};
