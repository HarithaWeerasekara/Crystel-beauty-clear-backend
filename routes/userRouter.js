import express from "express";
import { getUser, googleLogin, loginUser, saveUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",saveUser)
userRouter.get("/",getUser)
userRouter.post("/login",loginUser)
userRouter.post("/google",googleLogin)



export default userRouter;
