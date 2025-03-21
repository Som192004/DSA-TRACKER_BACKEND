import {Router} from "express"
import {verifyToken , authorizeRole ,verifyTokenOfAdmin} from "../middlewares/auth.middleware.js"
import { getAllBlogs, getBlogById, createTopic, addBlogToTopic, updateTopic, deleteTopic, getBlogsByTopic, getSpecificBlog, updateBlog, deleteBlog} from "../controllers/blog.controller.js"
import express from "express"
const router = express.Router();

router.route("/get-all-blogs").get(getAllBlogs);                   // Fetch all blog topics
router.route("/get-blog-by-id/:id").get(getBlogById);                // Fetch a single blog topic by ID
router.route("/create-blog").post(verifyTokenOfAdmin, authorizeRole(['Admin']) , createTopic);                  // Create a new blog topic
router.route("/update-blog-by-id/:id").put(verifyTokenOfAdmin, authorizeRole(['Admin']) ,updateTopic);                // Update a blog topic by ID
router.route("/delete-blog/:id").delete(verifyTokenOfAdmin , authorizeRole(['Admin']), deleteTopic);             // Delete a blog topic by ID
router.route("/add-blog/:id/addBlog").post(verifyTokenOfAdmin , authorizeRole(['Admin']),addBlogToTopic);    // Add a blog to a topic

router.route("/:id/blogs").get(getBlogsByTopic);        // Get all blogs under a topic
router.route("/:topicId/blog/:blogId").get(getSpecificBlog); // Get a specific blog inside a topic
router.route("/:topicId/blog/:blogId").put(updateBlog); // Update a blog inside a topic
router.route("/:topicId/blog/:blogId").delete(deleteBlog); 


export default router ;