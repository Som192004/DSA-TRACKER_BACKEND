import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {Admin} from "../models/admin.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


const registerAdmin = asyncHandler(async (req,res) => {

    const {adminname , email  , password } = req.body ;
    
    if([adminname , email , password].some((field) => field?.trim === "")){
        throw new ApiError(400 , "All Fields are required ")
    }

    const admin = await Admin.findOne({
        $or : [{email},{adminname}]
    })

    if(admin){
        throw new ApiError(409, "Admin with email or admin already exists")
    }
    
    const newAdmin = await Admin.create({
        adminname,
        email,
        password,
    })
    
    const createdAdmin = await Admin.findById(newAdmin._id).select(
        "-password"
    )
    if(!createdAdmin){
        throw new ApiError(500 , "Admin is not registered successfully")
    }

    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "Admin Registered Successfully ! ")
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

    const admin = await Admin.findOne({email})

    if(!admin){
        throw new ApiError(404 , "Admin not Found")
    }

    const isPassValid = await admin.isPasswordCorrect(password)

    if(!isPassValid){
        throw new ApiError(401 , "Password is not valid")
    }

    let accessToken = "" ;

    try{
        accessToken = await admin.generateAccessToken()

        await admin.save({validateBeforeSave : false })

    }catch(error){
        throw new ApiError(500 , "Something went wrong while generating access token")
    }


    const loggedInAdmin = await Admin.findById(admin._id).select("-password")

    return res.status(200).json(
        new ApiResponse(200 , 
            { admin : loggedInAdmin , accessToken 
            },
            "Admin logged in successfully"
        )
    )
})

export {registerAdmin , login }