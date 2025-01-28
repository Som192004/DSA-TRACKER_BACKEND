import { Router } from "express";
import { problemNumbersFromTopic , getProblemsList , addProblem ,deleteProblem , getSolvedProblemsCountByTopic } from "../controllers/problem.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/problem-numbers").post(verifyToken , problemNumbersFromTopic)
router.route("/get-problems-list").post(verifyToken , getProblemsList)
router.route("add-problem").post(verifyToken , addProblem)
router.route("/delete-problem/:problemId").delete(verifyToken , deleteProblem)

export default router ;