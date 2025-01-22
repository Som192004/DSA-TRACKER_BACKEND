import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs" 
import { UserProgress } from "../models/userprogress.model.js"

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
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500 , "User is not registered successfully")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully ! ")
    )
})

const login = asyncHandler (async (req,res) => {

    const {email , password} = req.body

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
    let refreshToken = "" ;

    try{
        accessToken = await user.generateAccessToken()

        refreshToken = await user.generateRefToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false })

    }catch(error){
        throw new ApiError(500 , "Something went wrong while generating refresh and access token")
    }

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true, // Prevents client-side scripts from accessing the cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', 
      }

    console.log("accessToken: " , accessToken)
    //cookies are not set in the mobile application at the user end that's why here we are sending the accesstoken and refreshtoken in the response to the user 
    return res.status(200).cookie("accessToken", accessToken ,options).cookie("refreshToken",refreshToken , options).json(
        new ApiResponse(200 , 
            { user : loggedInUser , accessToken , refreshToken

            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id , 
        {
            $set: {
                refreshToken: null  // Use null instead of undefined to clear
            },
        },
            {
                new : true 
            }
        
    )

    const options = {
        httpOnly : true ,
        secure : true , 
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken",options).json(new ApiResponse(200 , {} , "User logged out"))
})

const getSolvedProblemsCountByTopic = asyncHandler(async (userId, topicNames) => {
      const result = [];
  
      // Loop through each topic name to get the count of solved problems
      for (const topicName of topicNames) {

        const solvedCount = await UserProgress.aggregate([
          { $match: { user: userId } },  // Match the specific user
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
  
      return result;
  }
)
  
const getUserInfo = asyncHandler(async (req,res) => {
    const {topicNames} = req.body ;
    let solvedProblems = 0 ; 
    solvedProblems = await UserProgress.findOne({ user: req.user._id })
    .select('list.problem') // Only select the problems
    .where('list.status').equals('Solved')
    .populate('list.problem')
    .exec();
    if(solvedProblems === null){
        solvedProblems = 0 ;
    }

    const result = getSolvedProblemsCountByTopic(req.user._id , topicNames)


    return res.status(200).json(new ApiResponse(200 , {user : req.user , totalProblems : solvedProblems , result} , "User Info fetched Successfully "))
})

const refreshAccessToken = asyncHandler(async (req , res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

    if(!incomingRefreshToken){
        throw new ApiError(401 , "UnAuthorized Request")
    }

    try{
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401 , "InValid refresh token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401 , "Refresh token is expired")
    }

    const options = {
        httpOnly : true , 
        secure : true 
    }

    const accessToken = await generateAccessToken(user._id)

    const newrefreshToken = await generateRefToken(user._id)

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200 ,
            {accessToken , refreshToken : newrefreshToken} ,
            "Access Token refreshed"
        )
    )
    }
    catch(error){
        throw new ApiError(401 , error?.message || "Invalid refesh token")
    }

    
})

export {registerUser , login , logoutUser , refreshAccessToken ,getUserInfo}