import { Router } from "express";
import { registerAdmin , login } from "../controllers/admin.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/register").post(registerAdmin)
router.route("/login").post(login)

export default router ;