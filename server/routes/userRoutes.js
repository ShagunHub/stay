import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserData, storeUserSearchCity } from "../controllers/userController.js";
const userRouter=express.Router();

userRouter.get('/',protect,getUserData);
userRouter.post('/store-recent-search',protect,storeUserSearchCity);

export default userRouter;
