import { Router } from "express";
import { addCourse } from "../controllers/course.controller.js";
import {authorizeRole, verifyToken} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/add-course").post(addCourse)

export default router ;