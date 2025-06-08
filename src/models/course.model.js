import mongoose , {Schema} from "mongoose";

const courseSchema = new Schema({
    name : {
        type : String , 
        required : true , 
    },

    videos : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video"
        },
    ]

} , {timestamps : true })

export const Course = mongoose.model("Course" , courseSchema)