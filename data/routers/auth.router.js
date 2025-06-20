import { Router } from "express";
const authRouter = Router();
import {
  getUsers,
  login,
  logout,
  register,
  updateUserInfo,
} from "../controllers/auth.controller.js";
import {
  verifyAdminAuthority,
  verifyToken,
} from "../middlewares/auth.middleware.js";

authRouter.post("/register", verifyToken, verifyAdminAuthority, register);
authRouter.post("/login", login);
authRouter.post("/logout", verifyToken, logout);
authRouter.post("/getUsers", verifyToken, verifyAdminAuthority, getUsers);
authRouter.post(
  "/updateUserInfo",
  verifyToken,
  verifyAdminAuthority,
  updateUserInfo
);

export default authRouter;
