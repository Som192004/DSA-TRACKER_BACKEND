/**
 * This file is containing the logic for the database connection . . .
*/

import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import dotenv from "dotenv" ;
dotenv.config({path : "../.env"}) ;

const connectDB = async () => {
    try{
        console.log("Current directory:", process.cwd());
        console.log(process.env.MONGODB_URI);
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`\n mongodb connected `);
    }catch(err){
        console.log("MongoDB Connection Error . . . ") ;
        console.log(err);
    }
}

export default connectDB ;