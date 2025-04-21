import express, { Router } from "express";
import { register, login, updateUser, updatePassword, getProfile } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.put("/updateUser/:userId", updateUser);
authRouter.post("/updatePassword/:userId", updatePassword);
authRouter.post("/profile/:userId", verifyToken, getProfile);
authRouter.get("/getProfile/:userId", getProfile);

export default authRouter;
