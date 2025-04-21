import express, { Router } from "express";
import { register, login, updateUser, updatePassword, getProfile, changeProfilePhoto, deleteUserById, getAllUsers, logout } from "../controllers/authController.js";

const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.put("/updateUser/:userId", updateUser);
authRouter.post("/updatePassword/:userId", updatePassword);
authRouter.get("/getProfile/:userId", getProfile);
authRouter.get("/getAllUsers", getAllUsers);
authRouter.put("/changeProfilePhoto", changeProfilePhoto);
authRouter.delete("/deleteUserById/:userId", deleteUserById);

export default authRouter;
