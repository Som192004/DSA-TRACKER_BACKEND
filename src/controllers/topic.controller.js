import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs" 
import { Topic } from "../models/topic.model.js"

const addTopic = asyncHandler (async (req,res) => {
    const {topicName} = req.body ;

    if(!topicName.trim()){
        throw new ApiError(400, "Topic name is required");
    }

    const existingTopic = await Topic.findOne({ name : topicName });

    if (existingTopic) {
        throw new ApiError(409, "Topic with this topicName already exists");
    }

    const newTopic = await Topic.create({
        name :topicName,
        problems : [],
    });

    return res.status(201).json(
        new ApiResponse(201, newTopic, "New Topic created successfully")
    );

})

export {addTopic}