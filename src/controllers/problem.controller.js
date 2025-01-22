import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs" 
import { Topic } from "../models/topic.model.js"
import { UserProgress} from "./models/userprogress.model.js"
import {Problem} from   "./models/problem.model.js"

const problemNumbersFromTopic = asyncHandler(async (req,res) => {
    const { dsaTopics } = req.body ;

    if(!dsaTopics){
        throw new ApiError(400 , "topicNames are required . . .");
    }   
    const id = 1 ; 
    const response = dsaTopics.map(topicName => {
        const matchedDoc = Topic.find(doc => doc.name === topicName);
        return {
          id : (id++) , 
          name: topicName,
          number: matchedDoc ? matchedDoc.problems.length : 0, 
        };
      });

    return res.status(200).json(
        new ApiResponse(200 , response , "number of problems got of each topic")
    )
    
})

const getProblemsList = asyncHandler(async (req,res) => {
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
        new ApiResponse(200 , (userProgress[0] || null) , "got the problem list")
      )
    } 
  
)

const addProblem = asyncHandler(async (req,res) => {
  const {name , difficulty , topicName , link , problemNumber} = req.body ; 

  if([name , difficulty , topicName , link , problemNumber].some((field) => field?.trim === "")){
    throw new ApiError(400 , "All Fields are required ")
  }

  const problem = await User.findOne({problemNumber});

  if(problem){
    throw new ApiError(409, "User with email or username already exists")
  }

  const newProblem = await Problem.create({
    name,
    difficulty,
    topicName,
    link,
    problemNumber,
  })

  const createdProblem = await Problem.findById(newProblem._id);

  if(!createdProblem){
    throw new ApiError(500 , "Problem is not created Successfully . . . ");
  }

  return res.status(201).json(
    new ApiResponse(200 , createdProblem , "new peoblem created successfully . . . ")
  )

})

// const updateProblem = asyncHandler(async (req,res) => {
//   const {name , }
// })

const deleteProblem = asyncHandler(async (req,res) => {
  const problemNumber = req.params.problemNumber ; 

  if(!problemNumber){
    return new ApiError(404 , "problem not found . . .");
  }

  await Problem.findOneAndDelete({problemNumber});

  res.status(200).send(new ApiResponse(200 , null , "problem deleted successfully . . . "));

})

const getSolvedProblemsCountByTopic = asyncHandler (async (req, res) => {
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


export {problemNumbersFromTopic , getProblemsList , addProblem  , deleteProblem , getSolvedProblemsCountByTopic } 