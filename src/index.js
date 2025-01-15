import dotenv from "dotenv"
import mongoose from "mongoose";
import  express  from "express";
import connectDB from "./db/index.js";
import app from "./app.js"

dotenv.config({
    path : "./env"
}) ;


connectDB().then(() => {
    app.on('err' , (err) => {
                    console.log("Error : " , err) ;
                    throw err ; 
                })
                    
    app.listen(process.env.PORT || 8000, () => {
        console.log("app is listening at the port :" , process.env.PORT) ;
    });
})
.catch((err) => {
    console.log("MONGO DB connection Failed . . . ") ;
})