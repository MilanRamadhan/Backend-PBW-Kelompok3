import express from "express";
import { buatPemesanan } from "../controllers/pemesananController.js";

const pemesananRouter = express.Router();
pemesananRouter.post("/buatPemesanan", buatPemesanan);
export default pemesananRouter;
