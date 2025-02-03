import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs" 
import { Topic } from "../models/topic.model.js"
import { UserProgress} from "../models/userprogress.model.js"
import {Problem} from   "../models/problem.model.js"

//We can add the functionality of the updating the problem by the admin in future ...
// This is the ok 
const problemNumbersFromTopic = asyncHandler(async (req,res,next) => {
    const { dsaTopics } = req.body ;
    
    if(!dsaTopics){
        throw new ApiError(400 , "topicNames are required . . .");
    }   
    const response = await Promise.all(
      dsaTopics.map(async (topicName) => {
        const matchedDoc = await Topic.find({ name: topicName.name }); 
        return {
          id: topicName.id,
          name: topicName.name,
          number: matchedDoc[0]?.problems ? matchedDoc[0].problems.length : 0,
        };
      })
    );
    

    return res.status(200).json(
        new ApiResponse(200 , response , "number of problems got of each topic")
    )
    
})

//This is ok. .. 
const getProblemsList = asyncHandler(async (req,res,next) => {
  const {topicName} = req.params ;
  
  const userprog = await UserProgress.find({user : req.user._id});
  
  const userProgress = await UserProgress.aggregate([
        // Match the specific user
        { $match: { user: req.user._id } },
  
        // // Unwind the 'list' array to handle individual problems
        { $unwind: '$list' },

        // // Lookup problem details from the Problem collection
        {
          $lookup: {
            from: 'problems', // Join with Problem collection
            localField: 'list.problem',
            foreignField: '_id',
            as: 'problemDetails',
          },
        },
  
        // // Unwind the joined problem details array
        { $unwind: '$problemDetails' },
  
        // // Match the problems with the requested topic name
        { $match: { 'problemDetails.topicName': topicName } },
  
        // // Group back the progress data for the user with filtered problems
        // {
        //   $group: {
        //     _id: '$_id',
        //     user: { $first: '$user' },
        //     list: {
        //       $push: {
        //         problem: '$list.problem',
        //         status: '$list.status',
        //         notes: '$list.notes',
        //         isBookmarked: '$list.isBookmarked',
        //         problemDetails: '$problemDetails', // Include problem details for context
        //       },
        //     },
        //     createdAt: { $first: '$createdAt' },
        //     updatedAt: { $first: '$updatedAt' },
        //   },
        // },
      ]);
      console.log("userprogress: " , userProgress)
      return res.status(200).json(
        new ApiResponse(200 , (userProgress || null) , "got the problem list")
      )
    } 
)

// This is ok ...
const addProblem = asyncHandler(async (req, res, next) => {
  const { name, difficulty, topicName, link, problemNumber } = req.body;

  // Validate all required fields
  if ([name, difficulty, topicName, link, problemNumber].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All Fields are required");
  }

  // Check if a problem with the same problemNumber already exists
  const existingProblem = await Problem.findOne({ problemNumber });
  if (existingProblem) {
    throw new ApiError(409, "Problem with this problemNumber already exists");
  }

  // Create the new problem
  const newProblem = await Problem.create({
    name,
    difficulty,
    topicName,
    link,
    problemNumber,
  });

  //Adding the problem to its topic . . . 
  const topic = await Topic.findOne({name : topicName})
  console.log()
  if (!topic) {
    topic = new Topic({
      name: name,
      problems: [newProblem._id], // Start with the new problem
    });
  } else {
    if (!topic.problems) topic.problems = [];
    topic.problems.push(newProblem._id);
    
  }

  await topic.save();

  // Fetch all users (assuming you have a User model)
  const allUsers = await User.find({});

  // Prepare the default progress object
  const defaultProgress = {
    problem: newProblem._id,
    status: "UnSolved", // Default status
    notes: "",         // Default empty notes
    isBookmarked: false, // Default not bookmarked
  };

  // Iterate through all users and ensure UserProgress exists or is updated
  await Promise.all(
    allUsers.map(async (user) => {
      // Find the UserProgress document for the user
      let userProgress = await UserProgress.findOne({ user: user._id });

      if (!userProgress) {
        // If no UserProgress exists, create one
        userProgress = new UserProgress({
          user: user._id,
          list: [defaultProgress], // Start with the new problem
        });
      } else {
        // If UserProgress exists, check if the problem is already added
        const isProblemInList = userProgress.list.some((entry) =>
          entry.problem.equals(newProblem._id)
        );

        if (!isProblemInList) {
          userProgress.list.push(defaultProgress);
        }
      }

      // Save the user progress
      await userProgress.save();
    })
  );

  return res.status(201).json(
    new ApiResponse(201, newProblem, "New problem created and appended to user progress")
  );
});

