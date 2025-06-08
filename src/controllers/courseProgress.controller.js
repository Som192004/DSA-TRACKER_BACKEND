import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { CourseProgress} from "../models/courseProgress.model.js"
import {Video} from   "../models/video.model.js"
import mongoose from "mongoose";


const updateCourseProgress = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { status, notes, isBookmarked } = req.body.editedVideo ;
    const userId = req.user._id; 

    if (!videoId) {
      return res.status(400).send(new ApiError(400 , "Video ID is required."));
    }

    // Find user's progress document
    const courseprogress = await CourseProgress.findOne({ user: userId });

    if (!courseprogress) {
      return res.status(404).send(new ApiError(404 , "Course progress not found."));
    }

    // Find the specific problem in the list
    const videoEntry = courseprogress.list.find((item) =>
      item._id.equals(videoId)
    );

    if (!videoEntry) {
      return res.status(404).send(new ApiError(404 , "Video not found in video progress."));
    }

    // Update the fields if provided in the request body
    if (status) videoEntry.status = status;
    if (notes !== undefined) videoEntry.notes = notes;
    if (isBookmarked !== undefined) videoEntry.isBookmarked = isBookmarked;

    await courseprogress.save();

    return res.status(200).send(new ApiResponse(200 , videoEntry ,"Video updated successfully"));
  } catch (error) {
    console.error(error);
    return res.status(500).send(new ApiError(500 , "Internal server error."));
  }
};

  
const getVideosList = asyncHandler(async (req,res,next) => {
    const courseName = req.params.courseName ;
    
    const courseProgress = await CourseProgress.aggregate([
          // Match the specific user
          { $match: { user: req.user._id } },
    
          // Unwind the 'list' array to handle individual problems
          { $unwind: '$list' },
    
          // Lookup problem details from the Problem collection
          {
            $lookup: {
              from: 'videos', // Join with Problem collection
              localField: 'list.video',
              foreignField: '_id',
              as: 'videoDetails',
            },
          },
    
          // Unwind the joined problem details array
          { $unwind: '$videoDetails' },
    
          // Match the problems with the requested topic name
          { $match: { 'videoDetails.courseName': courseName } },
    
          // Group back the progress data for the user with filtered problems
          {
            $group: {
              _id: '$_id',
              user: { $first: '$user' },
              list: {
                $push: {
                  video: '$list.video',
                  status: '$list.status',
                  notes: '$list.notes',
                  isBookmarked: '$list.isBookmarked',
                  videoDetails: '$videoDetails', // Include problem details for context
                },
              },
              createdAt: { $first: '$createdAt' },
              updatedAt: { $first: '$updatedAt' },
            },
          },
        ]);
        return res.status(200).json(
          new ApiResponse(200 , (courseProgress || null) , "got the video list")
        )
      } 
    
)

// const initializeUserProgress = asyncHandler(async (req, res, next) => {
  
//   // Respond with success
//   return res.status(201).json(
//     new ApiResponse(201, userProgress, "UserProgress initialized successfully.")
//   );
// });


export {updateCourseProgress , getVideosList }
