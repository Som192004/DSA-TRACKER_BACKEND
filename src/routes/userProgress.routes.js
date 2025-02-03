import { Router } from "express";
import {updateUserProgress , getProblemsList} from "../controllers/userProgress.controller.js"
import {verifyToken , authorizeRole ,verifyTokenOfAdmin} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/update-userprogress/:problemId").patch(verifyToken , authorizeRole(['User']) , updateUserProgress)

export default router ;