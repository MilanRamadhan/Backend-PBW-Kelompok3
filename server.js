import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { configDotenv } from "dotenv";
import authRouter from "./routes/authRouter.js";
import hotelRouter from "./routes/hotelRouter.js";
import pemesananRouter from "./routes/pemesananRouter.js";

const app = express();
const port = 3001;
configDotenv(); // Load environment variables from .env file

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500", // Ini adalah origin default Live Server VS Code
      "http://localhost:5500", // Ini juga umum digunakan Live Server
      // Tambahkan origin deployment frontend Anda di sini jika sudah ada, contoh:
      // 'https://nama-frontend-anda.vercel.app'
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Pastikan semua metode yang relevan diizinkan
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Tambahkan header yang mungkin Anda gunakan
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/hotel", hotelRouter);
app.use("/pemesanan", pemesananRouter);

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Koneksi ke MongoDB gagal:", error);
    process.exit(1); // Keluar dari proses jika koneksi gagal
  }
}

app.get("/", async (req, res) => {
  return res.status(200).json({
    status: 200,
    message: "hello",
  });
});

app.use("/auth", authRouter);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(console.dir);
