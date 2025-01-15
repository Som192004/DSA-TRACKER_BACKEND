import mongoose , {Schema} from "mongoose";
const userProgressSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  status: {
    type: String,
    enum: ['Solved', 'Attempted', 'Skipped'],
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  isBookmarked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export const UserProgress = mongoose.model("UserProgress" , userProgressSchema)
