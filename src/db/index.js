/**
 * This file is containing the logic for the database connection . . .
*/

import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import dotenv from "dotenv" ;
dotenv.config({path : "../.env"}) ;

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`\n mongodb connected `);
    }catch(err){
        console.log("MongoDB Connection Error . . . ") ;
        console.log(err);
        throw err ;
    }
}

export default connectDB ;