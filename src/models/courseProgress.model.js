import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  watchedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
}, { timestamps: true });

export const Progress = mongoose.model('Progress', progressSchema);
