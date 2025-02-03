import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { UserProgress} from "../models/userprogress.model.js"
import {Problem} from   "../models/problem.model.js"
import mongoose from "mongoose";


const updateUserProgress = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { status, notes, isBookmarked } = req.body.editedProblem ;
    const userId = req.user._id; 

    if (!problemId) {
      return res.status(400).send(new ApiError(400 , "Problem ID is required."));
    }

    // Find user's progress document
    const userProgress = await UserProgress.findOne({ user: userId });

    if (!userProgress) {
      return res.status(404).send(new ApiError(404 , "User progress not found."));
    }

    // Find the specific problem in the list
    const problemEntry = userProgress.list.find((item) =>
      item._id.equals(problemId)
    );

    if (!problemEntry) {
      return res.status(404).send(new ApiError(404 , "Problem not found in user progress."));
    }

    // Update the fields if provided in the request body
    if (status) problemEntry.status = status;
    if (notes !== undefined) problemEntry.notes = notes;
    if (isBookmarked !== undefined) problemEntry.isBookmarked = isBookmarked;

    await userProgress.save();

    return res.status(200).send(new ApiResponse(200 , problemEntry ,"Progress updated successfully"));
  } catch (error) {
    console.error(error);
    return res.status(500).send(new ApiError(500 , "Internal server error."));
  }
};

  
const getProblemsList = asyncHandler(async (req,res,next) => {
    const topicName = req.params.topicName ;
    
    const userProgress = await UserProgress.aggregate([
          // Match the specific user
          { $match: { user: req.user._id } },
    
          // Unwind the 'list' array to handle individual problems
          { $unwind: '$list' },
    
          // Lookup problem details from the Problem collection
          {
            $lookup: {
              from: 'problems', // Join with Problem collection
              localField: 'list.problem',
              foreignField: '_id',
              as: 'problemDetails',
            },
          },
    
          // Unwind the joined problem details array
          { $unwind: '$problemDetails' },
    
          // Match the problems with the requested topic name
          { $match: { 'problemDetails.topicName': topicName } },
    
          // Group back the progress data for the user with filtered problems
          {
            $group: {
              _id: '$_id',
              user: { $first: '$user' },
              list: {
                $push: {
                  problem: '$list.problem',
                  status: '$list.status',
                  notes: '$list.notes',
                  isBookmarked: '$list.isBookmarked',
                  problemDetails: '$problemDetails', // Include problem details for context
                },
              },
              createdAt: { $first: '$createdAt' },
              updatedAt: { $first: '$updatedAt' },
            },
          },
        ]);
        return res.status(200).json(
          new ApiResponse(200 , (userProgress || null) , "got the problem list")
        )
      } 
    
)

// const initializeUserProgress = asyncHandler(async (req, res, next) => {
  
//   // Respond with success
//   return res.status(201).json(
//     new ApiResponse(201, userProgress, "UserProgress initialized successfully.")
//   );
// });


export {updateUserProgress , getProblemsList }