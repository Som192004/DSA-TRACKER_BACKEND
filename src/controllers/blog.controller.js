import {Blog} from "../models/blog.model.js"

// Get all blog topics
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error });
  }
};

// Get a single blog topic by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog topic not found" });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
};

// Create a new blog topic
const createTopic = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newTopic = new Blog({ title, description, blogs: [] });
    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (error) {
    res.status(500).json({ message: "Error creating topic", error });
  }
};

// Add a new blog to an existing topic
const addBlogToTopic = async (req, res) => {
  try {
    const { name, content } = req.body;
    if (!name || !content) {
      return res.status(400).json({ message: "Name and content are required" });
    }

    const topic = await Blog.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.blogs.push({ name, content });
    await topic.save();

    res.status(201).json(topic.blogs[topic.blogs.length-1]);
  } catch (error) {
    res.status(500).json({ message: "Error adding blog to topic", error });
  }
};

// Update a blog topic
const updateTopic = async (req, res) => {
  try {
    const updatedTopic = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTopic) return res.status(404).json({ message: "Topic not found" });
    res.status(200).json(updatedTopic);
  } catch (error) {
    res.status(500).json({ message: "Error updating topic", error });
  }
};

// Delete a blog topic
const deleteTopic = async (req, res) => {
  try {
    const deletedTopic = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedTopic) return res.status(404).json({ message: "Topic not found" });
    res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting topic", error });
  }
};

const getBlogsByTopic = async (req, res) => {
  try {
    const topic = await Blog.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    res.status(200).json(topic.blogs); // Return all blogs under this topic
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error });
  }
};

// Get a specific blog inside a topic
const getSpecificBlog = async (req, res) => {
  try {
    const topic = await Blog.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    const blog = topic.blogs.id(req.params.blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
};

const updateBlog = async (req, res) => {
  try {
    const topic = await Blog.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    const blog = topic.blogs.id(req.params.blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.name = req.body.name || blog.name;
    blog.content = req.body.content || blog.content;
    await topic.save();

    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error });
  }
};

// Delete a blog inside a topic
const deleteBlog = async (req, res) => {
  try {
    const topic = await Blog.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.blogs = topic.blogs.filter((blog) => blog._id.toString() !== req.params.blogId);
    await topic.save();

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error });
  }
};

export  { getAllBlogs, getBlogById, createTopic, addBlogToTopic, updateTopic, deleteTopic, getBlogsByTopic , getSpecificBlog, updateBlog , deleteBlog};
