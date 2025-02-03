import { Router } from "express";
import { addTopic } from "../controllers/topic.controller.js";
import {authorizeRole, verifyToken} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/add-topic").post(addTopic)

export default router ;