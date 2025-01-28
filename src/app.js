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

app.use("/users" , userRouter)
app.use("/problems" , problemRouter)
app.use("/admin" , adminRouter)
app.get("/" , (req , res) => {
    res.send("Hello")
    console.log("user get . . . ")
})

export default app ;
