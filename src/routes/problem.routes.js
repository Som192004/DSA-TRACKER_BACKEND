import { Router } from "express";
import { problemNumbersFromTopic } from "../controllers/problem.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/problem-numbers").get(verifyJWT ,problemNumbersFromTopic)

export default router ;