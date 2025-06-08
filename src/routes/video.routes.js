import { Router } from "express";
import { videoNumbersFromCourse , getVideosList , addVideo ,deleteVideo , getWatchedVideoCountByCourse , getVideoListForAdmin , editVideo} from "../controllers/video.controller.js";
import {verifyToken , authorizeRole ,verifyTokenOfAdmin} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/video-numbers").post(verifyToken , videoNumbersFromCourse)
router.route("/get-videos-list/:courseName").post(verifyToken , getVideosList)
router.route("/add-video").post(verifyTokenOfAdmin , authorizeRole(['Admin']), addVideo)
router.route("/edit-video/:editingVideoId").patch(verifyTokenOfAdmin , authorizeRole(["Admin"]) , editVideo)
router.route("/delete-video/:videoId").delete(verifyTokenOfAdmin , authorizeRole(['Admin']) ,deleteVideo)
router.route("/admin/get-all-videos").post(verifyTokenOfAdmin , authorizeRole(['Admin']) , getVideoListForAdmin)

export default router ;
