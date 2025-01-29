import { Router } from "express";
import { registerUser,login , getUserInfo } from "../controllers/user.controller.js";
import {authorizeRoleAdmin, verifyToken} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/register").post(registerUser)

router.route("/login").post(login)

router.route("/profile").post(verifyToken , authorizeRoleAdmin(['User']) , getUserInfo)

export default router ;