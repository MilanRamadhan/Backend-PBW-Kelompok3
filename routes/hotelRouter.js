import express from "express";
import { createHotel, getAllHotels, updateHotelById, deleteHotelById } from "../controllers/hotelController.js";

const hotelRouter = express.Router();
hotelRouter.post("/createHotel", createHotel);
hotelRouter.get("/getAllHotels", getAllHotels);
hotelRouter.post("/updateHotel/:hotelId", updateHotelById);
hotelRouter.delete("/deleteHotel/:hotelId", deleteHotelById);
export default hotelRouter;
