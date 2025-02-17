import { Router } from "express";
import { registerUser,login , getUserInfo , updateUserInfo} from "../controllers/user.controller.js";
import {authorizeRole, verifyToken} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/register").post(registerUser)

router.route("/login").post(login)

router.route("/profile").post(verifyToken , authorizeRole(['User']) , getUserInfo)

router.route("/update-profile").patch(verifyToken , authorizeRole(['User']) , updateUserInfo)

export default router ;