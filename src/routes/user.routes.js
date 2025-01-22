import { Router } from "express";
import { registerUser,login,logoutUser , refreshAccessToken , getUserInfo } from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/register").post(registerUser)

router.route("/login").post(login)


router.route("/logout").post(verifyJWT , logoutUser)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/profile").get(verifyJWT ,getUserInfo)

export default router ;