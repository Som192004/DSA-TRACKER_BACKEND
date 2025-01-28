import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs" 
import { UserProgress } from "../models/userprogress.model.js"

//Testing is done Ok
const registerUser = asyncHandler(async (req,res) => {

    const {username , email , fullname , password , collegeName , leetCodeId} = req.body ;
    
    if([username , email , fullname , password , collegeName , leetCodeId].some((field) => field?.trim === "")){
        throw new ApiError(400 , "All Fields are required ")
    }

    const user = await User.findOne({
        $or : [{email},{username}]
    })

    if(user){
        throw new ApiError(409, "User with email or username already exists")
    }
    
    const newUser = await User.create({
        username,
        email,
        fullname,
        password,
        collegeName,
        leetCodeId,
    })
    
    const createdUser = await User.findById(newUser._id).select(
        "-password"
    )
    if(!createdUser){
        throw new ApiError(500 , "User is not registered successfully")
    }
    req.user = createdUser;

    const userId = req.user._id;

  // Check if the UserProgress document already exists for the user
  const existingProgress = await UserProgress.findOne({ user: userId });

  if (existingProgress) {
    throw new ApiError(400, "UserProgress already initialized for this user.");
  }

  // Fetch all problems from the Problem collection
  const problems = await Problem.find({}, "_id");

  if (problems.length === 0) {
    return res.status(400).json(
      new ApiResponse(400, null, "No problems found to initialize progress.")
    );
  }

  // Create a new UserProgress document for the user
  const userProgress = new UserProgress({
    user: userId,
    list: problems.map(problem => ({
      problem: problem._id,
      status: "Skipped", // Default status
      notes: "", // Default notes
      isBookmarked: false, // Default bookmark status
    })),
  });

  // Save the new UserProgress document
  await userProgress.save();


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered and UserProgress intialized Successfully ! ")
    )
})
//Testing is done Ok
const login = asyncHandler (async (req,res) => {

    const {email , password} = req.body
    console.log("email : " , email)
    console.log("password : " , password)

    if(!email){
        throw new ApiError(400 , "Email required")
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404 , "User not Found")
    }

    const isPassValid = await user.isPasswordCorrect(password)

    if(!isPassValid){
        throw new ApiError(401 , "Password is not valid")
    }

    let accessToken = "" ;

    try{
        accessToken = await user.generateAccessToken()

        await user.save({validateBeforeSave : false })

    }catch(error){
        throw new ApiError(500 , "Something went wrong while generating access token")
    }


    const loggedInUser = await User.findById(user._id).select("-password")

    //cookies are not set in the mobile application at the user end that's why here we are sending the accesstoken and refreshtoken in the response to the user 
    return res.status(200).json(
        new ApiResponse(200 , 
            { user : loggedInUser , accessToken 
            },
            "User logged in successfully"
        )
    )
})

//Testing is done ok 
const getUserInfo = asyncHandler(async (req, res) => {
    console.log(req.body)
    const topicNames  = req.body.topicNames ;
    try {
        // Fetch solved problems
        let solvedProblems = await UserProgress.findOne({ user: req.user._id })
            .select('list.problem') // Select only the problems
            .where('list.status')
            .equals('Solved')
            .populate('list.problem')
            .exec();

        // Handle null case
        solvedProblems = solvedProblems ? solvedProblems.list.problem.length : 0;

        // Await result from the asynchronous function
        const result = await Promise.all(
            topicNames.map(async (topicName) => {
              const solvedCount = await UserProgress.aggregate([
                { $match: { user: req.user._id } }, // Match the specific user
                { $unwind: '$list' }, // Unwind the 'list' array to work with individual problems
                {
                  $lookup: {
                    from: 'problems', // Join with the Problem collection
                    localField: 'list.problem',
                    foreignField: '_id',
                    as: 'problemDetails',
                  },
                },
                { $unwind: '$problemDetails' }, // Unwind the resulting problems array
                {
                  $match: {
                    'problemDetails.topicName': topicName,
                    'list.status': 'Solved',
                  },
                },
                { $count: 'solvedProblems' }, // Count the number of solved problems for the topic
              ]);
        
              // Return the count or 0 if no results found
              return solvedCount[0] ? solvedCount[0].solvedProblems : 0;
            })
          );
        // Return response only once
        const user = req.user;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { user, totalProblems: solvedProblems, result },
                    "User Info fetched successfully"
                )
            );
    } catch (error) {
        console.error('Error fetching user info:', error);

        // Ensure only one response is sent
        if (!res.headersSent) {
            throw new ApiError(500, 'Error fetching user info');
        }
    }
});


export {registerUser , login  ,getUserInfo}