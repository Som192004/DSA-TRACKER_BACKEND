import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import {Mentor} from "../models/mentor.model.js"

const getAllMentors = async () => {
    try {
        const mentors = await Mentor.find() ;
        res.status(200).json(mentors);
      } catch (error) {
        res.status(500).json({ message: "Error fetching blogs", error });
      }
}

const addMentor = async () => {
    try{
        const {name, img, title, linkedIn} = req.body ;

        if (!name || !img || !title || !linkedIn) {
            return res.status(400).json({ message: "Name and Title and linkedInURL are required" });
        }

        const newMentor = new Mentor({ name, img, title, linkedIn});
        await newMentor.save();
        res.status(201).json(newMentor);
    }catch(error){
        res.status(500).json({ message: "Error Adding Mentor", error });
    }
}

const updateMentor = async (req, res) => {
    try {
      const updatedMentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedMentor) return res.status(404).json({ message: "Mentor not found" });
      res.status(200).json(updatedMentor);
    } catch (error) {
      res.status(500).json({ message: "Error updating topic", error });
    }
};

const deleteMentor = async (req, res) => {
    try {
      const deletedMentor = await Mentor.findByIdAndDelete(req.params.id);
      if (!deletedMentor) return res.status(404).json({ message: "Mentor not found" });
      res.status(200).json({ message: "Mentor deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting topic", error });
    }
};

export {
    getAllMentors,addMentor,updateMentor, deleteMentor
}