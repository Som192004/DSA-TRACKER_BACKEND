import { Router } from "express";
import {updateCourseProgress , getVideosList} from "../controllers/courseProgress.controller.js"
import {verifyToken , authorizeRole ,verifyTokenOfAdmin} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/update-courseprogress/:videoId").patch(verifyToken , authorizeRole(['User']) , updateCourseProgress)

export default router ;