import mongoose , {Schema} from "mongoose";

const courseProgressSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  list : [
    {
      video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true,
      },
      status: {
        type: String,
        enum: ['Watched', 'NotWatched'],
        default : "NotWatched"
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

courseProgressSchema.pre("save", function (next) {
  this.list = this.list.map((item) => ({
    video: item.video,
    status: item.status || "NotWatched",
    notes: item.notes || "",
    isBookmarked: item.isBookmarked ?? false,
  }));
  next();
});

export const CourseProgress = mongoose.model("CourseProgress" , courseProgressSchema)
