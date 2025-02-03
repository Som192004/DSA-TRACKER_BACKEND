import mongoose , {Schema} from "mongoose";

const problemSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  topicName : {
    type : String ,
    required : true , 
  },
  link: {
    type: String,
    required: true,
  },
  problemNumber : {
    type : Number ,
    required : true ,
  }
}, { timestamps: true });

export const Problem = mongoose.model("Problem" , problemSchema)