// This is ok
const deleteProblem = asyncHandler(async (req, res, next) => {
  const problemId  = req.params.problemId;
  
  // Step 1: Find the problem in the Problem collection
  const problem = await Problem.findById(problemId);

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  // Step 2: Remove the problem from the Problem collection
  await Problem.findByIdAndDelete(problemId);

  //Step 3: Remove the problem from the topic collection

        // Step 1: Find the topic that contains the given problemId
        const topic = await Topic.findOne({ name: problem.topicName });

        if (!topic) {
            return res.status(404).json({ message: "Problem not found in any topic" });
        }

        // Step 2: Remove the problemId from the topic's problem list
        topic.problems = topic.problems.filter(
            (id) => id.toString() !== problemId
        );

        // Step 3: Save the updated topic document
        await topic.save();

  // Step 4: Remove the problem from all UserProgress documents
  await UserProgress.updateMany(
    { "list.problem": problemId }, // Find UserProgress containing the problem
    { $pull: { list: { problem: problemId } } } // Remove the specific problem
  );

  // Step 4: Return success response
  return res.status(200).json(
    new ApiResponse(200, null, "Problem deleted successfully from Problem collection and UserProgress")
  );
});

//Is this required . . . 
const getSolvedProblemsCountByTopic = asyncHandler (async (req,res,next) => {
  const {topicNames} = req.body ; 
  try {
    const result = [];

    // Loop through each topic name to get the count of solved problems
    for (const topicName of topicNames) {
      const solvedCount = await UserProgress.aggregate([
        { $match: { user: req.user._id } },  // Match the specific user
        { $unwind: '$list' },  // Unwind the 'list' array to work with individual problems
        { $lookup: {
          from: 'problems',  // Join with the Problem collection
          localField: 'list.problem',
          foreignField: '_id',
          as: 'problemDetails',
        }},
        { $unwind: '$problemDetails' },  // Unwind the resulting problems array
        { $match: { 'problemDetails.topicName': topicName, 'list.status': 'Solved' } },  // Filter for problems by topic and status 'Solved'
        { $count: 'solvedProblems' }  // Count the number of solved problems for the topic
      ]);

      // If there are solved problems, push the count; otherwise, push 0
      result.push(solvedCount[0] ? solvedCount[0].solvedProblems : 0);
    }

    return res.status(200).send(new ApiResponse(200 , result , "got problem numbers of each topic solved by the user"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500 , 'Error while fetching solved problems count by topic');
  }
})

const getProblemListForAdmin = asyncHandler(async (req,res,next ) => {
    try {
        const { topicNames } = req.body; // Extract topicNames array from request

        if (!topicNames || !Array.isArray(topicNames)) {
            return res.status(400).json({ message: "Invalid topicNames format" });
        }

        // Find topics matching the given topic names and populate problems
        const topics = await Topic.find({ name: { $in: topicNames } })
            .populate("problems") // Populate problems field

        res.status(200).send(new ApiResponse(200 , topics , "Problems fetched successfully. . . "));
    } catch (error) {
        console.error("Error fetching topics with problems:", error);
        res.status(500).send(new ApiError(500 , "Internal server error"));
    }
}) 

const editProblem = asyncHandler(async (req,res,next) => {
  const {editedProblem} = req.body ;
  const {editingProblemId} = req.params ; 
  try{
      if (!editingProblemId) {
        throw new ApiError("Problem Id is required")
      }
      const updatedProblem = await Problem.findByIdAndUpdate(
        editingProblemId,
        { $set: editedProblem },
        { new: true, runValidators: true }
      );

      if (!updatedProblem) {
        return res.status(404).send(new ApiError("Problem not found."));
      }

      return res.status(200).send(new ApiResponse(200 , updatedProblem , "Problem updated successfully."));
  }catch(err){
      return res.status(500).send(new ApiError(500 , "Internal Server Error"))
  }

})


export {problemNumbersFromTopic , getProblemsList , addProblem  , deleteProblem , getSolvedProblemsCountByTopic , getProblemListForAdmin , editProblem} 