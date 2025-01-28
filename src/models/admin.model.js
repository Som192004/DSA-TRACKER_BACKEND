import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const adminSchema = new Schema({
    adminname : {
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
    password : {
        type : String , 
        required :[true , "Password is required "]
    },
    role : {
        type : String ,
        default : "Admin"
    }
} ,
    {
        timestamps : true , 
    }
)

adminSchema.pre("save" , async function (next) {
    if(!this.isModified("password")){
        return next() ;
    }
    this.password = await bcrypt.hash(this.password , 10)
    next()
})

adminSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password);
}

adminSchema.methods.generateAccessToken = async function (password){
    return jwt.sign({
        _id : this._id,
        email:this.email ,
        adminname : this.adminname ,
    },
    process.env.ACCESS_TOKEN_SECRET , {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}



export const Admin = mongoose.model("Admin" , adminSchema)