import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    username : {
        type : String,
        required : true , 
        unique : true ,
        lowercase : true , 
        trim : true ,
        index : true ,
    },
    email : {
        type : String ,
        required : true ,
        unique : true ,
        lowercase : true ,
        trim : true ,
    },
    fullname : {
        type : String ,
        required : true ,
        trim : true ,
        index : true , 
    },
    password : {
        type : String , 
        required :[true , "Password is required "]
    },
    collegeName : {
        type : String ,
        required : true ,
        trim : true ,
        index : true , 
    },
    leetCodeId : {
        type : String ,
        required : true , 
    },
    role : {
        type : String , 
        default : "User",
    }
} ,
    {
        timestamps : true , 
    }
)

userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")){
        return next() ;
    }
    this.password = await bcrypt.hash(this.password , 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = async function (password){
    return jwt.sign({
        _id : this._id,
        email:this.email ,
        username : this.username ,
        fullname : this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET , {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}

export const User = mongoose.model("User" , userSchema)