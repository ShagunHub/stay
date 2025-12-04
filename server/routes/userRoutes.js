import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserData, storeUserSearchCity, syncUserToDB } from "../controllers/userController.js";
const userRouter=express.Router();

userRouter.get('/',protect,getUserData);
userRouter.post('/store-recent-search',protect,storeUserSearchCity);
userRouter.post('/sync',syncUserToDB);

export default userRouter;
