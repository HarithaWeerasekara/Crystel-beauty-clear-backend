import express from "express";
import verifyJWT from "../middleware/auth.js";
import { blockUser, changePassword, getAllUsers, getUser, googleLogin, loginUser, saveUser, sendOTP, unblockUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",saveUser)
userRouter.get("/",getUser)
userRouter.get("/all-users", verifyJWT, getAllUsers);
userRouter.post("/login",loginUser)
userRouter.post("/google",googleLogin)
userRouter.post("/send-otp", sendOTP);
userRouter.post("/changePW", changePassword);
userRouter.post("/block/:userId", verifyJWT, blockUser);
userRouter.post("/unblock/:userId", verifyJWT, unblockUser);






export default userRouter;
