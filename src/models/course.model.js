import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
}, { timestamps: true });

export const Course = mongoose.model('Course', courseSchema);
