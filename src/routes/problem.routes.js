import { Router } from "express";
import { problemNumbersFromTopic , getProblemsList , addProblem ,deleteProblem , getSolvedProblemsCountByTopic , getProblemListForAdmin , editProblem} from "../controllers/problem.controller.js";
import {verifyToken , authorizeRole ,verifyTokenOfAdmin} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/problem-numbers").post(verifyToken , problemNumbersFromTopic)
router.route("/get-problems-list/:topicName").post(verifyToken , getProblemsList)
router.route("/add-problem").post(verifyTokenOfAdmin , authorizeRole(['Admin']), addProblem)
router.route("/edit-problem/:editingProblemId").patch(verifyTokenOfAdmin , authorizeRole(["Admin"]) , editProblem)
router.route("/delete-problem/:problemId").delete(verifyTokenOfAdmin , authorizeRole(['Admin']) ,deleteProblem)
router.route("/admin/get-all-problems").post(verifyTokenOfAdmin , authorizeRole(['Admin']) , getProblemListForAdmin)

export default router ;