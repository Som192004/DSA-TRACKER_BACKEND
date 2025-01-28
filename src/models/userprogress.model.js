import mongoose , {Schema} from "mongoose";

const userProgressSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  list : [
    {
      problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
      },
      status: {
        type: String,
        enum: ['Solved', 'Attempted', 'Skipped'],
        default : "Skipped"
      },
      notes: {
        type: String,
        trim: true,
        default : "" ,
      },
      isBookmarked: {
        type: Boolean,
        default: false,
      },
    }
  ]
  
}, { timestamps: true });

userProgressSchema.pre("save", function (next) {
  this.list = this.list.map((item) => ({
    problem: item.problem,
    status: item.status || "Skipped",
    notes: item.notes || "",
    isBookmarked: item.isBookmarked ?? false,
  }));
  next();
});

export const UserProgress = mongoose.model("UserProgress" , userProgressSchema)






