import mongoose , {Schema} from "mongoose";

const videoSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  courseName : {
    type : String ,
    required : true , 
  },
  link: {
    type: String,
    required: true,
  },
  videoNumber : {
    type : Number ,
    required : true ,
  }
}, { timestamps: true });

export const Video = mongoose.model("Video" , videoSchema)
