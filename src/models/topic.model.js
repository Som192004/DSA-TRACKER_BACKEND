import moongose , {Schema} from "mongoose"

const topicSchema = new Schema({
    topicName : {
        type : String ,
        required : true , 
    },
    numberOfProblems : {
        type : Number ,
        required : true , 
        default : 0 ,
    }
} ,{timestamps : true})

export const Topic = moongose.model("Topic" , topicSchema)