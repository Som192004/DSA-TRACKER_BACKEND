
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
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const Problem = mongoose.model("Problem" , problemSchema)
