import express from "express";
import { changePassword, getUser, googleLogin, loginUser, saveUser, sendOTP } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",saveUser)
userRouter.get("/",getUser)
userRouter.post("/login",loginUser)
userRouter.post("/google",googleLogin)
userRouter.post("/send-otp", sendOTP);
userRouter.post("/changePW", changePassword);





export default userRouter;
