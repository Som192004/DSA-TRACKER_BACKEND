import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  duration: Number
}, { timestamps: true });

export const Video = mongoose.model('Video', videoSchema);
