import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs" 
import { Course } from "../models/course.model.js"
import { CourseProgress} from "../models/courseprogress.model.js"
import {Video} from   "../models/video.model.js"

//We can add the functionality of the updating the problem by the admin in future ...
// This is the ok 
const videoNumbersFromCourse = asyncHandler(async (req,res,next) => {
    const { courses } = req.body ;
    
    if(!courses){
        throw new ApiError(400 , "courseNames are required . . .");
    }   
    const response = await Promise.all(
        courses.map(async (courseName) => {
        const matchedDoc = await Course.find({ name: courseName.name }); 
        return {
          id: courseName.id,
          name: courseName.name,
          number: matchedDoc[0]?.videos ? matchedDoc[0].videos.length : 0,
        };
      })
    );
    

    return res.status(200).json(
        new ApiResponse(200 , response , "number of videos got of each course")
    )
    
})

//This is ok. .. 
const getVideosList = asyncHandler(async (req,res,next) => {
  const {courseName} = req.params ;
  
  const courseprog = await CourseProgress.find({user : req.user._id});
  
  const courseProgress = await CourseProgress.aggregate([
        // Match the specific user
        { $match: { user: req.user._id } },
  
        // // Unwind the 'list' array to handle individual problems
        { $unwind: '$list' },

        // // Lookup problem details from the Problem collection
        {
          $lookup: {
            from: 'videos', // Join with Problem collection
            localField: 'list.video',
            foreignField: '_id',
            as: 'videoDetails',
          },
        },
  
        // // Unwind the joined problem details array
        { $unwind: '$videoDetails' },
  
        // // Match the problems with the requested topic name
        { $match: { 'videoDetails.courseName': courseName } },
  
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
      console.log("courseprogress: " , courseProgress)
      return res.status(200).json(
        new ApiResponse(200 , (courseProgress || null) , "got the course list")
      )
    } 
)

// This is ok ...
const addVideo = asyncHandler(async (req, res, next) => {
  const { name , courseName, link, videoNumber } = req.body;

  // Validate all required fields
  if ([name , courseName, link, videoNumber].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All Fields are required");
  }

  // Check if a problem with the same problemNumber already exists
  const existingVideo = await Video.findOne({ videoNumber });
  if (existingVideo) {
    throw new ApiError(409, "Video with this videoNumber already exists");
  }

  // Create the new problem
  const newVideo = await Video.create({
    name,
    courseName,
    link,
    videoNumber,
  });

  //Adding the problem to its topic . . . 
  const course = await Course.findOne({name : courseName})
  console.log()
  if (!course) {
    course = new Course({
      name: name,
      videos: [newVideo._id], // Start with the new problem
    });
  } else {
    if (!course.videos) course.videos = [];
    course.videos.push(newVideo._id);
    
  }

  await course.save();

  // Fetch all users (assuming you have a User model)
  const allUsers = await User.find({});

  // Prepare the default progress object
  const defaultProgress = {
    video: newVideo._id,
    status: "NotWatched", // Default status
    notes: "",         // Default empty notes
    isBookmarked: false, // Default not bookmarked
  };

  // Iterate through all users and ensure UserProgress exists or is updated
  await Promise.all(
    allUsers.map(async (user) => {
      // Find the UserProgress document for the user
      let courseProgress = await CourseProgress.findOne({ user: user._id });

      if (!courseProgress) {
        // If no UserProgress exists, create one
        courseProgress = new CourseProgress({
          user: user._id,
          list: [defaultProgress], // Start with the new problem
        });
      } else {
        // If UserProgress exists, check if the problem is already added
        const isVideoInList = courseProgress.list.some((entry) =>
          entry.video.equals(newVideo._id)
        );

        if (!isVideoInList) {
            courseProgress.list.push(defaultProgress);
        }
      }

      // Save the user progress
      await courseProgress.save();
    })
  );

  return res.status(201).json(
    new ApiResponse(201, newVideo, "New video created and appended to course progress")
  );
});

// This is ok
const deleteVideo = asyncHandler(async (req, res, next) => {
  const videoId  = req.params.videoId;
  
  // Step 1: Find the problem in the Problem collection
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Step 2: Remove the problem from the Problem collection
  await Video.findByIdAndDelete(videoId);

  //Step 3: Remove the problem from the topic collection

        // Step 1: Find the topic that contains the given problemId
        const course = await Course.findOne({ name: problem.courseName });

        if (!course) {
            return res.status(404).json({ message: "Video not found in any course" });
        }

        // Step 2: Remove the problemId from the topic's problem list
        course.videos = course.videos.filter(
            (id) => id.toString() !== videoId
        );

        // Step 3: Save the updated topic document
        await course.save();

  // Step 4: Remove the problem from all UserProgress documents
  await CourseProgress.updateMany(
    { "list.video": videoId }, // Find UserProgress containing the problem
    { $pull: { list: { video: videoId } } } // Remove the specific problem
  );

  // Step 4: Return success response
  return res.status(200).json(
    new ApiResponse(200, null, "Video deleted successfully from Video collection and CourseProgress")
  );
});

//Is this required . . . 
const getWatchedVideosCountByCourse = asyncHandler (async (req,res,next) => {
  const {courseNames} = req.body ; 
  try {
    const result = [];

    // Loop through each topic name to get the count of solved problems
    for (const courseName of topicNames) {
      const watchedCount = await CourseProgress.aggregate([
        { $match: { user: req.user._id } },  // Match the specific user
        { $unwind: '$list' },  // Unwind the 'list' array to work with individual problems
        { $lookup: {
          from: 'videos',  // Join with the Problem collection
          localField: 'list.video',
          foreignField: '_id',
          as: 'videoDetails',
        }},
        { $unwind: '$videoDetails' },  // Unwind the resulting problems array
        { $match: { 'videoDetails.courseName': courseName, 'list.status': 'Watched' } },  // Filter for problems by topic and status 'Solved'
        { $count: 'watchedVideos' }  // Count the number of solved problems for the topic
      ]);

      // If there are solved problems, push the count; otherwise, push 0
      result.push(watchedCount[0] ? watchedCount[0].watchedVideos : 0);
    }

    return res.status(200).send(new ApiResponse(200 , result , "got video numbers of each course watched by the user"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500 , 'Error while fetching watched videos count by course');
  }
})

const getVideoListForAdmin = asyncHandler(async (req,res,next ) => {
    try {
        const { courseNames } = req.body; // Extract topicNames array from request

        if (!courseNames || !Array.isArray(courseNames)) {
            return res.status(400).json({ message: "Invalid courseNames format" });
        }

        // Find topics matching the given topic names and populate problems
        const courses = await Course.find({ name: { $in: courseNames } })
            .populate("videos") // Populate problems field

        res.status(200).send(new ApiResponse(200 , courses , "Videos fetched successfully. . . "));
    } catch (error) {
        console.error("Error fetching courses with videos:", error);
        res.status(500).send(new ApiError(500 , "Internal server error"));
    }
}) 

const editVideo = asyncHandler(async (req,res,next) => {
  const {editedVideo} = req.body ;
  const {editingVideoId} = req.params ; 
  try{
      if (!editingVideoId) {
        throw new ApiError("Video Id is required")
      }
      const updatedVideo = await Video.findByIdAndUpdate(
        editingVideoId,
        { $set: editedVideo },
        { new: true, runValidators: true }
      );

      if (!updatedVideo) {
        return res.status(404).send(new ApiError("Video not found."));
      }

      return res.status(200).send(new ApiResponse(200 , updatedVideo , "Video updated successfully."));
  }catch(err){
      return res.status(500).send(new ApiError(500 , "Internal Server Error"))
  }

})


export {videoNumbersFromCourse , getVideosList , addVideo  , deleteVideo , getWatchedVideosCountByCourse , getVideoListForAdmin , editVideo} 