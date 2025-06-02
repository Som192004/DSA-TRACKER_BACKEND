import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
  name: {
    type : String,
    required : true,
  },
  img: {
    type : String,
    required: true
  },
  title: {
    type : String,
    required : true,
  },
  linkedIn : {
    type : String,
    required : true,
  }

});

export const Mentor = mongoose.model("Mentor" , mentorSchema)
