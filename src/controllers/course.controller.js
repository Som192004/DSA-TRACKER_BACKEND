import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs" 
import { Course } from "../models/course.model.js"

const addCourse = asyncHandler (async (req,res) => {
    const {courseName} = req.body ;

    if(!courseName.trim()){
        throw new ApiError(400, "course name is required");
    }

    const existingCourse = await Course.findOne({ 
        name: { $regex: `^${courseName}$`, $options: "i" } 
      });
      

    if (existingCourse) {
        throw new ApiError(409, "Course with this courseName already exists");
    }

    const newCourse = await Course.create({
        name : courseName,
        videos : [],
    });

    return res.status(201).json(
        new ApiResponse(201, newCourse, "New Course created successfully")
    );

})

export {addCourse}