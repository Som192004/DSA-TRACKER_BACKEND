import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { UserProgress} from "../models/userprogress.model.js"
import {Problem} from   "../models/problem.model.js"

const updateUserProgress = asyncHandler(async (req, res, next) => {
    const { problemId } = req.params;
    const { status, notes, isBookmarked } = req.body;
  
    // Validate inputs
    if (![status, notes, isBookmarked].some(field => field !== undefined)) {
      throw new ApiError(400, "At least one field (status, notes, or isBookmarked) must be provided.");
    }
  
    // Validate problem existence in UserProgress
    const userProgress = await UserProgress.findOne({
      user: req.user._id,
      "list.problem": problemId,
    });
  
    if (!userProgress) {
      throw new ApiError(404, "Problem not found in user progress.");
    }
  
    // Update the specific problem in the list
    const updated = await UserProgress.updateOne(
      {
        user: req.user._id,
        "list.problem": problemId,
      },
      {
        $set: {
          ...(status !== undefined && { "list.$.status": status }), // Update status
          ...(notes !== undefined && { "list.$.notes": notes }), // Update notes
          ...(isBookmarked !== undefined && { "list.$.isBookmarked": isBookmarked }), // Update bookmark
        },
      }
    );
  
    // Check if the update was successful
    if (updated.modifiedCount === 0) {
      throw new ApiError(500, "Failed to update user progress.");
    }
  
    // Send success response
    return res.status(200).json(
      new ApiResponse(200, null, "User progress updated successfully.")
    );
});
  
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


export {updateUserProgress , getProblemsList , initializeUserProgress}