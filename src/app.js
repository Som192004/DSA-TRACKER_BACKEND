import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express() 
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit:"16kb"
}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});


//importing the routes . . . 
import userRouter from "./routes/user.routes.js"
import problemRouter from "./routes/problem.routes.js"
import adminRouter from "./routes/admin.routes.js"
import topicRouter from "./routes/topic.routes.js"
import userProgressRouter from "./routes/userProgress.routes.js"
import blogRouter from "./routes/blog.routes.js"
import feedBackRouter from "./routes/feedback.routes.js"
import courseRouter from "./routes/course.routes.js"
import videRouter from "./routes/video.routes.js"
import courseProgressRouter from "./routes/courseProgress.routes.js"

app.use("/users" , userRouter)
app.use("/problems" , problemRouter)
app.use("/admin" , adminRouter)
app.use("/topic" , topicRouter)
app.use("/userprogress" , userProgressRouter)
app.use("/blog" ,blogRouter)
app.use('/feedback', feedBackRouter)
app.use('/courses' , courseRouter)
app.use('/videos' , videRouter)
app.use('/courseprogress' , courseProgressRouter)

app.get("/" , (req , res) => {
    res.send("Hello")
    console.log("user get . . . ")
})

export default app ;
