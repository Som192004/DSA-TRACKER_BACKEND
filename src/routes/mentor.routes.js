import {Router} from "express"
import {verifyToken , authorizeRole ,verifyTokenOfAdmin} from "../middlewares/auth.middleware.js"
import { getAllMentors, addMentor, updateMentor } from "../controllers/mentorController.js";
import express from "express"
const router = express.Router();

router.route("/get-all-mentors").get(getAllMentors);                   
router.route("/add-mentor").post(verifyTokenOfAdmin, authorizeRole(['Admin']) , addMentor);                  // Create a new blog topic
router.route("/update-mentor-by-id/:id").put(verifyTokenOfAdmin, authorizeRole(['Admin']) ,updateMentor);                // Update a blog topic by ID
// router.route("/delete-blog/:id").delete(verifyTokenOfAdmin , authorizeRole(['Admin']), deleteTopic);             // Delete a blog topic by ID
router.route("/add-blog/:id/addBlog").post(verifyTokenOfAdmin , authorizeRole(['Admin']),addBlogToTopic);    // Add a blog to a topic

router.route("/:id/blogs").get(getBlogsByTopic);        // Get all blogs under a topic
router.route("/:topicId/blog/:blogId").get(getSpecificBlog); // Get a specific blog inside a topic
router.route("/:topicId/blog/:blogId").put(updateBlog); // Update a blog inside a topic
router.route("/:topicId/blog/:blogId").delete(deleteBlog); 


export default router ;