import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  eventId: string;
  uploaderName: string;
  wishMessage?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
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
  isFeatured: boolean;
  fileSizeBytes: number;
  createdAt: Date;
  
  // AI Face Recognition
  aiProcessingStatus: "pending" | "processing" | "completed" | "failed";
  faceCount: number;
  faces: {
    embedding: number[];
    box: number[];
    detScore: number;
  }[];
}

const MediaSchema: Schema = new Schema({
  eventId: { type: String, required: true },
  uploaderName: { type: String, default: "Guest" },
  wishMessage: { type: String },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "video"], default: "image" },
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
  isFeatured: { type: Boolean, default: false },
  fileSizeBytes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  
  aiProcessingStatus: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
  faceCount: { type: Number, default: 0 },
  faces: [
    {
      embedding: [{ type: Number }],
      box: [{ type: Number }],
      detScore: { type: Number }
    }
  ]
});

MediaSchema.index({ eventId: 1, createdAt: -1 });
MediaSchema.index({ eventId: 1, status: 1, createdAt: -1 });

export default mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
