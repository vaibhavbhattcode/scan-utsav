import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  eventId: string;
  uploaderName: string;
  wishMessage?: string;
  url: string;
  mediaType: "photo" | "video";
  status: "approved" | "pending" | "rejected";
  reactions: {
    love: number;
    fire: number;
    party: number;
    clap: number;
  };
  comments: {
    id: string;
    author: string;
    text: string;
    createdAt: Date;
  }[];
  aiTags: string[];
  isDuplicateFlagged: boolean;
  fileSizeBytes: number;
  createdAt: Date;
}

const MediaSchema: Schema = new Schema({
  eventId: { type: String, required: true },
  uploaderName: { type: String, default: "Guest" },
  wishMessage: { type: String },
  url: { type: String, required: true },
  mediaType: { type: String, enum: ["photo", "video"], default: "photo" },
  status: { type: String, enum: ["approved", "pending", "rejected"], default: "approved" },
  reactions: {
    love: { type: Number, default: 0 },
    fire: { type: Number, default: 0 },
    party: { type: Number, default: 0 },
    clap: { type: Number, default: 0 },
  },
  comments: [
    {
      id: { type: String },
      author: { type: String },
      text: { type: String },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  aiTags: [{ type: String }],
  isDuplicateFlagged: { type: Boolean, default: false },
  fileSizeBytes: { type: Number, default: 2450000 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
