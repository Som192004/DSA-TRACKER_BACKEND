import { Router } from "express";
import { registerUser,login , getUserInfo } from "../controllers/user.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/register").post(registerUser)

router.route("/login").post(login)

router.route("/profile").post(verifyToken ,getUserInfo)

export default router ;