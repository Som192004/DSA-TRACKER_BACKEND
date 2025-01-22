import mongoose , {Schema} from "mongoose";

const topicSchema = new Schema({
    name : {
        type : String , 
        required : true , 
    },

    problems : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Problem"
        }
    ]

} , {timestamps : true })

export const Topic = mongoose.model("Topic" , topicSchema)